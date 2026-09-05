using System.Data;
using HotelReservation.Api.Data;
using HotelReservation.Api.DTOs.Bookings;
using HotelReservation.Api.Enums;
using HotelReservation.Api.Models;
using HotelReservation.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HotelReservation.Api.Services;

public class BookingService : IBookingService
{
    private readonly ApplicationDbContext _context;

    public BookingService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BookingResponseDto> CreateBookingAsync(
        int userId,
        CreateBookingRequestDto request)
    {
        ValidateBookingRequest(request);

        int nights = request.CheckOut.DayNumber - request.CheckIn.DayNumber;

        await using var transaction =
            await _context.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

        try
        {
            bool userExists = await _context.Users
                .AnyAsync(user => user.Id == userId);

            if (!userExists)
            {
                throw new KeyNotFoundException("User was not found.");
            }

            RoomType? roomType = await _context.RoomTypes
                .Include(roomType => roomType.Hotel)
                .FirstOrDefaultAsync(
                    roomType => roomType.Id == request.RoomTypeId);

            if (roomType is null)
            {
                throw new KeyNotFoundException("Room type was not found.");
            }

            if (request.NumberOfGuests > roomType.Capacity)
            {
                throw new InvalidOperationException(
                    $"This room allows a maximum of {roomType.Capacity} guests.");
            }

            List<RoomInventory> inventoryRecords =
                await _context.RoomInventories
                    .Where(inventory =>
                        inventory.RoomTypeId == request.RoomTypeId &&
                        inventory.Date >= request.CheckIn &&
                        inventory.Date < request.CheckOut)
                    .OrderBy(inventory => inventory.Date)
                    .ToListAsync();

            if (inventoryRecords.Count != nights)
            {
                throw new InvalidOperationException(
                    "Availability has not been configured for every night.");
            }

            bool unavailableNight = inventoryRecords.Any(
                inventory => inventory.SoldRooms >= inventory.TotalRooms);

            if (unavailableNight)
            {
                throw new InvalidOperationException(
                    "The selected room is not available for the complete stay.");
            }

            foreach (RoomInventory inventory in inventoryRecords)
            {
                inventory.SoldRooms++;
            }

            decimal totalPrice = roomType.BasePrice * nights;

            var booking = new Booking
            {
                UserId = userId,
                HotelId = roomType.HotelId,
                RoomTypeId = roomType.Id,
                CheckIn = request.CheckIn,
                CheckOut = request.CheckOut,
                Nights = nights,
                NumberOfGuests = request.NumberOfGuests,
                TotalPrice = totalPrice,
                Status = BookingStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.Bookings.Add(booking);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return new BookingResponseDto
            {
                Id = booking.Id,
                HotelId = roomType.HotelId,
                HotelName = roomType.Hotel.Name,
                RoomTypeId = roomType.Id,
                RoomTypeName = roomType.Name,
                CheckIn = booking.CheckIn,
                CheckOut = booking.CheckOut,
                Nights = booking.Nights,
                NumberOfGuests = booking.NumberOfGuests,
                TotalPrice = booking.TotalPrice,
                Status = booking.Status.ToString(),
                CreatedAt = booking.CreatedAt
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<IReadOnlyList<BookingResponseDto>> GetMyBookingsAsync(
    int userId)
    {
        List<Booking> bookings = await _context.Bookings
            .AsNoTracking()
            .Include(booking => booking.Hotel)
            .Include(booking => booking.RoomType)
            .Where(booking => booking.UserId == userId)
            .OrderByDescending(booking => booking.CreatedAt)
            .ToListAsync();

        List<BookingResponseDto> result = bookings
            .Select(booking => new BookingResponseDto
            {
                Id = booking.Id,
                HotelId = booking.HotelId,
                HotelName = booking.Hotel.Name,
                RoomTypeId = booking.RoomTypeId,
                RoomTypeName = booking.RoomType.Name,
                CheckIn = booking.CheckIn,
                CheckOut = booking.CheckOut,
                Nights = booking.Nights,
                NumberOfGuests = booking.NumberOfGuests,
                TotalPrice = booking.TotalPrice,
                Status = booking.Status.ToString(),
                CreatedAt = booking.CreatedAt
            })
            .ToList();

        return result;
    }

    public async Task<BookingResponseDto> CancelBookingAsync(
    int bookingId,
    int userId)
{
    await using var transaction =
        await _context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable);

    try
    {
        Booking? booking = await _context.Bookings
            .Include(booking => booking.Hotel)
            .Include(booking => booking.RoomType)
            .FirstOrDefaultAsync(booking => booking.Id == bookingId);

        if (booking is null)
        {
            throw new KeyNotFoundException("Booking was not found.");
        }

        if (booking.UserId != userId)
        {
            throw new UnauthorizedAccessException(
                "You cannot cancel another user's booking.");
        }

        if (booking.Status != BookingStatus.Confirmed)
        {
            throw new InvalidOperationException(
                "Only confirmed bookings can be cancelled.");
        }

        List<RoomInventory> inventoryRecords =
            await _context.RoomInventories
                .Where(inventory =>
                    inventory.RoomTypeId == booking.RoomTypeId &&
                    inventory.Date >= booking.CheckIn &&
                    inventory.Date < booking.CheckOut)
                .ToListAsync();

        if (inventoryRecords.Count != booking.Nights)
        {
            throw new InvalidOperationException(
                "The booking inventory records are incomplete.");
        }

        foreach (RoomInventory inventory in inventoryRecords)
        {
            if (inventory.SoldRooms <= 0)
            {
                throw new InvalidOperationException(
                    "The room inventory cannot be restored correctly.");
            }

            inventory.SoldRooms--;
        }

        booking.Status = BookingStatus.Cancelled;

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return new BookingResponseDto
        {
            Id = booking.Id,
            HotelId = booking.HotelId,
            HotelName = booking.Hotel.Name,
            RoomTypeId = booking.RoomTypeId,
            RoomTypeName = booking.RoomType.Name,
            CheckIn = booking.CheckIn,
            CheckOut = booking.CheckOut,
            Nights = booking.Nights,
            NumberOfGuests = booking.NumberOfGuests,
            TotalPrice = booking.TotalPrice,
            Status = booking.Status.ToString(),
            CreatedAt = booking.CreatedAt
        };
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}

    public async Task<IReadOnlyList<AdminBookingResponseDto>>
    GetAdminBookingsAsync(BookingStatus? status)
{
    IQueryable<Booking> query = _context.Bookings
        .AsNoTracking()
        .Include(booking => booking.User)
        .Include(booking => booking.Hotel)
        .Include(booking => booking.RoomType);

    if (status.HasValue)
    {
        query = query.Where(
            booking => booking.Status == status.Value);
    }

    List<Booking> bookings = await query
        .OrderByDescending(booking => booking.CreatedAt)
        .ToListAsync();

    List<AdminBookingResponseDto> result = bookings
        .Select(booking => new AdminBookingResponseDto
        {
            Id = booking.Id,
            UserId = booking.UserId,
            UserName = booking.User.Name,
            UserEmail = booking.User.Email,
            HotelId = booking.HotelId,
            HotelName = booking.Hotel.Name,
            RoomTypeId = booking.RoomTypeId,
            RoomTypeName = booking.RoomType.Name,
            CheckIn = booking.CheckIn,
            CheckOut = booking.CheckOut,
            Nights = booking.Nights,
            NumberOfGuests = booking.NumberOfGuests,
            TotalPrice = booking.TotalPrice,
            Status = booking.Status.ToString(),
            CreatedAt = booking.CreatedAt
        })
        .ToList();

    return result;
}

    public async Task<AdminBookingResponseDto> ConfirmBookingAsync(
    int bookingId)
{
    Booking? booking = await _context.Bookings
        .Include(booking => booking.User)
        .Include(booking => booking.Hotel)
        .Include(booking => booking.RoomType)
        .FirstOrDefaultAsync(booking => booking.Id == bookingId);

    if (booking is null)
    {
        throw new KeyNotFoundException("Booking was not found.");
    }

    if (booking.Status != BookingStatus.Pending)
    {
        throw new InvalidOperationException(
            "Only pending bookings can be confirmed.");
    }

    booking.Status = BookingStatus.Confirmed;

    await _context.SaveChangesAsync();

    return new AdminBookingResponseDto
    {
        Id = booking.Id,
        UserId = booking.UserId,
        UserName = booking.User.Name,
        UserEmail = booking.User.Email,
        HotelId = booking.HotelId,
        HotelName = booking.Hotel.Name,
        RoomTypeId = booking.RoomTypeId,
        RoomTypeName = booking.RoomType.Name,
        CheckIn = booking.CheckIn,
        CheckOut = booking.CheckOut,
        Nights = booking.Nights,
        NumberOfGuests = booking.NumberOfGuests,
        TotalPrice = booking.TotalPrice,
        Status = booking.Status.ToString(),
        CreatedAt = booking.CreatedAt
    };
}

    public async Task<AdminBookingResponseDto> RejectBookingAsync(
    int bookingId)
{
    await using var transaction =
        await _context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable);

    try
    {
        Booking? booking = await _context.Bookings
            .Include(booking => booking.User)
            .Include(booking => booking.Hotel)
            .Include(booking => booking.RoomType)
            .FirstOrDefaultAsync(booking => booking.Id == bookingId);

        if (booking is null)
        {
            throw new KeyNotFoundException("Booking was not found.");
        }

        if (booking.Status != BookingStatus.Pending)
        {
            throw new InvalidOperationException(
                "Only pending bookings can be rejected.");
        }

        List<RoomInventory> inventoryRecords =
            await _context.RoomInventories
                .Where(inventory =>
                    inventory.RoomTypeId == booking.RoomTypeId &&
                    inventory.Date >= booking.CheckIn &&
                    inventory.Date < booking.CheckOut)
                .ToListAsync();

        if (inventoryRecords.Count != booking.Nights)
        {
            throw new InvalidOperationException(
                "The booking inventory records are incomplete.");
        }

        foreach (RoomInventory inventory in inventoryRecords)
        {
            if (inventory.SoldRooms <= 0)
            {
                throw new InvalidOperationException(
                    "The room inventory cannot be restored correctly.");
            }

            inventory.SoldRooms--;
        }

        booking.Status = BookingStatus.Rejected;

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return new AdminBookingResponseDto
        {
            Id = booking.Id,
            UserId = booking.UserId,
            UserName = booking.User.Name,
            UserEmail = booking.User.Email,
            HotelId = booking.HotelId,
            HotelName = booking.Hotel.Name,
            RoomTypeId = booking.RoomTypeId,
            RoomTypeName = booking.RoomType.Name,
            CheckIn = booking.CheckIn,
            CheckOut = booking.CheckOut,
            Nights = booking.Nights,
            NumberOfGuests = booking.NumberOfGuests,
            TotalPrice = booking.TotalPrice,
            Status = booking.Status.ToString(),
            CreatedAt = booking.CreatedAt
        };
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}

    public async Task<AdminBookingResponseDto> CancelBookingAsAdminAsync(int bookingId)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(
            IsolationLevel.Serializable);

        try
        {
            Booking booking = await GetAdminBookingAsync(bookingId);

            if (booking.Status is not (BookingStatus.Pending or BookingStatus.Confirmed))
            {
                throw new InvalidOperationException(
                    "Only pending or confirmed bookings can be cancelled.");
            }

            await RestoreInventoryAsync(booking);
            booking.Status = BookingStatus.Cancelled;
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return ToAdminDto(booking);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<AdminBookingResponseDto> CompleteBookingAsync(int bookingId)
    {
        Booking booking = await GetAdminBookingAsync(bookingId);

        if (booking.Status != BookingStatus.Confirmed)
        {
            throw new InvalidOperationException("Only confirmed bookings can be completed.");
        }

        if (booking.CheckOut > DateOnly.FromDateTime(DateTime.UtcNow))
        {
            throw new InvalidOperationException(
                "A booking cannot be completed before its check-out date.");
        }

        booking.Status = BookingStatus.Completed;
        await _context.SaveChangesAsync();
        return ToAdminDto(booking);
    }

    private async Task<Booking> GetAdminBookingAsync(int bookingId)
    {
        Booking? booking = await _context.Bookings
            .Include(item => item.User)
            .Include(item => item.Hotel)
            .Include(item => item.RoomType)
            .FirstOrDefaultAsync(item => item.Id == bookingId);

        return booking ?? throw new KeyNotFoundException("Booking was not found.");
    }

    private async Task RestoreInventoryAsync(Booking booking)
    {
        List<RoomInventory> records = await _context.RoomInventories
            .Where(item => item.RoomTypeId == booking.RoomTypeId &&
                item.Date >= booking.CheckIn && item.Date < booking.CheckOut)
            .ToListAsync();

        if (records.Count != booking.Nights || records.Any(item => item.SoldRooms <= 0))
        {
            throw new InvalidOperationException(
                "The booking inventory cannot be restored correctly.");
        }

        records.ForEach(item => item.SoldRooms--);
    }

    private static AdminBookingResponseDto ToAdminDto(Booking booking) => new()
    {
        Id = booking.Id,
        UserId = booking.UserId,
        UserName = booking.User.Name,
        UserEmail = booking.User.Email,
        HotelId = booking.HotelId,
        HotelName = booking.Hotel.Name,
        RoomTypeId = booking.RoomTypeId,
        RoomTypeName = booking.RoomType.Name,
        CheckIn = booking.CheckIn,
        CheckOut = booking.CheckOut,
        Nights = booking.Nights,
        NumberOfGuests = booking.NumberOfGuests,
        TotalPrice = booking.TotalPrice,
        Status = booking.Status.ToString(),
        CreatedAt = booking.CreatedAt
    };

    private static void ValidateBookingRequest(
        CreateBookingRequestDto request)
    {
        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);

        if (request.CheckIn < today)
        {
            throw new ArgumentException(
                "Check-in date cannot be in the past.");
        }

        if (request.CheckOut <= request.CheckIn)
        {
            throw new ArgumentException(
                "Check-out date must be after the check-in date.");
        }

        if (request.NumberOfGuests <= 0)
        {
            throw new ArgumentException(
                "The number of guests must be greater than zero.");
        }
    }
}
