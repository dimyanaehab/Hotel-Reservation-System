using HotelReservation.Application.DTOs;

namespace HotelReservation.Application.Interfaces;

public interface IAuthService
{
    Task RegisterAsync(RegisterDto request);

    Task<AuthResponseDto?> LoginAsync(LoginDto request);
}
