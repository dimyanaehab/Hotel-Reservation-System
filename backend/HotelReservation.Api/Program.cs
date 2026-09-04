using HotelReservation.Api.Data;
using HotelReservation.Api.Services;
using HotelReservation.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// TEMPORARY DEVELOPMENT CORS
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("TemporaryDevelopmentCors", policy =>
        {
            policy
                .WithOrigins(
                    "http://127.0.0.1:5500",
                    "http://localhost:5500",
                    "http://127.0.0.1:5501",
                    "http://localhost:5501")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
    });
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IRoomService, RoomService>();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// TEMPORARY DEVELOPMENT CORS
if (app.Environment.IsDevelopment())
{
    app.UseCors("TemporaryDevelopmentCors");
}

app.UseAuthorization();

app.MapControllers();

app.Run();
