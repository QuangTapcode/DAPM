using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace QLTTBTXH.API.Services;

public interface IJwtService
{
    string GenerateToken(string userId, string fullName, string? email, IEnumerable<string> roles);
}

public class JwtService : IJwtService
{
    private readonly IConfiguration _cfg;
    public JwtService(IConfiguration cfg) { _cfg = cfg; }

    public string GenerateToken(string userId, string fullName, string? email, IEnumerable<string> roles)
    {
        var key = _cfg["Jwt:Key"] ?? throw new InvalidOperationException("Missing Jwt:Key");
        var issuer = _cfg["Jwt:Issuer"];
        var audience = _cfg["Jwt:Audience"];
        var hours = int.TryParse(_cfg["Jwt:ExpiresInHours"], out var h) ? h : 24;

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId),
            new(ClaimTypes.NameIdentifier, userId),
            new(ClaimTypes.Name, fullName),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
        if (!string.IsNullOrWhiteSpace(email))
            claims.Add(new Claim(ClaimTypes.Email, email));
        foreach (var r in roles)
            claims.Add(new Claim(ClaimTypes.Role, r));

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(hours),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
