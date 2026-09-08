using System.ComponentModel.DataAnnotations;

namespace HotelReservation.Application.DTOs.RoomInventory;

public class UpdateRoomInventoryDto
{
    [Range(1, int.MaxValue)]
    public int RoomTypeId { get; set; }

    public DateOnly Date { get; set; }

    [Range(0, int.MaxValue)]
    public int TotalRooms { get; set; }

    [Range(0, int.MaxValue)]
    public int SoldRooms { get; set; }
}
