using HotelReservation.Api.Data;
using HotelReservation.Api.Services;
using HotelReservation.Api.Services.Interfaces;
using HotelReservation.Api.Authentication;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Enter the JWT returned by login."
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        [new OpenApiSecurityScheme
        {
            Reference = new OpenApiReference
            {
                Type = ReferenceType.SecurityScheme,
                Id = "Bearer"
            }
        }] = Array.Empty<string>()
    });

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

void ConfigureJwt(JwtBearerOptions options)
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
            builder.Configuration["Jwt:Key"] ?? "DefaultFallbackSecretKey1234567890!")),
        ValidateIssuer = false,
        ValidateAudience = false
    };
}

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = "DevelopmentOrJwt";
            options.DefaultChallengeScheme = "DevelopmentOrJwt";
        })
        .AddPolicyScheme("DevelopmentOrJwt", null, options =>
        {
            options.ForwardDefaultSelector = context =>
                context.Request.Headers.Authorization.ToString()
                    .StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
                    ? JwtBearerDefaults.AuthenticationScheme
                    : "Development";
        })
        .AddScheme<AuthenticationSchemeOptions, DevelopmentAuthenticationHandler>(
            "Development", null)
        .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, ConfigureJwt);
}
else
{
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(ConfigureJwt);
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

// Database Connection
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
builder.Services.AddScoped<IReviewService, ReviewService>();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    await DevelopmentDataSeeder.SeedAsync(app.Services);
    app.UseSwagger();
    app.UseSwaggerUI();

    string frontendPath = Path.GetFullPath(Path.Combine(
        app.Environment.ContentRootPath, "..", "..", "frontend"));
    var frontendFiles = new PhysicalFileProvider(frontendPath);
    app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = frontendFiles });
    app.UseStaticFiles(new StaticFileOptions { FileProvider = frontendFiles });
}

app.UseHttpsRedirection();

// TEMPORARY DEVELOPMENT CORS
if (app.Environment.IsDevelopment())
{
    app.UseCors("TemporaryDevelopmentCors");
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
