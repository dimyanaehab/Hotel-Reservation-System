using HotelReservation.Api.Enums;
using HotelReservation.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelReservation.Api.Data;

public static class DevelopmentDataSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        await using AsyncServiceScope scope = services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await context.Database.EnsureCreatedAsync();

        if (!await context.Users.AnyAsync(user => user.Id == 1))
        {
            context.Users.Add(new User
            {
                Id = 1,
                Name = "Swagger Customer",
                Email = "customer@swagger.test",
                PasswordHash = "development-only",
                Role = UserRole.User
            });
        }

        if (!await context.Hotels.AnyAsync(hotel => hotel.Id == 1))
        {
            context.Hotels.Add(new Hotel
            {
                Id = 1,
                Name = "Swagger Test Hotel",
                City = "Riyadh",
                Address = "Test Address",
                Stars = 4
            });
        }

        if (!await context.RoomTypes.AnyAsync(room => room.Id == 1))
        {
            context.RoomTypes.Add(new RoomType
            {
                Id = 1,
                HotelId = 1,
                Name = "Swagger Deluxe Room",
                Capacity = 2,
                BedType = "King",
                BasePrice = 500m
            });
        }

        DateOnly firstDate = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(1));
        DateOnly lastDate = firstDate.AddDays(60);
        HashSet<DateOnly> existingDates = (await context.RoomInventories
            .Where(item => item.RoomTypeId == 1 && item.Date >= firstDate && item.Date < lastDate)
            .Select(item => item.Date)
            .ToListAsync()).ToHashSet();

        for (DateOnly date = firstDate; date < lastDate; date = date.AddDays(1))
        {
            if (!existingDates.Contains(date))
            {
                context.RoomInventories.Add(new RoomInventory
                {
                    RoomTypeId = 1,
                    Date = date,
                    TotalRooms = 5,
                    SoldRooms = 0
                });
            }
        }

        await context.SaveChangesAsync();
    }
}
