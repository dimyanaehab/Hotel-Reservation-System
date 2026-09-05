using System.ComponentModel.DataAnnotations;

namespace HotelReservation.Api.DTOs.Reviews;

public class CreateReviewRequestDto
{
    [Range(1, int.MaxValue)]
    public int BookingId { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(1000)]
    public string? Comment { get; set; }
}
