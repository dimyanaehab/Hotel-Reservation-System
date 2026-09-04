using HotelReservation.Api.Data;
using HotelReservation.Api.DTOs.RoomInventory;
using HotelReservation.Api.DTOs.RoomTypes;
using HotelReservation.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelReservation.Api.Services;

public class RoomService : IRoomService
{
    private readonly ApplicationDbContext _context;

    public RoomService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<RoomTypeDto>?> GetRoomTypesByHotelAsync(int hotelId)
    {
        bool hotelExists = await _context.Hotels
            .AnyAsync(hotel => hotel.Id == hotelId);

        if (!hotelExists)
        {
            return null;
        }

        return await _context.RoomTypes
            .AsNoTracking()
            .Where(roomType => roomType.HotelId == hotelId)
            .OrderBy(roomType => roomType.Name)
            .Select(roomType => new RoomTypeDto
            {
                Id = roomType.Id,
                HotelId = roomType.HotelId,
                Name = roomType.Name,
                Capacity = roomType.Capacity,
                BedType = roomType.BedType,
                BasePrice = roomType.BasePrice,
                Description = roomType.Description
            })
            .ToListAsync();
    }

    public async Task<RoomTypeDto?> GetRoomTypeByIdAsync(int roomTypeId)
    {
        return await _context.RoomTypes
            .AsNoTracking()
            .Where(roomType => roomType.Id == roomTypeId)
            .Select(roomType => new RoomTypeDto
            {
                Id = roomType.Id,
                HotelId = roomType.HotelId,
                Name = roomType.Name,
                Capacity = roomType.Capacity,
                BedType = roomType.BedType,
                BasePrice = roomType.BasePrice,
                Description = roomType.Description
            })
            .FirstOrDefaultAsync();
    }

    public async Task<RoomTypeDto?> CreateRoomTypeAsync(
        int hotelId,
        CreateRoomTypeDto dto)
    {
        bool hotelExists = await _context.Hotels
            .AnyAsync(hotel => hotel.Id == hotelId);

        if (!hotelExists)
        {
            return null;
        }

        string roomTypeName = dto.Name.Trim();

        bool duplicateName = await _context.RoomTypes.AnyAsync(roomType =>
            roomType.HotelId == hotelId &&
            roomType.Name == roomTypeName);

        if (duplicateName)
        {
            return null;
        }

        var roomType = new RoomType
        {
            HotelId = hotelId,
            Name = roomTypeName,
            Capacity = dto.Capacity,
            BedType = dto.BedType.Trim(),
            BasePrice = dto.BasePrice,
            Description = dto.Description?.Trim()
        };

        _context.RoomTypes.Add(roomType);
        await _context.SaveChangesAsync();

        return MapRoomType(roomType);
    }

    public async Task<RoomTypeDto?> UpdateRoomTypeAsync(
        int roomTypeId,
        UpdateRoomTypeDto dto)
    {
        RoomType? roomType = await _context.RoomTypes
            .FirstOrDefaultAsync(roomType => roomType.Id == roomTypeId);

        if (roomType is null)
        {
            return null;
        }

        string roomTypeName = dto.Name.Trim();

        bool duplicateName = await _context.RoomTypes.AnyAsync(otherRoomType =>
            otherRoomType.HotelId == roomType.HotelId &&
            otherRoomType.Name == roomTypeName &&
            otherRoomType.Id != roomTypeId);

        if (duplicateName)
        {
            return null;
        }

        roomType.Name = roomTypeName;
        roomType.Capacity = dto.Capacity;
        roomType.BedType = dto.BedType.Trim();
        roomType.BasePrice = dto.BasePrice;
        roomType.Description = dto.Description?.Trim();

        await _context.SaveChangesAsync();

        return MapRoomType(roomType);
    }

    public async Task<RoomTypeDeleteResult> DeleteRoomTypeAsync(int roomTypeId)
    {
        RoomType? roomType = await _context.RoomTypes
            .FirstOrDefaultAsync(roomType => roomType.Id == roomTypeId);

        if (roomType is null)
        {
            return RoomTypeDeleteResult.NotFound;
        }

        bool hasInventory = await _context.RoomInventories
            .AnyAsync(inventory => inventory.RoomTypeId == roomTypeId);

        if (hasInventory)
        {
            return RoomTypeDeleteResult.HasRelatedInventory;
        }

        bool hasBookings = await _context.Bookings
            .AnyAsync(booking => booking.RoomTypeId == roomTypeId);

        if (hasBookings)
        {
            return RoomTypeDeleteResult.HasRelatedBookings;
        }

        _context.RoomTypes.Remove(roomType);
        await _context.SaveChangesAsync();

        return RoomTypeDeleteResult.Deleted;
    }

    public async Task<RoomInventoryDto?> UpdateInventoryAsync(
        UpdateRoomInventoryDto dto)
    {
        if (dto.TotalRooms < 0 ||
            dto.SoldRooms < 0 ||
            dto.SoldRooms > dto.TotalRooms)
        {
            return null;
        }

        bool roomTypeExists = await _context.RoomTypes
            .AnyAsync(roomType => roomType.Id == dto.RoomTypeId);

        if (!roomTypeExists)
        {
            return null;
        }

        RoomInventory? inventory = await _context.RoomInventories
            .FirstOrDefaultAsync(inventory =>
                inventory.RoomTypeId == dto.RoomTypeId &&
                inventory.Date == dto.Date);

        if (inventory is null)
        {
            inventory = new RoomInventory
            {
                RoomTypeId = dto.RoomTypeId,
                Date = dto.Date,
                TotalRooms = dto.TotalRooms,
                SoldRooms = dto.SoldRooms
            };

            _context.RoomInventories.Add(inventory);
        }
        else
        {
            inventory.TotalRooms = dto.TotalRooms;
            inventory.SoldRooms = dto.SoldRooms;
        }

        await _context.SaveChangesAsync();

        return new RoomInventoryDto
        {
            Id = inventory.Id,
            RoomTypeId = inventory.RoomTypeId,
            Date = inventory.Date,
            TotalRooms = inventory.TotalRooms,
            SoldRooms = inventory.SoldRooms,
            AvailableRooms = inventory.TotalRooms - inventory.SoldRooms
        };
    }

    public async Task<RoomAvailabilityDto?> CheckAvailabilityAsync(
        int roomTypeId,
        DateOnly from,
        DateOnly to)
    {
        if (from >= to)
        {
            return null;
        }

        bool roomTypeExists = await _context.RoomTypes
            .AnyAsync(roomType => roomType.Id == roomTypeId);

        if (!roomTypeExists)
        {
            return null;
        }

        List<RoomInventory> inventoryRows = await _context.RoomInventories
            .AsNoTracking()
            .Where(inventory =>
                inventory.RoomTypeId == roomTypeId &&
                inventory.Date >= from &&
                inventory.Date < to)
            .ToListAsync();

        var dailyAvailability = new List<DailyAvailabilityDto>();
        int minimumAvailableRooms = int.MaxValue;

        for (DateOnly date = from; date < to; date = date.AddDays(1))
        {
            RoomInventory? inventory = inventoryRows
                .FirstOrDefault(row => row.Date == date);

            var dailyResult = new DailyAvailabilityDto
            {
                Date = date
            };

            if (inventory is null)
            {
                dailyResult.TotalRooms = 0;
                dailyResult.SoldRooms = 0;
                dailyResult.AvailableRooms = 0;
                dailyResult.HasInventory = false;
            }
            else
            {
                dailyResult.TotalRooms = inventory.TotalRooms;
                dailyResult.SoldRooms = inventory.SoldRooms;
                dailyResult.AvailableRooms =
                    inventory.TotalRooms - inventory.SoldRooms;
                dailyResult.HasInventory = true;
            }

            if (dailyResult.AvailableRooms < minimumAvailableRooms)
            {
                minimumAvailableRooms = dailyResult.AvailableRooms;
            }

            dailyAvailability.Add(dailyResult);
        }

        return new RoomAvailabilityDto
        {
            RoomTypeId = roomTypeId,
            From = from,
            To = to,
            Available = minimumAvailableRooms > 0,
            AvailableRooms = minimumAvailableRooms,
            DailyAvailability = dailyAvailability
        };
    }

    private static RoomTypeDto MapRoomType(RoomType roomType)
    {
        return new RoomTypeDto
        {
            Id = roomType.Id,
            HotelId = roomType.HotelId,
            Name = roomType.Name,
            Capacity = roomType.Capacity,
            BedType = roomType.BedType,
            BasePrice = roomType.BasePrice,
            Description = roomType.Description
        };
    }
}
