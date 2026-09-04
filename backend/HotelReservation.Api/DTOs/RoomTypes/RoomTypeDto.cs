namespace HotelReservation.Api.DTOs.RoomTypes;

public class RoomTypeDto
{
    public int Id { get; set; }

    public int HotelId { get; set; }

    public string Name { get; set; } = string.Empty;

    public int Capacity { get; set; }

    public string BedType { get; set; } = string.Empty;

    public decimal BasePrice { get; set; }

    public string? Description { get; set; }
}
