namespace HotelReservation.Api.Models;

public class RoomInventory
{
    public int Id { get; set; }

    public int RoomTypeId { get; set; }

    public DateOnly Date { get; set; }

    public int TotalRooms { get; set; }

    public int SoldRooms { get; set; }

    public RoomType RoomType { get; set; } = null!;
}