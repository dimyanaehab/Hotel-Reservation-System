using HotelReservation.Application.DTOs.Hotels;

namespace HotelReservation.Application.Interfaces;

public interface IHotelService
{
    Task<List<HotelResponseDto>> GetAllAsync(
        string? city,
        DateOnly? checkIn,
        DateOnly? checkOut,
        int? guests);

    Task<HotelResponseDto?> GetByIdAsync(int id);

    Task<(HotelResponseDto? Hotel, string? Error)> AddAsync(
        CreateHotelDto dto);

    Task<(HotelResponseDto? Hotel, string? Error)> UpdateAsync(
        int id,
        UpdateHotelDto dto);

    Task<bool> DeleteAsync(int id);
}
