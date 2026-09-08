using HotelReservation.Application.DTOs.RoomInventory;
using HotelReservation.Application.DTOs.RoomTypes;

namespace HotelReservation.Application.Interfaces;

public interface IRoomService
{
    Task<List<RoomTypeDto>?> GetRoomTypesByHotelAsync(int hotelId);

    Task<RoomTypeDto?> GetRoomTypeByIdAsync(int roomTypeId);

    Task<RoomTypeDto?> CreateRoomTypeAsync(
        int hotelId,
        CreateRoomTypeDto dto);

    Task<RoomTypeDto?> UpdateRoomTypeAsync(
        int roomTypeId,
        UpdateRoomTypeDto dto);

    Task<RoomTypeDeleteResult> DeleteRoomTypeAsync(int roomTypeId);

    Task<RoomInventoryDto?> UpdateInventoryAsync(
        UpdateRoomInventoryDto dto);

    Task<RoomAvailabilityDto?> CheckAvailabilityAsync(
        int roomTypeId,
        DateOnly from,
        DateOnly to);
}

public enum RoomTypeDeleteResult
{
    Deleted,
    NotFound,
    HasRelatedInventory,
    HasRelatedBookings
}
