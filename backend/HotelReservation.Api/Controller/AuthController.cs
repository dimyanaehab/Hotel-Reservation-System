using Microsoft.AspNetCore.Mvc;
using HotelReservation.Api.Data;
using HotelReservation.Api.DTOs;
using HotelReservation.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HotelReservation.Api.Enums;

namespace HotelReservation.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        // Injects the database context and app configuration to handle environment and connection data
        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // Handles user registration, password hashing, and duplicate email checks
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto request)
        {
            // Verify if a user with this email already exists in the database
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest("User already exists.");
            }

            // Map request data to the User model and securely hash the password using BCrypt
            var user = new User
            {
                Name = request.Name,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = UserRole.User // Assign default user role enum
            };

            // Save the new user entity to the database
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User registered successfully." });
        }

        // Handles user login credentials verification and triggers token generation upon success
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto request)
        {
            // Find user by email and verify the password hash against the stored record
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized("Invalid email or password.");
            }

            // Generate and return a JWT access token for authenticated requests
            var token = CreateToken(user);
            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.Name,
                    user.Email,
                    role = user.Role.ToString().ToUpperInvariant()
                }
            });
        }

        // Helper method to construct JWT security tokens containing user claims, roles, and signature credentials
        private string CreateToken(User user)
        {
            // Define claims embedded into the token for identification and role-based authorization
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            // Fetch the secret key from configuration and create a secure HMAC-SHA512 signing credential
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            // Assemble the token with claims, expiration period, and signing credentials
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            // Serialize the token into a string format to return to the client
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
