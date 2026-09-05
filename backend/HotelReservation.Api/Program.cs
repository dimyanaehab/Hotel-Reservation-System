using HotelReservation.Api.Data;
using HotelReservation.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
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

// Database Connection
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IRoomService, RoomService>();

// JWT Authentication Configuration
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "DefaultFallbackSecretKey1234567890!")),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

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

// Authentication MUST come before Authorization in the pipeline
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();