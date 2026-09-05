using HotelReservation.Api.DTOs.RoomInventory;
using HotelReservation.Api.DTOs.RoomTypes;
using HotelReservation.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelReservation.Api.Controllers;

[ApiController]
[Route("api")]
public class RoomTypesController : ControllerBase
{
    private readonly IRoomService _roomService;

    public RoomTypesController(IRoomService roomService)
    {
        _roomService = roomService;
    }

    [HttpGet("hotels/{hotelId:int}/room-types")]
    public async Task<ActionResult<List<RoomTypeDto>>> GetRoomTypesByHotel(
        int hotelId)
    {
        List<RoomTypeDto>? roomTypes =
            await _roomService.GetRoomTypesByHotelAsync(hotelId);

        if (roomTypes is null)
        {
            return NotFound("Hotel not found.");
        }

        return Ok(roomTypes);
    }

    [HttpGet("room-types/{id:int}")]
    public async Task<ActionResult<RoomTypeDto>> GetRoomType(int id)
    {
        RoomTypeDto? roomType = await _roomService.GetRoomTypeByIdAsync(id);

        if (roomType is null)
        {
            return NotFound("Room type not found.");
        }

        return Ok(roomType);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("admin/hotels/{hotelId:int}/room-types")]
    public async Task<ActionResult<RoomTypeDto>> CreateRoomType(
        int hotelId,
        CreateRoomTypeDto dto)
    {
        List<RoomTypeDto>? existingRoomTypes =
            await _roomService.GetRoomTypesByHotelAsync(hotelId);

        if (existingRoomTypes is null)
        {
            return NotFound("Hotel not found.");
        }

        string requestedName = dto.Name.Trim();
        bool duplicateName = existingRoomTypes.Any(roomType =>
            string.Equals(
                roomType.Name,
                requestedName,
                StringComparison.OrdinalIgnoreCase));

        if (duplicateName)
        {
            return Conflict("A room type with this name already exists for the hotel.");
        }

        RoomTypeDto? createdRoomType =
            await _roomService.CreateRoomTypeAsync(hotelId, dto);

        if (createdRoomType is null)
        {
            return BadRequest("The room type could not be created.");
        }

        return CreatedAtAction(
            nameof(GetRoomType),
            new { id = createdRoomType.Id },
            createdRoomType);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("admin/room-types/{id:int}")]
    public async Task<ActionResult<RoomTypeDto>> UpdateRoomType(
        int id,
        UpdateRoomTypeDto dto)
    {
        RoomTypeDto? existingRoomType =
            await _roomService.GetRoomTypeByIdAsync(id);

        if (existingRoomType is null)
        {
            return NotFound("Room type not found.");
        }

        List<RoomTypeDto>? hotelRoomTypes =
            await _roomService.GetRoomTypesByHotelAsync(existingRoomType.HotelId);

        string requestedName = dto.Name.Trim();
        bool duplicateName = hotelRoomTypes is not null &&
            hotelRoomTypes.Any(roomType =>
                roomType.Id != id &&
                string.Equals(
                    roomType.Name,
                    requestedName,
                    StringComparison.OrdinalIgnoreCase));

        if (duplicateName)
        {
            return Conflict("A room type with this name already exists for the hotel.");
        }

        RoomTypeDto? updatedRoomType =
            await _roomService.UpdateRoomTypeAsync(id, dto);

        if (updatedRoomType is null)
        {
            return BadRequest("The room type could not be updated.");
        }

        return Ok(updatedRoomType);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("admin/room-types/{id:int}")]
    public async Task<IActionResult> DeleteRoomType(int id)
    {
        RoomTypeDeleteResult result =
            await _roomService.DeleteRoomTypeAsync(id);

        if (result == RoomTypeDeleteResult.NotFound)
        {
            return NotFound("Room type not found.");
        }

        if (result == RoomTypeDeleteResult.HasRelatedInventory)
        {
            return Conflict("Delete the related inventory records first.");
        }

        if (result == RoomTypeDeleteResult.HasRelatedBookings)
        {
            return Conflict("This room type has related bookings and cannot be deleted.");
        }

        return NoContent();
    }

    [HttpGet("room-types/{id:int}/availability")]
    public async Task<ActionResult<RoomAvailabilityDto>> CheckAvailability(
        int id,
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to)
    {
        if (!from.HasValue || !to.HasValue)
        {
            return BadRequest("Both from and to dates are required.");
        }

        if (from.Value >= to.Value)
        {
            return BadRequest("The from date must be earlier than the to date.");
        }

        RoomTypeDto? roomType = await _roomService.GetRoomTypeByIdAsync(id);

        if (roomType is null)
        {
            return NotFound("Room type not found.");
        }

        RoomAvailabilityDto? availability =
            await _roomService.CheckAvailabilityAsync(
                id,
                from.Value,
                to.Value);

        if (availability is null)
        {
            return BadRequest("Availability could not be checked.");
        }

        return Ok(availability);
    }
}
