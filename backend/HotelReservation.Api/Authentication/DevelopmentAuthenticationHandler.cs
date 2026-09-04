using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace HotelReservation.Api.Authentication;

public sealed class DevelopmentAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public DevelopmentAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder) : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        string userId = Request.Headers["X-Test-User-Id"].FirstOrDefault() ?? "1";
        string role = Request.Headers["X-Test-Role"].FirstOrDefault() ?? "User";

        if (!int.TryParse(userId, out int parsedUserId) || parsedUserId <= 0)
        {
            return Task.FromResult(AuthenticateResult.Fail("X-Test-User-Id must be a positive number."));
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, parsedUserId.ToString()),
            new Claim(ClaimTypes.Name, $"Swagger test user {parsedUserId}"),
            new Claim(ClaimTypes.Role, role)
        };

        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
