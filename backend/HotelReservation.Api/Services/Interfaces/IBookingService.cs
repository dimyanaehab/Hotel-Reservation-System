using HotelReservation.Api.DTOs.Bookings;
using HotelReservation.Api.Enums;

namespace HotelReservation.Api.Services.Interfaces;

public interface IBookingService
{
    Task<BookingResponseDto> CreateBookingAsync(
        int userId,
        CreateBookingRequestDto request);

    Task<IReadOnlyList<BookingResponseDto>> GetMyBookingsAsync(
        int userId);

    Task<BookingResponseDto> CancelBookingAsync(
        int bookingId,
        int userId);

    Task<IReadOnlyList<AdminBookingResponseDto>> GetAdminBookingsAsync(
        BookingStatus? status);

    Task<AdminBookingResponseDto> ConfirmBookingAsync(
        int bookingId);

    Task<AdminBookingResponseDto> RejectBookingAsync(
        int bookingId);
}