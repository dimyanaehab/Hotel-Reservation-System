using HotelReservation.Api.DTOs.RoomInventory;
using HotelReservation.Api.DTOs.RoomTypes;
using HotelReservation.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelReservation.Api.Controllers;

[ApiController]
[Route("api/admin/room-inventory")]
public class RoomInventoryController : ControllerBase
{
    private readonly IRoomService _roomService;

    public RoomInventoryController(IRoomService roomService)
    {
        _roomService = roomService;
    }

    // TODO: Add admin authorization after the authentication module is merged.
    [HttpPut]
    public async Task<ActionResult<RoomInventoryDto>> UpdateInventory(
        UpdateRoomInventoryDto dto)
    {
        if (dto.SoldRooms > dto.TotalRooms)
        {
            return BadRequest("Sold rooms cannot be greater than total rooms.");
        }

        RoomTypeDto? roomType =
            await _roomService.GetRoomTypeByIdAsync(dto.RoomTypeId);

        if (roomType is null)
        {
            return NotFound("Room type not found.");
        }

        RoomInventoryDto? inventory =
            await _roomService.UpdateInventoryAsync(dto);

        if (inventory is null)
        {
            return BadRequest("The inventory could not be updated.");
        }

        return Ok(inventory);
    }
}
