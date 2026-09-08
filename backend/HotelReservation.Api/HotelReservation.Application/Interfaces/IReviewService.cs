using HotelReservation.Application.DTOs.Reviews;

namespace HotelReservation.Application.Interfaces;

public interface IReviewService
{
    Task<IReadOnlyList<ReviewResponseDto>> GetHotelReviewsAsync(int hotelId);
    Task<ReviewResponseDto> CreateReviewAsync(int hotelId, int userId, CreateReviewRequestDto request);
}
