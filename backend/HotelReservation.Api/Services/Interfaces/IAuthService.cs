using HotelReservation.Api.DTOs;

namespace HotelReservation.Api.Services.Interfaces;

public interface IAuthService
{
    Task RegisterAsync(RegisterDto request);

    Task<AuthResponseDto?> LoginAsync(LoginDto request);
}
