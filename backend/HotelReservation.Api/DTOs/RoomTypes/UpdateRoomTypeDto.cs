using System.ComponentModel.DataAnnotations;

namespace HotelReservation.Api.DTOs.RoomTypes;

public class UpdateRoomTypeDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int Capacity { get; set; }

    [Required]
    [MaxLength(100)]
    public string BedType { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal BasePrice { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }
}
