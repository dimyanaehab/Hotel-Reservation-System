namespace HotelReservation.Api.DTOs.RoomInventory;

public class RoomInventoryDto
{
    public int Id { get; set; }

    public int RoomTypeId { get; set; }

    public DateOnly Date { get; set; }

    public int TotalRooms { get; set; }

    public int SoldRooms { get; set; }

    public int AvailableRooms { get; set; }
}
