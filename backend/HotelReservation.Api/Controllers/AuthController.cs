using HotelReservation.Api.DTOs;
using HotelReservation.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HotelReservation.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto request)
    {
        try
        {
            await _authService.RegisterAsync(request);
            return Ok(new { message = "User registered successfully." });
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto request)
    {
        AuthResponseDto? response = await _authService.LoginAsync(request);
        return response is null
            ? Unauthorized(new { message = "Invalid email or password." })
            : Ok(response);
    }
}
