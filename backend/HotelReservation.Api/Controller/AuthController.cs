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
            string email = request.Email.Trim().ToLowerInvariant();
            string name = request.Name.Trim();

            if (name.Length < 2)
            {
                return ValidationProblem(new ValidationProblemDetails(
                    new Dictionary<string, string[]>
                    {
                        ["Name"] = ["Name must contain at least 2 characters."]
                    }));
            }

            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == email))
            {
                return Conflict(new { message = "An account with this email already exists." });
            }

            // Map request data to the User model and securely hash the password using BCrypt
            var user = new User
            {
                Name = name,
                Email = email,
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
            string email = request.Email.Trim().ToLowerInvariant();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password." });
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
            string keyValue = _configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("JWT signing key is not configured.");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyValue));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            // Assemble the token with claims, expiration period, and signing credentials
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: creds
            );

            // Serialize the token into a string format to return to the client
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
