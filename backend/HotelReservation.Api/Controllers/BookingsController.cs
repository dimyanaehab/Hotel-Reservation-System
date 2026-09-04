using System.Security.Claims;
using HotelReservation.Api.DTOs.Bookings;
using HotelReservation.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelReservation.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/bookings")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingsController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    [HttpPost]
    public async Task<ActionResult<BookingResponseDto>> CreateBooking(
        CreateBookingRequestDto request)
    {
        int? userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized(new
            {
                message = "The user ID is missing from the token."
            });
        }

        try
        {
            BookingResponseDto booking =
                await _bookingService.CreateBookingAsync(
                    userId.Value,
                    request);

            return StatusCode(StatusCodes.Status201Created, booking);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new
            {
                message = exception.Message
            });
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new
            {
                message = exception.Message
            });
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new
            {
                message = exception.Message
            });
        }
    }

    [HttpGet("/api/me/bookings")]
    public async Task<ActionResult<
        IReadOnlyList<BookingResponseDto>>> GetMyBookings()
    {
        int? userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized(new
            {
                message = "The user ID is missing from the token."
            });
        }

        IReadOnlyList<BookingResponseDto> bookings =
            await _bookingService.GetMyBookingsAsync(userId.Value);

        return Ok(bookings);
    }

    [HttpPatch("{id:int}/cancel")]
    public async Task<ActionResult<BookingResponseDto>> CancelBooking(
        int id)
    {
        int? userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized(new
            {
                message = "The user ID is missing from the token."
            });
        }

        try
        {
            BookingResponseDto booking =
                await _bookingService.CancelBookingAsync(
                    id,
                    userId.Value);

            return Ok(booking);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new
            {
                message = exception.Message
            });
        }
        catch (UnauthorizedAccessException exception)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new
                {
                    message = exception.Message
                });
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new
            {
                message = exception.Message
            });
        }
    }

    private int? GetCurrentUserId()
    {
        string? userIdValue =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out int userId))
        {
            return null;
        }

        return userId;
    }
}