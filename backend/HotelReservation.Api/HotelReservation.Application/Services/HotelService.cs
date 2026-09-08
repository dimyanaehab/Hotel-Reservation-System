using HotelReservation.Application.DTOs.Hotels;
using HotelReservation.Application.Interfaces;
using HotelReservation.Domain.Entities;
using HotelReservation.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelReservation.Application.Services;

public class HotelService : IHotelService
{
    private readonly ApplicationDbContext _context;

    public HotelService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<HotelResponseDto>> GetAllAsync(
        string? city,
        DateOnly? checkIn,
        DateOnly? checkOut)
    {
        string? cityFilter = city?.Trim();

        IQueryable<Hotel> hotelsQuery = _context.Hotels
            .AsNoTracking()
            .Where(hotel =>
                string.IsNullOrEmpty(cityFilter) ||
                hotel.City == cityFilter)
            .OrderBy(hotel => hotel.Name);

        if (!checkIn.HasValue || !checkOut.HasValue)
        {
            return await hotelsQuery
                .Select(hotel => new HotelResponseDto
                {
                    Id = hotel.Id,
                    Name = hotel.Name,
                    City = hotel.City,
                    Address = hotel.Address,
                    Description = hotel.Description,
                    Stars = hotel.Stars,
                    ThumbnailUrl = hotel.ThumbnailUrl,
                    CreatedAt = hotel.CreatedAt
                })
                .ToListAsync();
        }

        List<Hotel> hotels = await hotelsQuery
            .Include(hotel => hotel.RoomTypes)
            .ThenInclude(roomType => roomType.RoomInventories
                .Where(inventory =>
                    inventory.Date >= checkIn.Value &&
                    inventory.Date < checkOut.Value))
            .ToListAsync();

        return hotels
            .Where(hotel => hotel.RoomTypes.Any(roomType =>
                HasAvailability(roomType, checkIn.Value, checkOut.Value)))
            .Select(MapHotel)
            .ToList();
    }

    public async Task<HotelResponseDto?> GetByIdAsync(int id)
    {
        return await _context.Hotels
            .AsNoTracking()
            .Where(hotel => hotel.Id == id)
            .Select(hotel => new HotelResponseDto
            {
                Id = hotel.Id,
                Name = hotel.Name,
                City = hotel.City,
                Address = hotel.Address,
                Description = hotel.Description,
                Stars = hotel.Stars,
                ThumbnailUrl = hotel.ThumbnailUrl,
                CreatedAt = hotel.CreatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<(HotelResponseDto? Hotel, string? Error)> AddAsync(
        CreateHotelDto dto)
    {
        string? validationError = Validate(dto.Name, dto.City);

        if (validationError is not null)
        {
            return (null, validationError);
        }

        var hotel = new Hotel
        {
            Name = dto.Name.Trim(),
            City = dto.City.Trim(),
            Address = dto.Address.Trim(),
            Description = dto.Description?.Trim(),
            Stars = dto.Stars,
            ThumbnailUrl = dto.ThumbnailUrl?.Trim()
        };

        _context.Hotels.Add(hotel);
        await _context.SaveChangesAsync();

        return (MapHotel(hotel), null);
    }

    public async Task<(HotelResponseDto? Hotel, string? Error)> UpdateAsync(
        int id,
        UpdateHotelDto dto)
    {
        Hotel? hotel = await _context.Hotels
            .FirstOrDefaultAsync(hotel => hotel.Id == id);

        if (hotel is null)
        {
            return (null, "Hotel not found.");
        }

        string? validationError = Validate(dto.Name, dto.City);

        if (validationError is not null)
        {
            return (null, validationError);
        }

        hotel.Name = dto.Name.Trim();
        hotel.City = dto.City.Trim();
        hotel.Address = dto.Address.Trim();
        hotel.Description = dto.Description?.Trim();
        hotel.Stars = dto.Stars;
        hotel.ThumbnailUrl = dto.ThumbnailUrl?.Trim();

        await _context.SaveChangesAsync();

        return (MapHotel(hotel), null);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        Hotel? hotel = await _context.Hotels
            .FirstOrDefaultAsync(hotel => hotel.Id == id);

        if (hotel is null)
        {
            return false;
        }

        _context.Hotels.Remove(hotel);
        await _context.SaveChangesAsync();

        return true;
    }

    private static string? Validate(string name, string city)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return "Name is required.";
        }

        if (string.IsNullOrWhiteSpace(city))
        {
            return "City is required.";
        }

        return null;
    }

    private static bool HasAvailability(
        Domain.Entities.RoomType roomType,
        DateOnly from,
        DateOnly to)
    {
        int minimumAvailableRooms = int.MaxValue;

        for (DateOnly date = from; date < to; date = date.AddDays(1))
        {
            RoomInventory? inventory = roomType.RoomInventories
                .FirstOrDefault(row => row.Date == date);

            int availableRooms = inventory is null
                ? 0
                : inventory.TotalRooms - inventory.SoldRooms;

            if (availableRooms < minimumAvailableRooms)
            {
                minimumAvailableRooms = availableRooms;
            }
        }

        return minimumAvailableRooms > 0;
    }

    private static HotelResponseDto MapHotel(Hotel hotel)
    {
        return new HotelResponseDto
        {
            Id = hotel.Id,
            Name = hotel.Name,
            City = hotel.City,
            Address = hotel.Address,
            Description = hotel.Description,
            Stars = hotel.Stars,
            ThumbnailUrl = hotel.ThumbnailUrl,
            CreatedAt = hotel.CreatedAt
        };
    }
}
