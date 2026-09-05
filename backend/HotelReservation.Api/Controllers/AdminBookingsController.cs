using HotelReservation.Api.DTOs.Bookings;
using HotelReservation.Api.Enums;
using HotelReservation.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelReservation.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/bookings")]
public class AdminBookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public AdminBookingsController(
        IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    [HttpGet]
    public async Task<ActionResult<
        IReadOnlyList<AdminBookingResponseDto>>> GetBookings(
            [FromQuery] BookingStatus? status)
    {
        IReadOnlyList<AdminBookingResponseDto> bookings =
            await _bookingService.GetAdminBookingsAsync(status);

        return Ok(bookings);
    }

    [HttpPatch("{id:int}/confirm")]
    public async Task<ActionResult<AdminBookingResponseDto>>
        ConfirmBooking(int id)
    {
        try
        {
            AdminBookingResponseDto booking =
                await _bookingService.ConfirmBookingAsync(id);

            return Ok(booking);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new
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

    [HttpPatch("{id:int}/reject")]
    public async Task<ActionResult<AdminBookingResponseDto>>
        RejectBooking(int id)
    {
        try
        {
            AdminBookingResponseDto booking =
                await _bookingService.RejectBookingAsync(id);

            return Ok(booking);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new
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

    [HttpPatch("{id:int}/cancel")]
    public async Task<ActionResult<AdminBookingResponseDto>> CancelBooking(int id)
    {
        return await RunStatusChange(() => _bookingService.CancelBookingAsAdminAsync(id));
    }

    [HttpPatch("{id:int}/complete")]
    public async Task<ActionResult<AdminBookingResponseDto>> CompleteBooking(int id)
    {
        return await RunStatusChange(() => _bookingService.CompleteBookingAsync(id));
    }

    private async Task<ActionResult<AdminBookingResponseDto>> RunStatusChange(
        Func<Task<AdminBookingResponseDto>> action)
    {
        try
        {
            return Ok(await action());
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(new { message = exception.Message });
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(new { message = exception.Message });
        }
    }
}
