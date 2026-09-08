using HotelReservation.Application.DTOs.Hotels;
using HotelReservation.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelReservation.API.Controllers;

[ApiController]
[Route("api")]
public class HotelsController : ControllerBase
{
    private readonly IHotelService _hotelService;

    public HotelsController(IHotelService hotelService)
    {
        _hotelService = hotelService;
    }

    [AllowAnonymous]
    [HttpGet("hotels")]
    public async Task<ActionResult<List<HotelResponseDto>>> GetHotels(
        [FromQuery] string? city)
    {
        List<HotelResponseDto> hotels = await _hotelService.GetAllAsync(city);

        return Ok(hotels);
    }

    [AllowAnonymous]
    [HttpGet("hotels/{id:int}")]
    public async Task<ActionResult<HotelResponseDto>> GetHotel(int id)
    {
        HotelResponseDto? hotel = await _hotelService.GetByIdAsync(id);

        if (hotel is null)
        {
            return NotFound("Hotel not found.");
        }

        return Ok(hotel);
    }
}
