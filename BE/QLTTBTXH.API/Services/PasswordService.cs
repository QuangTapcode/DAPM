namespace QLTTBTXH.API.Services;

public interface IPasswordService
{
    string Hash(string plain);
    bool Verify(string plain, string stored);
}

/// <summary>
/// Backward-compatible password service: accepts both plain passwords (as stored in the seed SQL, e.g. '123456')
/// and BCrypt hashes. New passwords always use BCrypt.
/// </summary>
public class PasswordService : IPasswordService
{
    public string Hash(string plain) => BCrypt.Net.BCrypt.HashPassword(plain, workFactor: 11);

    public bool Verify(string plain, string stored)
    {
        if (string.IsNullOrEmpty(stored)) return false;

        // BCrypt hashes always start with $2a$, $2b$, or $2y$
        if (stored.StartsWith("$2"))
        {
            try { return BCrypt.Net.BCrypt.Verify(plain, stored); }
            catch { return false; }
        }

        // Fallback: plain-text match (for seeded accounts)
        return string.Equals(plain, stored, StringComparison.Ordinal);
    }
}
