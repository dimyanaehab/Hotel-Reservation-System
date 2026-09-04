namespace HotelReservation.Api.DTOs.RoomInventory;

public class DailyAvailabilityDto
{
    public DateOnly Date { get; set; }

    public int TotalRooms { get; set; }

    public int SoldRooms { get; set; }

    public int AvailableRooms { get; set; }

    public bool HasInventory { get; set; }
}
