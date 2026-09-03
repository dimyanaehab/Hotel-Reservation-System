using HotelReservation.Api.Enums;

namespace HotelReservation.Api.Models;

public class Booking
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int HotelId { get; set; }

    public int RoomTypeId { get; set; }

    public DateOnly CheckIn { get; set; }

    public DateOnly CheckOut { get; set; }

    public int Nights { get; set; }

    public int NumberOfGuests { get; set; }

    public decimal TotalPrice { get; set; }

    public BookingStatus Status { get; set; } = BookingStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;

    public Hotel Hotel { get; set; } = null!;

    public RoomType RoomType { get; set; } = null!;

    public Review? Review { get; set; }
}