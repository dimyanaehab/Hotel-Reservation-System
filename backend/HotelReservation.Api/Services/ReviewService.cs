using HotelReservation.Api.Data;
using HotelReservation.Api.DTOs.Reviews;
using HotelReservation.Api.Enums;
using HotelReservation.Api.Models;
using HotelReservation.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HotelReservation.Api.Services;

public class ReviewService : IReviewService
{
    private readonly ApplicationDbContext _context;
    public ReviewService(ApplicationDbContext context) => _context = context;

    public async Task<IReadOnlyList<ReviewResponseDto>> GetHotelReviewsAsync(int hotelId)
    {
        if (!await _context.Hotels.AnyAsync(hotel => hotel.Id == hotelId))
            throw new KeyNotFoundException("Hotel was not found.");

        return await _context.Reviews.AsNoTracking()
            .Include(review => review.User)
            .Where(review => review.HotelId == hotelId)
            .OrderByDescending(review => review.CreatedAt)
            .Select(review => Map(review))
            .ToListAsync();
    }

    public async Task<ReviewResponseDto> CreateReviewAsync(
        int hotelId, int userId, CreateReviewRequestDto request)
    {
        Booking? booking = await _context.Bookings
            .Include(item => item.Review)
            .FirstOrDefaultAsync(item => item.Id == request.BookingId);

        if (booking is null) throw new KeyNotFoundException("Booking was not found.");
        if (booking.UserId != userId) throw new UnauthorizedAccessException("You cannot review another user's booking.");
        if (booking.HotelId != hotelId) throw new ArgumentException("The booking does not belong to this hotel.");
        if (booking.Status != BookingStatus.Completed) throw new InvalidOperationException("Only completed stays can be reviewed.");
        if (booking.Review is not null) throw new InvalidOperationException("This booking has already been reviewed.");

        var review = new Review
        {
            UserId = userId,
            HotelId = hotelId,
            BookingId = booking.Id,
            Rating = request.Rating,
            Comment = string.IsNullOrWhiteSpace(request.Comment) ? null : request.Comment.Trim()
        };
        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();
        await _context.Entry(review).Reference(item => item.User).LoadAsync();
        return Map(review);
    }

    private static ReviewResponseDto Map(Review review) => new()
    {
        Id = review.Id,
        HotelId = review.HotelId,
        BookingId = review.BookingId,
        UserId = review.UserId,
        UserName = review.User.Name,
        Rating = review.Rating,
        Comment = review.Comment,
        CreatedAt = review.CreatedAt
    };
}
