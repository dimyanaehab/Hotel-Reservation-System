using HotelReservation.Api.DTOs.Reviews;

namespace HotelReservation.Api.Services.Interfaces;

public interface IReviewService
{
    Task<IReadOnlyList<ReviewResponseDto>> GetHotelReviewsAsync(int hotelId);
    Task<ReviewResponseDto> CreateReviewAsync(int hotelId, int userId, CreateReviewRequestDto request);
}
