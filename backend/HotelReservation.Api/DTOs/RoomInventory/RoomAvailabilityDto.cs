namespace HotelReservation.Api.DTOs.RoomInventory;

public class RoomAvailabilityDto
{
    public int RoomTypeId { get; set; }

    public DateOnly From { get; set; }

    public DateOnly To { get; set; }

    public bool Available { get; set; }

    public int AvailableRooms { get; set; }

    public List<DailyAvailabilityDto> DailyAvailability { get; set; } = [];
}
