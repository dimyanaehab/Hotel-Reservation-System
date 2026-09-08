# Hotel Reservation System Documentation

## Architecture

The backend is organized as a four-project .NET solution:

| Project | Responsibility |
| --- | --- |
| `HotelReservation.API` | HTTP controllers, JWT middleware, dependency registration, Swagger, and frontend hosting |
| `HotelReservation.Application` | Booking, authentication, room, and review workflows; DTOs and service interfaces |
| `HotelReservation.Domain` | Hotel reservation entities and domain enums |
| `HotelReservation.Infrastructure` | EF Core database context, migrations, and development seed data |

HTTP routes and JSON DTO shapes are unchanged by the project split. Existing frontend API calls therefore continue to use the same endpoints.

## Frontend

The frontend remains framework-light and is served by the API during development. Shared API and session behavior lives in `frontend/js/api.js` and `frontend/js/session.js`. Page scripts retain their existing names and selectors to preserve current integrations.

The Hotels/Search backend remains the Person 2 integration boundary. The current reorganization does not add placeholder API data or change that contract.

## Build and run

From `backend/HotelReservation.Api`:

```powershell
dotnet build HotelReservation.sln
dotnet run --project HotelReservation.API/HotelReservation.API.csproj
```

Swagger is available at `/swagger` in Development. The website is served from the repository-level `frontend` directory.
