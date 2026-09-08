# LumaStay Hotel Reservation System

LumaStay is a .NET 8 Web API with a plain HTML, CSS, Bootstrap, and JavaScript frontend.

## Project structure

- `backend/HotelReservation.Api/HotelReservation.API` — controllers, configuration, and application startup
- `backend/HotelReservation.Api/HotelReservation.Application` — DTOs, service contracts, and business services
- `backend/HotelReservation.Api/HotelReservation.Domain` — entities and enums
- `backend/HotelReservation.Api/HotelReservation.Infrastructure` — EF Core context, development seed data, and migrations
- `frontend` — customer and administrator pages and browser assets
- `docs` — architecture and project documentation

## Run locally

```powershell
cd backend/HotelReservation.Api
dotnet build HotelReservation.sln
dotnet run --project HotelReservation.API/HotelReservation.API.csproj
```

Open `http://localhost:5007` for the website or `http://localhost:5007/swagger` for Swagger when the development launch profile uses port 5007.

Development uses the configured in-memory database and seed accounts. Production uses the SQL Server connection configured outside source control.
