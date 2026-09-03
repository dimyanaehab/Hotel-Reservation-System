using HotelReservation.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HotelReservation.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Hotel> Hotels => Set<Hotel>();

    public DbSet<RoomType> RoomTypes => Set<RoomType>();

    public DbSet<RoomInventory> RoomInventories => Set<RoomInventory>();

    public DbSet<Booking> Bookings => Set<Booking>();

    public DbSet<Review> Reviews => Set<Review>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureUser(modelBuilder);
        ConfigureHotel(modelBuilder);
        ConfigureRoomType(modelBuilder);
        ConfigureRoomInventory(modelBuilder);
        ConfigureBooking(modelBuilder);
        ConfigureReview(modelBuilder);
    }

    private static void ConfigureUser(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(user => user.Id);

            entity.Property(user => user.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(user => user.Email)
                .IsRequired()
                .HasMaxLength(255);

            entity.HasIndex(user => user.Email)
                .IsUnique();

            entity.Property(user => user.PasswordHash)
                .IsRequired()
                .HasMaxLength(500);

            entity.Property(user => user.Role)
                .HasConversion<string>()
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(user => user.CreatedAt)
                .IsRequired();
        });
    }

    private static void ConfigureHotel(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Hotel>(entity =>
        {
            entity.HasKey(hotel => hotel.Id);

            entity.Property(hotel => hotel.Name)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(hotel => hotel.City)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(hotel => hotel.Address)
                .IsRequired()
                .HasMaxLength(300);

            entity.Property(hotel => hotel.Description)
                .HasMaxLength(2000);

            entity.Property(hotel => hotel.ThumbnailUrl)
                .HasMaxLength(2048);

            entity.Property(hotel => hotel.CreatedAt)
                .IsRequired();

            entity.HasIndex(hotel => hotel.City);

            entity.ToTable(table =>
            {
                table.HasCheckConstraint(
                    "CK_Hotels_Stars",
                    "[Stars] BETWEEN 1 AND 5");
            });

            entity.HasMany(hotel => hotel.RoomTypes)
                .WithOne(roomType => roomType.Hotel)
                .HasForeignKey(roomType => roomType.HotelId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    private static void ConfigureRoomType(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RoomType>(entity =>
        {
            entity.HasKey(roomType => roomType.Id);

            entity.Property(roomType => roomType.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(roomType => roomType.BedType)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(roomType => roomType.BasePrice)
                .HasPrecision(18, 2);

            entity.Property(roomType => roomType.Description)
                .HasMaxLength(2000);

            entity.HasIndex(roomType => new
            {
                roomType.HotelId,
                roomType.Name
            }).IsUnique();

            entity.ToTable(table =>
            {
                table.HasCheckConstraint(
                    "CK_RoomTypes_Capacity",
                    "[Capacity] > 0");

                table.HasCheckConstraint(
                    "CK_RoomTypes_BasePrice",
                    "[BasePrice] >= 0");
            });
        });
    }

    private static void ConfigureRoomInventory(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RoomInventory>(entity =>
        {
            entity.HasKey(inventory => inventory.Id);

            entity.Property(inventory => inventory.Date)
                .HasColumnType("date")
                .IsRequired();

            entity.HasIndex(inventory => new
            {
                inventory.RoomTypeId,
                inventory.Date
            }).IsUnique();

            entity.ToTable(table =>
            {
                table.HasCheckConstraint(
                    "CK_RoomInventories_TotalRooms",
                    "[TotalRooms] >= 0");

                table.HasCheckConstraint(
                    "CK_RoomInventories_SoldRooms",
                    "[SoldRooms] >= 0 AND [SoldRooms] <= [TotalRooms]");
            });

            entity.HasOne(inventory => inventory.RoomType)
                .WithMany(roomType => roomType.RoomInventories)
                .HasForeignKey(inventory => inventory.RoomTypeId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    private static void ConfigureBooking(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(booking => booking.Id);

            entity.Property(booking => booking.CheckIn)
                .HasColumnType("date")
                .IsRequired();

            entity.Property(booking => booking.CheckOut)
                .HasColumnType("date")
                .IsRequired();

            entity.Property(booking => booking.TotalPrice)
                .HasPrecision(18, 2);

            entity.Property(booking => booking.Status)
                .HasConversion<string>()
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(booking => booking.CreatedAt)
                .IsRequired();

            entity.HasIndex(booking => booking.UserId);

            entity.HasIndex(booking => booking.Status);

            entity.ToTable(table =>
            {
                table.HasCheckConstraint(
                    "CK_Bookings_Dates",
                    "[CheckOut] > [CheckIn]");

                table.HasCheckConstraint(
                    "CK_Bookings_Nights",
                    "[Nights] > 0");

                table.HasCheckConstraint(
                    "CK_Bookings_NumberOfGuests",
                    "[NumberOfGuests] > 0");

                table.HasCheckConstraint(
                    "CK_Bookings_TotalPrice",
                    "[TotalPrice] >= 0");
            });

            entity.HasOne(booking => booking.User)
                .WithMany(user => user.Bookings)
                .HasForeignKey(booking => booking.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(booking => booking.Hotel)
                .WithMany(hotel => hotel.Bookings)
                .HasForeignKey(booking => booking.HotelId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(booking => booking.RoomType)
                .WithMany(roomType => roomType.Bookings)
                .HasForeignKey(booking => booking.RoomTypeId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

    private static void ConfigureReview(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(review => review.Id);

            entity.Property(review => review.Comment)
                .HasMaxLength(1000);

            entity.Property(review => review.CreatedAt)
                .IsRequired();

            entity.HasIndex(review => review.BookingId)
                .IsUnique();

            entity.ToTable(table =>
            {
                table.HasCheckConstraint(
                    "CK_Reviews_Rating",
                    "[Rating] BETWEEN 1 AND 5");
            });

            entity.HasOne(review => review.User)
                .WithMany(user => user.Reviews)
                .HasForeignKey(review => review.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(review => review.Hotel)
                .WithMany(hotel => hotel.Reviews)
                .HasForeignKey(review => review.HotelId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(review => review.Booking)
                .WithOne(booking => booking.Review)
                .HasForeignKey<Review>(review => review.BookingId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}