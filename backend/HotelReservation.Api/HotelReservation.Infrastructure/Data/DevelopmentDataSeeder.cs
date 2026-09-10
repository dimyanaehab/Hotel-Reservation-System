using HotelReservation.Domain.Entities;
using HotelReservation.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace HotelReservation.Infrastructure.Data;

public static class DevelopmentDataSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        await using AsyncServiceScope scope = services.CreateAsyncScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await context.Database.EnsureCreatedAsync();

        await SeedUsersAsync(context);
        await SeedHotelsAsync(context);
        await SeedRoomTypesAsync(context);
        await SeedInventoryAsync(context);
        await SeedBookingsAsync(context);
        await SeedReviewsAsync(context);
    }

    private static async Task SeedUsersAsync(ApplicationDbContext context)
    {
        var users = new[]
        {
            new User
            {
                Id = 1,
                Name = "Swagger Customer",
                Email = "customer@swagger.test",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Customer123!"),
                Role = UserRole.User
            },
            new User
            {
                Id = 2,
                Name = "Swagger Admin",
                Email = "admin@swagger.test",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Role = UserRole.Admin
            },
            new User
            {
                Id = 3,
                Name = "Maha Al-Faisal",
                Email = "maha@swagger.test",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Maha123!"),
                Role = UserRole.User
            },
            new User
            {
                Id = 4,
                Name = "Omar Hassan",
                Email = "omar@swagger.test",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Omar123!"),
                Role = UserRole.User
            },
            new User
            {
                Id = 5,
                Name = "Layla Nasser",
                Email = "layla@swagger.test",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Layla123!"),
                Role = UserRole.User
            }
        };

        foreach (User user in users)
        {
            User? existing = await context.Users.FirstOrDefaultAsync(item => item.Id == user.Id);
            if (existing is null)
            {
                context.Users.Add(user);
                continue;
            }

            existing.Name = user.Name;
            existing.Email = user.Email;
            existing.PasswordHash = user.PasswordHash;
            existing.Role = user.Role;
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedHotelsAsync(ApplicationDbContext context)
    {
        var hotels = new[]
        {
            new Hotel
            {
                Id = 1,
                Name = "Swagger Test Hotel",
                City = "Riyadh",
                Address = "King Fahd Road, Al Olaya",
                Description = "A comfortable city hotel close to Riyadh's business district and popular shopping destinations.",
                Stars = 4,
                ThumbnailUrl = "https://picsum.photos/seed/swagger-test-hotel/600/400"
            },
            new Hotel
            {
                Id = 2,
                Name = "Olaya Garden Retreat",
                City = "Riyadh",
                Address = "12 Prince Mohammed Bin Abdulaziz Street",
                Description = "A refined urban retreat with quiet gardens, generous rooms, and easy access to the city's cultural quarter.",
                Stars = 5,
                ThumbnailUrl = "https://picsum.photos/seed/olaya-garden-retreat/600/400"
            },
            new Hotel
            {
                Id = 3,
                Name = "Red Sea Pearl Hotel",
                City = "Jeddah",
                Address = "Corniche Road, Al Hamra",
                Description = "A bright waterfront hotel offering relaxing sea views and a convenient base for exploring historic Jeddah.",
                Stars = 4,
                ThumbnailUrl = "https://picsum.photos/seed/red-sea-pearl/600/400"
            },
            new Hotel
            {
                Id = 4,
                Name = "Al Balad Heritage House",
                City = "Jeddah",
                Address = "Al Balad Historic District",
                Description = "A characterful boutique stay blending traditional Hijazi details with modern comforts and thoughtful service.",
                Stars = 3,
                ThumbnailUrl = "https://picsum.photos/seed/al-balad-heritage/600/400"
            },
            new Hotel
            {
                Id = 5,
                Name = "Dubai Marina Vista",
                City = "Dubai",
                Address = "Marina Walk, Dubai Marina",
                Description = "A contemporary marina hotel with lively waterfront dining, spacious rooms, and skyline views.",
                Stars = 5,
                ThumbnailUrl = "https://picsum.photos/seed/dubai-marina-vista/600/400"
            },
            new Hotel
            {
                Id = 6,
                Name = "Old Cairo Courtyard",
                City = "Cairo",
                Address = "14 Al-Moez Street, Historic Cairo",
                Description = "A welcoming courtyard hotel surrounded by historic architecture, local cafés, and Egyptian cultural landmarks.",
                Stars = 4,
                ThumbnailUrl = "https://picsum.photos/seed/old-cairo-courtyard/600/400"
            },
            new Hotel
            {
                Id = 7,
                Name = "Nile Lights Hotel",
                City = "Cairo",
                Address = "Corniche El Nil, Garden City",
                Description = "An elegant riverside hotel with warm interiors, generous breakfast service, and memorable Nile sunsets.",
                Stars = 5,
                ThumbnailUrl = "https://picsum.photos/seed/nile-lights-hotel/600/400"
            },
            new Hotel
            {
                Id = 8,
                Name = "Muscat Harbor Lodge",
                City = "Muscat",
                Address = "Al Mouj Waterfront",
                Description = "A relaxed coastal lodge with bright interiors, marina access, and a peaceful setting for weekend escapes.",
                Stars = 3,
                ThumbnailUrl = "https://picsum.photos/seed/muscat-harbor-lodge/600/400"
            },
            new Hotel
            {
                Id = 9,
                Name = "Amman Citadel Suites",
                City = "Amman",
                Address = "Al Hashimi Street, Downtown Amman",
                Description = "A comfortable hillside hotel with wide city views and an ideal location for discovering Amman's old town.",
                Stars = 4,
                ThumbnailUrl = "https://picsum.photos/seed/amman-citadel-suites/600/400"
            }
        };

        foreach (Hotel hotel in hotels)
        {
            if (!await context.Hotels.AnyAsync(existing => existing.Id == hotel.Id))
            {
                context.Hotels.Add(hotel);
            }
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedRoomTypesAsync(ApplicationDbContext context)
    {
        var roomTypes = new[]
        {
            new RoomType { Id = 1, HotelId = 1, Name = "Swagger Deluxe Room", Capacity = 2, BedType = "King", BasePrice = 500m, Description = "A comfortable king room with a work desk and city views." },
            new RoomType { Id = 2, HotelId = 1, Name = "Riyadh Standard Room", Capacity = 2, BedType = "Twin", BasePrice = 350m, Description = "A practical twin room for short business or leisure stays." },
            new RoomType { Id = 3, HotelId = 1, Name = "Riyadh Family Suite", Capacity = 4, BedType = "King and Sofa Bed", BasePrice = 850m, Description = "A spacious suite with a separate sitting area for families." },
            new RoomType { Id = 4, HotelId = 2, Name = "Garden Deluxe Room", Capacity = 2, BedType = "King", BasePrice = 900m, Description = "A quiet king room overlooking the hotel's landscaped gardens." },
            new RoomType { Id = 5, HotelId = 2, Name = "Executive Suite", Capacity = 3, BedType = "King and Sofa Bed", BasePrice = 1400m, Description = "A polished suite with a lounge area and executive amenities." },
            new RoomType { Id = 6, HotelId = 2, Name = "Royal Family Suite", Capacity = 5, BedType = "Two Kings", BasePrice = 1900m, Description = "A generous two-room suite designed for longer family stays." },
            new RoomType { Id = 7, HotelId = 3, Name = "Corniche Standard Room", Capacity = 2, BedType = "Queen", BasePrice = 450m, Description = "A bright queen room within walking distance of the waterfront." },
            new RoomType { Id = 8, HotelId = 3, Name = "Sea View Deluxe", Capacity = 2, BedType = "King", BasePrice = 750m, Description = "A king room with a relaxing view toward the Red Sea." },
            new RoomType { Id = 9, HotelId = 3, Name = "Family Sea Suite", Capacity = 4, BedType = "King and Sofa Bed", BasePrice = 1100m, Description = "A comfortable family suite with a separate sitting room." },
            new RoomType { Id = 10, HotelId = 4, Name = "Heritage Twin Room", Capacity = 2, BedType = "Twin", BasePrice = 300m, Description = "A charming twin room with restored architectural details." },
            new RoomType { Id = 11, HotelId = 4, Name = "Courtyard Queen Room", Capacity = 2, BedType = "Queen", BasePrice = 425m, Description = "A peaceful queen room opening toward the internal courtyard." },
            new RoomType { Id = 12, HotelId = 4, Name = "Old Town Suite", Capacity = 3, BedType = "King and Sofa Bed", BasePrice = 700m, Description = "A boutique suite with a sitting area and old-town character." },
            new RoomType { Id = 13, HotelId = 5, Name = "Marina Superior Room", Capacity = 2, BedType = "King", BasePrice = 1000m, Description = "A modern king room with a balcony and marina atmosphere." },
            new RoomType { Id = 14, HotelId = 5, Name = "Skyline Suite", Capacity = 3, BedType = "King and Sofa Bed", BasePrice = 1600m, Description = "A stylish suite with a separate lounge and skyline outlook." },
            new RoomType { Id = 15, HotelId = 5, Name = "Marina Family Residence", Capacity = 5, BedType = "Two Kings", BasePrice = 2000m, Description = "A large residence with two sleeping areas for families or groups." },
            new RoomType { Id = 16, HotelId = 6, Name = "Courtyard Standard Room", Capacity = 2, BedType = "Queen", BasePrice = 400m, Description = "A welcoming queen room overlooking the central courtyard." },
            new RoomType { Id = 17, HotelId = 6, Name = "Pasha Deluxe Room", Capacity = 2, BedType = "King", BasePrice = 650m, Description = "A spacious king room with warm Egyptian-inspired details." },
            new RoomType { Id = 18, HotelId = 6, Name = "Family Courtyard Suite", Capacity = 4, BedType = "King and Sofa Bed", BasePrice = 950m, Description = "A family-friendly suite with extra living space." },
            new RoomType { Id = 19, HotelId = 7, Name = "Nile View Room", Capacity = 2, BedType = "King", BasePrice = 850m, Description = "A comfortable king room with a view of the Nile promenade." },
            new RoomType { Id = 20, HotelId = 7, Name = "Nile Executive Suite", Capacity = 3, BedType = "King and Sofa Bed", BasePrice = 1350m, Description = "An elegant suite with a lounge and panoramic river views." },
            new RoomType { Id = 21, HotelId = 7, Name = "Presidential Family Suite", Capacity = 5, BedType = "Two Kings", BasePrice = 1900m, Description = "A premium multi-room suite for families and special occasions." },
            new RoomType { Id = 22, HotelId = 8, Name = "Harbor Standard Room", Capacity = 2, BedType = "Twin", BasePrice = 375m, Description = "A relaxed twin room close to the waterfront promenade." },
            new RoomType { Id = 23, HotelId = 8, Name = "Sea Breeze Deluxe", Capacity = 2, BedType = "King", BasePrice = 600m, Description = "A breezy king room with bright coastal décor." },
            new RoomType { Id = 24, HotelId = 8, Name = "Harbor Family Suite", Capacity = 4, BedType = "King and Sofa Bed", BasePrice = 900m, Description = "A practical suite with room for families and longer stays." },
            new RoomType { Id = 25, HotelId = 9, Name = "Citadel Standard Room", Capacity = 2, BedType = "Queen", BasePrice = 425m, Description = "A comfortable queen room near Amman's historic center." },
            new RoomType { Id = 26, HotelId = 9, Name = "Panorama Deluxe Room", Capacity = 2, BedType = "King", BasePrice = 700m, Description = "A king room with broad views across the city hills." },
            new RoomType { Id = 27, HotelId = 9, Name = "Citadel Family Suite", Capacity = 4, BedType = "King and Sofa Bed", BasePrice = 1050m, Description = "A spacious suite with a separate sitting area and city views." }
        };

        foreach (RoomType roomType in roomTypes)
        {
            if (!await context.RoomTypes.AnyAsync(existing => existing.Id == roomType.Id))
            {
                context.RoomTypes.Add(roomType);
            }
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedInventoryAsync(ApplicationDbContext context)
    {
        DateOnly firstDate = DateOnly.FromDateTime(DateTime.UtcNow.Date.AddDays(1));
        DateOnly lastDate = firstDate.AddDays(60);
        Random random = new(20260910);
        List<RoomType> roomTypes = await context.RoomTypes
            .AsNoTracking()
            .ToListAsync();

        HashSet<string> existingInventory = (await context.RoomInventories
            .Where(item => item.Date >= firstDate && item.Date < lastDate)
            .Select(item => item.RoomTypeId + ":" + item.Date)
            .ToListAsync()).ToHashSet();

        foreach (RoomType roomType in roomTypes)
        {
            for (DateOnly date = firstDate; date < lastDate; date = date.AddDays(1))
            {
                if (existingInventory.Contains(roomType.Id + ":" + date))
                {
                    continue;
                }

                int totalRooms = random.Next(3, 11);
                context.RoomInventories.Add(new RoomInventory
                {
                    RoomTypeId = roomType.Id,
                    Date = date,
                    TotalRooms = totalRooms,
                    SoldRooms = random.Next(0, totalRooms)
                });
            }
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedBookingsAsync(ApplicationDbContext context)
    {
        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
        var bookings = new[]
        {
            new BookingSeed(100, 1, 1, 1, today.AddDays(-4), today.AddDays(-2), 1, 2, BookingStatus.Completed),
            new BookingSeed(101, 1, 1, 1, today.AddDays(7), today.AddDays(9), 1, 1, BookingStatus.Confirmed),
            new BookingSeed(102, 3, 2, 4, today.AddDays(10), today.AddDays(13), 1, 2, BookingStatus.Pending),
            new BookingSeed(103, 4, 3, 8, today.AddDays(14), today.AddDays(17), 1, 2, BookingStatus.Rejected),
            new BookingSeed(104, 5, 4, 10, today.AddDays(18), today.AddDays(20), 1, 1, BookingStatus.Cancelled),
            new BookingSeed(105, 3, 5, 13, today.AddDays(-12), today.AddDays(-9), 1, 2, BookingStatus.Completed),
            new BookingSeed(106, 4, 6, 17, today.AddDays(-20), today.AddDays(-17), 1, 2, BookingStatus.Completed),
            new BookingSeed(107, 5, 7, 19, today.AddDays(-28), today.AddDays(-25), 1, 2, BookingStatus.Completed)
        };

        Dictionary<int, decimal> roomPrices = await context.RoomTypes
            .AsNoTracking()
            .ToDictionaryAsync(roomType => roomType.Id, roomType => roomType.BasePrice);

        foreach (BookingSeed seed in bookings)
        {
            if (await context.Bookings.AnyAsync(existing => existing.Id == seed.Id))
            {
                continue;
            }

            context.Bookings.Add(new Booking
            {
                Id = seed.Id,
                UserId = seed.UserId,
                HotelId = seed.HotelId,
                RoomTypeId = seed.RoomTypeId,
                CheckIn = seed.CheckIn,
                CheckOut = seed.CheckOut,
                Nights = seed.Nights,
                NumberOfGuests = seed.NumberOfGuests,
                TotalPrice = roomPrices[seed.RoomTypeId] * seed.Nights,
                Status = seed.Status,
                CreatedAt = seed.CheckIn.ToDateTime(TimeOnly.MinValue).AddDays(-10)
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedReviewsAsync(ApplicationDbContext context)
    {
        var reviews = new[]
        {
            new ReviewSeed(1, 1, 1, 100, 5, "A comfortable stay with excellent service and a very helpful team."),
            new ReviewSeed(2, 3, 5, 105, 4, "The room was spacious, clean, and perfectly located for our trip."),
            new ReviewSeed(3, 4, 6, 106, 5, "Beautiful atmosphere and a memorable breakfast. We would gladly return."),
            new ReviewSeed(4, 5, 7, 107, 4, "A relaxing stay with thoughtful details and a welcoming staff.")
        };

        foreach (ReviewSeed seed in reviews)
        {
            if (await context.Reviews.AnyAsync(existing => existing.Id == seed.Id) ||
                await context.Reviews.AnyAsync(existing => existing.BookingId == seed.BookingId))
            {
                continue;
            }

            Booking? booking = await context.Bookings
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == seed.BookingId);

            if (booking is null || booking.Status != BookingStatus.Completed)
            {
                continue;
            }

            context.Reviews.Add(new Review
            {
                Id = seed.Id,
                UserId = seed.UserId,
                HotelId = seed.HotelId,
                BookingId = seed.BookingId,
                Rating = seed.Rating,
                Comment = seed.Comment,
                CreatedAt = DateTime.UtcNow.AddDays(-seed.Id)
            });
        }

        await context.SaveChangesAsync();
    }

    private sealed record BookingSeed(
        int Id,
        int UserId,
        int HotelId,
        int RoomTypeId,
        DateOnly CheckIn,
        DateOnly CheckOut,
        int NumberOfGuests,
        int Nights,
        BookingStatus Status);

    private sealed record ReviewSeed(
        int Id,
        int UserId,
        int HotelId,
        int BookingId,
        int Rating,
        string Comment);
}
