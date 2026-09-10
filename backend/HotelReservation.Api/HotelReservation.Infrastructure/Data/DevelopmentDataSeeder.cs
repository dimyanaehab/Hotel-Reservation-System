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

        Console.WriteLine("==================================================");
        Console.WriteLine("[Seeder] Starting development data seeding...");
        Console.WriteLine("==================================================");

        await SeedUsersAsync(context);
        await SeedHotelsAsync(context);
        await SeedRoomTypesAsync(context);
        await SeedInventoryAsync(context);
        await SeedBookingsAsync(context);
        await SeedReviewsAsync(context);

        Console.WriteLine("==================================================");
        Console.WriteLine("[Seeder] All database seeding completed successfully.");
        Console.WriteLine("==================================================");
    }

    private static async Task SeedUsersAsync(ApplicationDbContext context)
    {
        var usersToSeed = new (string Name, string Email, string Password, UserRole Role)[]
        {
            // Admins (2)
            ("Swagger Admin", "admin@swagger.test", "Admin123!", UserRole.Admin),
            ("LumaStay System Admin", "admin@lumastay.test", "Admin123!", UserRole.Admin),

            // Regular Users (16)
            ("Swagger Customer", "customer@swagger.test", "Customer123!", UserRole.User),
            ("Maha Al-Faisal", "maha@swagger.test", "User123!", UserRole.User),
            ("Omar Hassan", "omar@swagger.test", "User123!", UserRole.User),
            ("Layla Nasser", "layla@swagger.test", "User123!", UserRole.User),
            ("Tariq Mansoor", "tariq.mansoor@example.com", "User123!", UserRole.User),
            ("Fatima Al-Zahrani", "fatima.zahrani@example.com", "User123!", UserRole.User),
            ("Khaled Ibrahim", "khaled.ibrahim@example.com", "User123!", UserRole.User),
            ("Noor Al-Sabah", "noor.alsabah@example.com", "User123!", UserRole.User),
            ("Zaid Al-Husseini", "zaid.husseini@example.com", "User123!", UserRole.User),
            ("Reem Al-Otaibi", "reem.otaibi@example.com", "User123!", UserRole.User),
            ("Youssef El-Masry", "youssef.masry@example.com", "User123!", UserRole.User),
            ("Salma Barakat", "salma.barakat@example.com", "User123!", UserRole.User),
            ("Hamad Al-Kuwari", "hamad.kuwari@example.com", "User123!", UserRole.User),
            ("Amina Al-Balushi", "amina.balushi@example.com", "User123!", UserRole.User),
            ("Sultan Al-Nuaimi", "sultan.nuaimi@example.com", "User123!", UserRole.User),
            ("Huda Al-Ghamdi", "huda.ghamdi@example.com", "User123!", UserRole.User),
            ("Faisal Al-Dosari", "faisal.dosari@example.com", "User123!", UserRole.User),
            ("Mariam Al-Kandari", "mariam.kandari@example.com", "User123!", UserRole.User)
        };

        var existingEmails = (await context.Users
            .Select(u => u.Email.ToLower())
            .ToListAsync())
            .ToHashSet();

        int inserted = 0;
        foreach (var (name, email, password, role) in usersToSeed)
        {
            if (existingEmails.Contains(email.ToLower()))
            {
                continue;
            }

            context.Users.Add(new User
            {
                Name = name,
                Email = email.Trim().ToLowerInvariant(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Role = role,
                CreatedAt = DateTime.UtcNow
            });
            existingEmails.Add(email.ToLower());
            inserted++;
        }

        if (inserted > 0)
        {
            await context.SaveChangesAsync();
        }

        int total = await context.Users.CountAsync();
        Console.WriteLine($"[Seeder] Users: Seeded {inserted} new users ({total} total in database).");
    }

    private static async Task SeedHotelsAsync(ApplicationDbContext context)
    {
        var hotelsToSeed = new (string Name, string City, string Address, string Description, int Stars, string Slug)[]
        {
            // Riyadh (5)
            ("Swagger Test Hotel", "Riyadh", "King Fahd Road, Al Olaya", "A comfortable city hotel close to Riyadh's business district and popular shopping destinations.", 4, "swagger-test-hotel"),
            ("Olaya Garden Retreat", "Riyadh", "12 Prince Mohammed Bin Abdulaziz Street", "A refined urban retreat with quiet gardens, generous rooms, and easy access to the city's cultural quarter.", 5, "olaya-garden-retreat"),
            ("Al Faisaliah Heights Hotel", "Riyadh", "King Fahd Road, Al Olaya District", "Iconic modern luxury featuring skyline vistas, signature fine dining, and exclusive spa treatments.", 5, "al-faisaliah-heights"),
            ("Diplomatic Quarter Suites", "Riyadh", "Abdullah Al-Sahmi Square, DQ", "A peaceful stay surrounded by lush walking trails, embassies, and tranquil gardens.", 4, "diplomatic-quarter-suites"),
            ("Diriyah Heritage Oasis", "Riyadh", "Wadi Hanifa Road, Historic Diriyah", "Immerse yourself in traditional Najdi mud-brick architecture paired with five-star modern elegance.", 5, "diriyah-heritage-oasis"),

            // Jeddah (4)
            ("Red Sea Pearl Hotel", "Jeddah", "Corniche Road, Al Hamra", "A bright waterfront hotel offering relaxing sea views and a convenient base for exploring historic Jeddah.", 4, "red-sea-pearl"),
            ("Al Balad Heritage House", "Jeddah", "Al Balad Historic District", "A characterful boutique stay blending traditional Hijazi details with modern comforts and thoughtful service.", 3, "al-balad-heritage"),
            ("Jeddah Corniche Royal Resort", "Jeddah", "North Corniche Road, Ash Shati", "Spectacular Red Sea panoramas with a private beach, infinity pool, and coastal promenade access.", 5, "jeddah-corniche-royal"),
            ("Obhur Bay Marina Resort", "Jeddah", "Prince Abdullah Al Faisal Street, Obhur", "Waterfront leisure with private yacht berths, watersports, and breezy oceanfront dining.", 4, "obhur-bay-marina"),

            // Dubai (5)
            ("Dubai Marina Vista", "Dubai", "Marina Walk, Dubai Marina", "A contemporary marina hotel with lively waterfront dining, spacious rooms, and skyline views.", 5, "dubai-marina-vista"),
            ("Palm Jumeirah Sunset Haven", "Dubai", "Crescent West, Palm Jumeirah", "Premier beachfront sanctuary featuring private cabanas, lagoon pools, and iconic sunset views.", 5, "palm-jumeirah-sunset"),
            ("Downtown Burj View Hotel", "Dubai", "Financial Centre Road, Downtown", "Steps from Dubai Mall and the Burj Khalifa, offering bespoke concierge service and skyline terraces.", 5, "downtown-burj-view"),
            ("Deira Creek Heritage Hotel", "Dubai", "Baniyas Road, Deira", "Classic hospitality overlooking historic dhow trading routes and fragrant spice souks.", 4, "deira-creek-heritage"),
            ("Desert Palm Polo Sanctuary", "Dubai", "Al Awir Road, Warsan", "Chic boutique estate nestled in green polo fields, providing a tranquil escape from urban rush.", 5, "desert-palm-polo"),

            // Abu Dhabi (4)
            ("Corniche Grand Abu Dhabi", "Abu Dhabi", "Corniche West Street, Al Khubeirah", "Grand luxury with pristine waterfront beaches, manicured gardens, and opulent marble lounges.", 5, "corniche-grand-abu-dhabi"),
            ("Yas Island Action Hotel", "Abu Dhabi", "Yas Marina Circuit, Yas Island", "Modern and vibrant hotel adjacent to world-famous theme parks, golf courses, and marina nightlife.", 4, "yas-island-action"),
            ("Saadiyat Island Beach Resort", "Abu Dhabi", "Saadiyat Beach Promenade", "Eco-conscious coastal paradise where natural sand dunes meet turquoise Arabian Gulf waters.", 5, "saadiyat-island-beach"),
            ("Al Ain Oasis Heritage Resort", "Abu Dhabi", "Hazza Bin Sultan Street, Al Ain", "Serene retreat near date palm groves and historic mountain springs with authentic Emirati hospitality.", 3, "al-ain-oasis-heritage"),

            // Cairo (4)
            ("Old Cairo Courtyard", "Cairo", "14 Al-Moez Street, Historic Cairo", "A welcoming courtyard hotel surrounded by historic architecture, local cafés, and Egyptian cultural landmarks.", 4, "old-cairo-courtyard"),
            ("Nile Lights Hotel", "Cairo", "Corniche El Nil, Garden City", "An elegant riverside hotel with warm interiors, generous breakfast service, and memorable Nile sunsets.", 5, "nile-lights-hotel"),
            ("Zamalek Island Boutique Hotel", "Cairo", "26th of July Street, Zamalek", "Artsy, leafy retreat surrounded by foreign embassies, classical architecture, and tranquil antique shops.", 4, "zamalek-island-boutique"),
            ("Giza Pyramids View Palace", "Cairo", "Pyramids Plateau Road, Giza", "Unobstructed panorama of the Great Pyramids from your private terrace with evening sound-and-light views.", 5, "giza-pyramids-palace"),

            // Alexandria (2)
            ("Mediterranean Breeze Hotel", "Alexandria", "26th of July Military Road, Corniche", "Breezy seaside accommodation steps from Stanley Bridge, fresh seafood eateries, and maritime sights.", 4, "mediterranean-breeze-alex"),
            ("Montazah Palace View Resort", "Alexandria", "Al Mandarah Bahri, Montazah", "Historic royal garden setting overlooking sandy beaches and classical Mediterranean architecture.", 5, "montazah-palace-view"),

            // Amman (3)
            ("Amman Citadel Suites", "Amman", "Al Hashimi Street, Downtown Amman", "A comfortable hillside hotel with wide city views and an ideal location for discovering Amman's old town.", 4, "amman-citadel-suites"),
            ("Rainbow Street Boutique Hotel", "Amman", "Rainbow Street, First Circle, Jabal Amman", "Trendy neighborhood stay surrounded by art galleries, rooftop cafés, and heritage cobblestones.", 3, "rainbow-street-boutique"),
            ("Amman Hills Royal Hotel", "Amman", "Zahran Street, 5th Circle", "Sophisticated five-star residence boasting fine Lebanese dining, heated pools, and panoramic city vistas.", 5, "amman-hills-royal"),

            // Muscat (3)
            ("Muscat Harbor Lodge", "Muscat", "Al Mouj Waterfront, Muscat", "A relaxed coastal lodge with bright interiors, marina access, and a peaceful setting for weekend escapes.", 3, "muscat-harbor-lodge"),
            ("Mutrah Corniche Palace", "Muscat", "Mutrah Corniche Road, Muscat", "Traditional Omani architecture with carved woodwork, mountain backdrops, and direct souk access.", 4, "mutrah-corniche-palace"),
            ("Al Bustan Ocean Cove Resort", "Muscat", "Qantab Coastal Road, Muscat", "Secluded bay flanked by rugged peaks, featuring private beachfronts, lush gardens, and Omani coffee.", 5, "al-bustan-ocean-cove"),

            // Doha (3)
            ("West Bay Skyline Hotel", "Doha", "Diplomatic Street, West Bay, Doha", "Ultra-modern tower overlooking the Arabian Gulf with infinity sky pools and world-class culinary venues.", 5, "west-bay-skyline-doha"),
            ("Souq Waqif Heritage Suites", "Doha", "Souq Waqif, Al Jasra, Doha", "Authentic Arabian courtyard suites with fragrant spice courtyards, falcon souks, and cultural richness.", 4, "souq-waqif-heritage"),
            ("The Pearl Marina Residence", "Doha", "Porto Arabia, The Pearl, Doha", "Chic island lifestyle with yacht berths, designer boutiques, and open-air Mediterranean promenades.", 5, "the-pearl-marina-doha"),

            // Manama (2)
            ("Manama Seef Business Hotel", "Manama", "Road 2819, Seef District, Manama", "Smart and efficient hotel connected to premier shopping malls, business hubs, and city highways.", 4, "manama-seef-business"),
            ("Bahrain Bay Lagoon Resort", "Manama", "Bahrain Bay Boulevard, Manama", "Architectural landmark floating over Bahrain Bay with spa sanctuaries and panoramic sunset decks.", 5, "bahrain-bay-lagoon"),

            // Kuwait City (1)
            ("Kuwait Marina Beach Resort", "Kuwait City", "Arabian Gulf Street, Salmiya", "Private shoreline retreat with lush palm gardens, lagoon pools, and vibrant seaside dining.", 5, "kuwait-marina-beach")
        };

        var existingHotels = (await context.Hotels
            .Select(h => h.Name.ToLower() + "_" + h.City.ToLower())
            .ToListAsync())
            .ToHashSet();

        int inserted = 0;
        foreach (var (name, city, address, description, stars, slug) in hotelsToSeed)
        {
            string key = name.ToLower() + "_" + city.ToLower();
            if (existingHotels.Contains(key))
            {
                continue;
            }

            context.Hotels.Add(new Hotel
            {
                Name = name,
                City = city,
                Address = address,
                Description = description,
                Stars = stars,
                ThumbnailUrl = $"https://picsum.photos/seed/{slug}/600/400",
                CreatedAt = DateTime.UtcNow
            });
            existingHotels.Add(key);
            inserted++;
        }

        if (inserted > 0)
        {
            await context.SaveChangesAsync();
        }

        int total = await context.Hotels.CountAsync();
        Console.WriteLine($"[Seeder] Hotels: Seeded {inserted} new hotels ({total} total in database).");
    }

    private static async Task SeedRoomTypesAsync(ApplicationDbContext context)
    {
        var hotels = await context.Hotels.ToListAsync();
        int inserted = 0;

        foreach (var hotel in hotels)
        {
            var existingNames = (await context.RoomTypes
                .Where(r => r.HotelId == hotel.Id)
                .Select(r => r.Name.ToLower())
                .ToListAsync())
                .ToHashSet();

            var templates = GetRoomTypeTemplatesForHotel(hotel);

            foreach (var template in templates)
            {
                if (existingNames.Contains(template.Name.ToLower()))
                {
                    continue;
                }

                context.RoomTypes.Add(new RoomType
                {
                    HotelId = hotel.Id,
                    Name = template.Name,
                    Capacity = template.Capacity,
                    BedType = template.BedType,
                    BasePrice = template.BasePrice,
                    Description = template.Description
                });
                existingNames.Add(template.Name.ToLower());
                inserted++;
            }
        }

        if (inserted > 0)
        {
            await context.SaveChangesAsync();
        }

        int total = await context.RoomTypes.CountAsync();
        Console.WriteLine($"[Seeder] RoomTypes: Seeded {inserted} new room types ({total} total in database).");
    }

    private static List<RoomTypeTemplate> GetRoomTypeTemplatesForHotel(Hotel hotel)
    {
        string cityPrefix = hotel.City;

        if (hotel.Stars == 3)
        {
            return new List<RoomTypeTemplate>
            {
                new($"{cityPrefix} Standard Room", 2, "Queen", 320m, "A cozy, functional room with modern essential amenities and high-speed Wi-Fi."),
                new($"{cityPrefix} Twin Comfort Room", 2, "Twin", 350m, "Comfortable twin beds with city street views and practical workspaces."),
                new($"{cityPrefix} Family Studio", 4, "Two Queens", 550m, "An open-plan family studio with ample space for luggage and relaxing.")
            };
        }

        if (hotel.Stars == 4)
        {
            return new List<RoomTypeTemplate>
            {
                new($"{cityPrefix} Superior Queen", 2, "Queen", 480m, "Contemporary room with plush queen bedding, espresso machine, and smart TV."),
                new($"{cityPrefix} Deluxe King", 2, "King", 680m, "Spacious king bedroom with panoramic windows and deep soaking bath."),
                new($"{cityPrefix} Executive Suite", 3, "King and Sofa Bed", 1100m, "Generous suite with separate lounge, executive desk, and complimentary lounge access."),
                new($"{cityPrefix} Family Grand Suite", 4, "Two Queens", 1350m, "Ideal for family vacations with two large beds, walk-in closet, and dining table.")
            };
        }

        // 5 Stars
        return new List<RoomTypeTemplate>
        {
            new($"{cityPrefix} Luxury King Room", 2, "King", 850m, "Exquisitely styled bedroom with marble bathroom, rain shower, and skyline views."),
            new($"{cityPrefix} Premium Panoramic Suite", 3, "King and Sofa Bed", 1450m, "Floor-to-ceiling glass suite offering expansive city or ocean vistas and private butler service."),
            new($"{cityPrefix} Family Royal Suite", 4, "Two Kings", 1950m, "Two master bedrooms connected by an opulent living room, crafted for luxurious family stays."),
            new($"{cityPrefix} Presidential Signature Suite", 5, "Two Kings and Sofa Bed", 2800m, "The pinnacle of refinement with private dining room, whirlpool bath, and VIP airport transfer.")
        };
    }

    private static async Task SeedInventoryAsync(ApplicationDbContext context)
    {
        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow.Date);
        DateOnly firstDate = today.AddDays(1);
        DateOnly lastDate = firstDate.AddDays(90);

        List<int> roomTypeIds = await context.RoomTypes
            .Select(r => r.Id)
            .ToListAsync();

        var existingSlots = (await context.RoomInventories
            .Where(item => item.Date >= firstDate && item.Date < lastDate)
            .Select(item => new { item.RoomTypeId, item.Date })
            .ToListAsync())
            .Select(item => $"{item.RoomTypeId}_{item.Date:yyyyMMdd}")
            .ToHashSet();

        Random random = new(20260910);
        int inserted = 0;

        foreach (int roomTypeId in roomTypeIds)
        {
            for (DateOnly date = firstDate; date < lastDate; date = date.AddDays(1))
            {
                string key = $"{roomTypeId}_{date:yyyyMMdd}";
                if (existingSlots.Contains(key))
                {
                    continue;
                }

                int totalRooms = random.Next(3, 13); // 3 to 12
                int soldRooms = random.Next(0, totalRooms); // 0 to TotalRooms - 1

                context.RoomInventories.Add(new RoomInventory
                {
                    RoomTypeId = roomTypeId,
                    Date = date,
                    TotalRooms = totalRooms,
                    SoldRooms = soldRooms
                });

                existingSlots.Add(key);
                inserted++;
            }
        }

        if (inserted > 0)
        {
            await context.SaveChangesAsync();
        }

        int total = await context.RoomInventories.CountAsync();
        Console.WriteLine($"[Seeder] Inventory: Seeded {inserted} daily slots across {roomTypeIds.Count} room types ({total} total in database).");
    }

    private static async Task SeedBookingsAsync(ApplicationDbContext context)
    {
        DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow.Date);

        List<User> users = await context.Users
            .Where(u => u.Role == UserRole.User)
            .OrderBy(u => u.Id)
            .ToListAsync();

        List<RoomType> roomTypes = await context.RoomTypes
            .Include(r => r.Hotel)
            .OrderBy(r => r.Id)
            .ToListAsync();

        if (users.Count == 0 || roomTypes.Count == 0)
        {
            Console.WriteLine("[Seeder] Bookings: Cannot seed bookings because users or room types are missing.");
            return;
        }

        var existingBookings = (await context.Bookings
            .Select(b => $"{b.UserId}_{b.RoomTypeId}_{b.CheckIn:yyyyMMdd}_{b.CheckOut:yyyyMMdd}")
            .ToListAsync())
            .ToHashSet();

        var bookingSpecs = GenerateBookingSpecs(today);
        int inserted = 0;
        int userIndex = 0;
        int roomTypeIndex = 0;

        foreach (var spec in bookingSpecs)
        {
            var user = users[userIndex % users.Count];
            var roomType = roomTypes[roomTypeIndex % roomTypes.Count];
            userIndex++;
            roomTypeIndex++;

            string key = $"{user.Id}_{roomType.Id}_{spec.CheckIn:yyyyMMdd}_{spec.CheckOut:yyyyMMdd}";
            if (existingBookings.Contains(key))
            {
                continue;
            }

            int nights = spec.CheckOut.DayNumber - spec.CheckIn.DayNumber;
            decimal totalPrice = roomType.BasePrice * nights;
            int guests = Math.Min(spec.Guests, roomType.Capacity);
            if (guests <= 0) guests = 1;

            context.Bookings.Add(new Booking
            {
                UserId = user.Id,
                HotelId = roomType.HotelId,
                RoomTypeId = roomType.Id,
                CheckIn = spec.CheckIn,
                CheckOut = spec.CheckOut,
                Nights = nights,
                NumberOfGuests = guests,
                TotalPrice = totalPrice,
                Status = spec.Status,
                CreatedAt = spec.CheckIn.ToDateTime(TimeOnly.MinValue).AddDays(-spec.CreatedDaysBeforeCheckIn)
            });

            existingBookings.Add(key);
            inserted++;
        }

        if (inserted > 0)
        {
            await context.SaveChangesAsync();
        }

        int total = await context.Bookings.CountAsync();
        Console.WriteLine($"[Seeder] Bookings: Seeded {inserted} new bookings ({total} total in database).");
    }

    private static List<BookingSpec> GenerateBookingSpecs(DateOnly today)
    {
        var list = new List<BookingSpec>();

        // 42 Completed Stays (past dates)
        int[] completedOffsets =
        {
            -75, -70, -66, -62, -58, -54, -50, -46, -45, -42, -40, -38,
            -36, -34, -32, -30, -28, -26, -25, -24, -22, -20, -19, -18,
            -16, -14, -12, -10, -8, -6, -5, -4, -3, -2, -1, -82, -88,
            -94, -100, -106, -112, -118
        };
        int[] completedNights =
        {
            3, 2, 4, 1, 3, 2, 5, 2, 3, 1, 4, 2, 3, 2, 1, 2, 1, 1,
            2, 3, 2, 4, 1, 3, 2, 2, 3, 1, 4, 2, 3, 2, 1, 2, 1, 3,
            2, 4, 2, 3, 1, 2
        };
        int[] completedGuests =
        {
            2, 1, 3, 2, 4, 1, 2, 2, 3, 1, 4, 2, 2, 1, 2, 1, 2, 1,
            2, 3, 2, 4, 1, 3, 2, 2, 3, 1, 4, 2, 2, 1, 2, 1, 2, 3,
            2, 4, 2, 3, 1, 2
        };

        for (int i = 0; i < completedOffsets.Length; i++)
        {
            DateOnly checkIn = today.AddDays(completedOffsets[i]);
            DateOnly checkOut = checkIn.AddDays(completedNights[i]);
            list.Add(new BookingSpec(checkIn, checkOut, completedGuests[i], BookingStatus.Completed, 14));
        }

        // 12 Confirmed Stays (upcoming dates)
        int[] confirmedOffsets = { 2, 4, 6, 8, 11, 14, 17, 21, 25, 30, 35, 42 };
        int[] confirmedNights = { 2, 3, 1, 4, 2, 3, 2, 5, 3, 2, 4, 3 };
        int[] confirmedGuests = { 2, 1, 2, 4, 2, 3, 1, 2, 3, 2, 4, 2 };

        for (int i = 0; i < confirmedOffsets.Length; i++)
        {
            DateOnly checkIn = today.AddDays(confirmedOffsets[i]);
            DateOnly checkOut = checkIn.AddDays(confirmedNights[i]);
            list.Add(new BookingSpec(checkIn, checkOut, confirmedGuests[i], BookingStatus.Confirmed, 10));
        }

        // 10 Pending Stays (upcoming dates)
        int[] pendingOffsets = { 3, 5, 9, 12, 15, 18, 22, 27, 33, 40 };
        int[] pendingNights = { 2, 1, 3, 2, 4, 2, 3, 1, 2, 3 };
        int[] pendingGuests = { 1, 2, 2, 3, 1, 4, 2, 1, 2, 2 };

        for (int i = 0; i < pendingOffsets.Length; i++)
        {
            DateOnly checkIn = today.AddDays(pendingOffsets[i]);
            DateOnly checkOut = checkIn.AddDays(pendingNights[i]);
            list.Add(new BookingSpec(checkIn, checkOut, pendingGuests[i], BookingStatus.Pending, 3));
        }

        // 6 Cancelled Stays (mixed dates)
        int[] cancelledOffsets = { -15, -7, 4, 10, 16, 24 };
        int[] cancelledNights = { 3, 2, 2, 1, 3, 2 };
        int[] cancelledGuests = { 2, 1, 2, 1, 3, 2 };

        for (int i = 0; i < cancelledOffsets.Length; i++)
        {
            DateOnly checkIn = today.AddDays(cancelledOffsets[i]);
            DateOnly checkOut = checkIn.AddDays(cancelledNights[i]);
            list.Add(new BookingSpec(checkIn, checkOut, cancelledGuests[i], BookingStatus.Cancelled, 8));
        }

        // 4 Rejected Stays
        int[] rejectedOffsets = { -11, -3, 6, 13 };
        int[] rejectedNights = { 2, 1, 3, 2 };
        int[] rejectedGuests = { 2, 1, 2, 3 };

        for (int i = 0; i < rejectedOffsets.Length; i++)
        {
            DateOnly checkIn = today.AddDays(rejectedOffsets[i]);
            DateOnly checkOut = checkIn.AddDays(rejectedNights[i]);
            list.Add(new BookingSpec(checkIn, checkOut, rejectedGuests[i], BookingStatus.Rejected, 5));
        }

        return list;
    }

    private static async Task SeedReviewsAsync(ApplicationDbContext context)
    {
        // Business Rule: Reviews can ONLY be linked to bookings with status Completed.
        // Each booking can have at most ONE review (BookingId is unique).
        List<Booking> completedBookings = await context.Bookings
            .Include(b => b.Review)
            .Where(b => b.Status == BookingStatus.Completed && b.Review == null)
            .OrderBy(b => b.Id)
            .ToListAsync();

        if (completedBookings.Count == 0)
        {
            int existingCount = await context.Reviews.CountAsync();
            Console.WriteLine($"[Seeder] Reviews: No unreviewed completed bookings found ({existingCount} total reviews in database).");
            return;
        }

        var sampleReviews = new (int Rating, string Comment)[]
        {
            (5, "Exceptional stay from start to finish. The concierge team was attentive, and the room was immaculately clean."),
            (5, "A truly memorable experience! The morning breakfast was lavish and the bed offered the best sleep of our vacation."),
            (4, "Very pleasant atmosphere with comfortable rooms. Check-in was smooth and the waterfront views were breathtaking."),
            (5, "Outstanding hospitality! From the valet to the front desk, everyone made us feel like esteemed guests."),
            (4, "Spacious suite and peaceful soundproofing. Highly recommend for business trips or relaxing weekend getaways."),
            (3, "Good location and friendly staff. The room was clean, though room service took a bit longer than expected on Friday night."),
            (5, "Exceeded all expectations. The rooftop pool, spa amenities, and sunset vistas made this trip unforgettable."),
            (4, "A charming hotel with character and warm hospitality. The garden area was a peaceful oasis after a long flight."),
            (5, "World-class facilities and impeccable hygiene. We will definitely be making this our go-to hotel in the city."),
            (4, "Comfortable beds and excellent Wi-Fi connection for remote work. The breakfast buffet had great local options."),
            (5, "Flawless luxury experience! The attention to detail in the room design and turndown service was impressive."),
            (3, "Solid, comfortable stay. Everything was as advertised, though parking during peak evening hours was a bit tight."),
            (5, "Brilliant location near local heritage sights and fine dining. The staff gave us wonderful restaurant recommendations."),
            (4, "Modern, stylish rooms with plenty of natural light. Loved the complimentary espresso machine and deep soaking tub."),
            (5, "Warm Arabic hospitality at its finest. The welcome dates and aromatic coffee set a delightful tone."),
            (2, "The hotel design is beautiful, but our air conditioning unit made a humming noise throughout the first night."),
            (4, "Convenient airport access without any runway noise. Great fitness center and prompt wake-up call."),
            (5, "One of the best hotels in the region. The presidential floor lounge was serene and the culinary offerings were first-rate.")
            ,
            (4, "A lovely stay with thoughtful service, a quiet room, and an excellent location for exploring the city."),
            (5, "Everything felt carefully considered, from the welcoming check-in to the beautifully prepared breakfast."),
            (4, "The room was bright and comfortable, and the team provided genuinely helpful local recommendations."),
            (3, "A pleasant stay overall with good facilities. A little more variety at breakfast would have made it perfect."),
            (5, "The location made sightseeing effortless, and the room was a peaceful retreat after busy days out."),
            (4, "Friendly staff, clean facilities, and a comfortable bed. I would happily return on my next trip."),
            (5, "The service was warm and professional, and the room had wonderful views over the surrounding area."),
            (4, "A polished hotel with excellent amenities and quick assistance whenever we needed it."),
            (5, "Our family had a fantastic stay. The suite was spacious, spotless, and very well arranged."),
            (3, "Good value and a convenient location. The room was comfortable but the hallway was noisy one evening."),
            (4, "The atmosphere was relaxing and the staff made us feel welcome from the moment we arrived."),
            (5, "An unforgettable visit with beautiful design, attentive hospitality, and outstanding food."),
            (4, "Comfortable accommodation in a great neighborhood. The check-out process was especially easy."),
            (5, "The room was even better than the photos, with excellent housekeeping and a very comfortable mattress."),
            (4, "A reliable choice for a city break with helpful staff and plenty of nearby restaurants."),
            (2, "The stay had several good points, but the bathroom needed maintenance during our visit."),
            (5, "Perfect for a relaxing holiday. We enjoyed every detail and appreciated the thoughtful welcome."),
            (4, "Lovely views, clean rooms, and a calm atmosphere. The team handled every request quickly."),
            (5, "A standout experience with excellent privacy, beautiful surroundings, and genuinely caring service."),
            (4, "The hotel was well located and the room had everything needed for a comfortable business trip."),
            (3, "Comfortable and well placed, although the gym was smaller than expected."),
            (5, "The staff were exceptional and the whole property had a warm, memorable character."),
            (4, "A very enjoyable stay with delicious food and a room that was cleaned to a high standard.")
        };

        int inserted = 0;
        int reviewIndex = 0;

        foreach (var booking in completedBookings)
        {
            if (reviewIndex >= sampleReviews.Length)
            {
                break; // We have seeded enough reviews
            }

            // Verify idempotency against DB
            bool alreadyReviewed = await context.Reviews.AnyAsync(r => r.BookingId == booking.Id);
            if (alreadyReviewed)
            {
                continue;
            }

            var (rating, comment) = sampleReviews[reviewIndex];
            reviewIndex++;

            context.Reviews.Add(new Review
            {
                UserId = booking.UserId,
                HotelId = booking.HotelId,
                BookingId = booking.Id,
                Rating = rating,
                Comment = comment,
                CreatedAt = booking.CheckOut.ToDateTime(TimeOnly.MinValue).AddDays(1)
            });

            inserted++;
        }

        if (inserted > 0)
        {
            await context.SaveChangesAsync();
        }

        int total = await context.Reviews.CountAsync();
        Console.WriteLine($"[Seeder] Reviews: Seeded {inserted} new reviews ({total} total in database).");
    }

    private sealed record RoomTypeTemplate(
        string Name,
        int Capacity,
        string BedType,
        decimal BasePrice,
        string Description);

    private sealed record BookingSpec(
        DateOnly CheckIn,
        DateOnly CheckOut,
        int Guests,
        BookingStatus Status,
        int CreatedDaysBeforeCheckIn);
}
