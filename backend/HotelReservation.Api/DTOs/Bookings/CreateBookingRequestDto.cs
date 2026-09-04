using System.ComponentModel.DataAnnotations;

namespace HotelReservation.Api.DTOs.Bookings;

public class CreateBookingRequestDto
{
    [Range(1, int.MaxValue)]
    public int RoomTypeId { get; set; }

    public DateOnly CheckIn { get; set; }

    public DateOnly CheckOut { get; set; }

    [Range(1, int.MaxValue)]
    public int NumberOfGuests { get; set; }
}
