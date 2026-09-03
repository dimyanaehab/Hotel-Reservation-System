namespace HotelReservation.Api.Models;

public class Review
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int HotelId { get; set; }

    public int BookingId { get; set; }

    public int Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;

    public Hotel Hotel { get; set; } = null!;

    public Booking Booking { get; set; } = null!;
}