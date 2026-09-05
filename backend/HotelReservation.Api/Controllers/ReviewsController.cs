using System.Security.Claims;
using HotelReservation.Api.DTOs.Reviews;
using HotelReservation.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelReservation.Api.Controllers;

[ApiController]
[Route("api/hotels/{hotelId:int}/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviews;
    public ReviewsController(IReviewService reviews) => _reviews = reviews;

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<ReviewResponseDto>>> GetReviews(int hotelId)
    {
        try { return Ok(await _reviews.GetHotelReviewsAsync(hotelId)); }
        catch (KeyNotFoundException exception) { return NotFound(new { message = exception.Message }); }
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ReviewResponseDto>> CreateReview(int hotelId, CreateReviewRequestDto request)
    {
        string? value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(value, out int userId)) return Unauthorized(new { message = "The user ID is missing from the token." });

        try
        {
            ReviewResponseDto review = await _reviews.CreateReviewAsync(hotelId, userId, request);
            return CreatedAtAction(nameof(GetReviews), new { hotelId }, review);
        }
        catch (KeyNotFoundException exception) { return NotFound(new { message = exception.Message }); }
        catch (UnauthorizedAccessException exception) { return StatusCode(403, new { message = exception.Message }); }
        catch (ArgumentException exception) { return BadRequest(new { message = exception.Message }); }
        catch (InvalidOperationException exception) { return Conflict(new { message = exception.Message }); }
    }
}
