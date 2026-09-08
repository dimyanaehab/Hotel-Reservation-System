using System.ComponentModel.DataAnnotations;

namespace HotelReservation.Application.DTOs.Hotels;

public class UpdateHotelDto
{
    [Required]
    [StringLength(150, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string City { get; set; } = string.Empty;

    [Required]
    [StringLength(300, MinimumLength = 2)]
    public string Address { get; set; } = string.Empty;

    [StringLength(2000)]
    public string? Description { get; set; }

    [Range(1, 5)]
    public int Stars { get; set; }

    [Url]
    [StringLength(2048)]
    public string? ThumbnailUrl { get; set; }
}
