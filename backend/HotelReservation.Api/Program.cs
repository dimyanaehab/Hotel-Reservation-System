using HotelReservation.Api.Data;
using HotelReservation.Api.Services;
using HotelReservation.Api.Services.Interfaces;
using HotelReservation.Api.Authentication;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.OpenApi.Models;
var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    if (builder.Environment.IsDevelopment())
    {
        options.AddSecurityDefinition("TestUserId", new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.ApiKey,
            In = ParameterLocation.Header,
            Name = "X-Test-User-Id",
            Description = "Development only. Use 1 for the seeded customer."
        });
        options.AddSecurityDefinition("TestRole", new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.ApiKey,
            In = ParameterLocation.Header,
            Name = "X-Test-Role",
            Description = "Development only. Use User or Admin."
        });
        options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            [new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "TestUserId" } }] = Array.Empty<string>(),
            [new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "TestRole" } }] = Array.Empty<string>()
        });
    }
});

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddAuthentication("Development")
        .AddScheme<AuthenticationSchemeOptions, DevelopmentAuthenticationHandler>("Development", null);
}

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
{
    if (builder.Environment.IsDevelopment())
    {
        options.UseInMemoryDatabase("HotelReservationSwaggerTests")
            .ConfigureWarnings(warnings => warnings.Ignore(
                InMemoryEventId.TransactionIgnoredWarning));
    }
    else
    {
        options.UseSqlServer(
            builder.Configuration.GetConnectionString("DefaultConnection"));
    }
});
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IRoomService, RoomService>();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    await DevelopmentDataSeeder.SeedAsync(app.Services);
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();

// TEMPORARY DEVELOPMENT CORS
if (app.Environment.IsDevelopment())
{
    app.UseCors("TemporaryDevelopmentCors");
}

app.UseAuthorization();

app.MapControllers();

app.Run();
