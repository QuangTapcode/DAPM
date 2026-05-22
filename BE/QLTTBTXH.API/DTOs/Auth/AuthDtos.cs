using System.ComponentModel.DataAnnotations;

namespace QLTTBTXH.API.DTOs.Auth;

public class LoginDto
{
    /// <summary>Email hoặc Số điện thoại</summary>
    [Required] public string Email { get; set; } = null!;
    [Required] public string Password { get; set; } = null!;
}

public class RegisterDto
{
    [Required] public string SDT { get; set; } = null!;
    [Required] public string Password { get; set; } = null!;
    [Required] public string FullName { get; set; } = null!;
    public DateTime? NgaySinh { get; set; }
    [Required] public string GioiTinh { get; set; } = "Khác";
    public string? CCCD { get; set; }
    public string? Email { get; set; }
    public string? MaPhuongXa { get; set; }
    public string? DiaChiCuThe { get; set; }
}

public class UserInfoDto
{
    public string Id { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string? Email { get; set; }
    public string Phone { get; set; } = null!;
    public string? CCCD { get; set; }
    public string GioiTinh { get; set; } = null!;
    public DateTime? NgaySinh { get; set; }
    public string? MaTinhTP { get; set; }
    public string? TenTinhTP { get; set; }
    public string? MaPhuongXa { get; set; }
    public string? TenPhuongXa { get; set; }
    public string? DiaChiCuThe { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<string> Roles { get; set; } = new();
    /// <summary>Primary role name (for FE role-based routing).</summary>
    public string Role { get; set; } = "guest";
}

public class AuthResponseDto
{
    public string Token { get; set; } = null!;
    public UserInfoDto User { get; set; } = null!;
}

public class ChangePasswordDto
{
    [Required] public string OldPassword { get; set; } = null!;
    [Required] public string NewPassword { get; set; } = null!;
}
public class UpdateProfileDto
{
    [Required]
    public string FullName { get; set; } = null!;

    public string? Email { get; set; }

    [Required]
    public string Phone { get; set; } = null!;

    public string? CCCD { get; set; }

    [Required]
    public string GioiTinh { get; set; } = "Khác";

    public DateTime? NgaySinh { get; set; }

    public string? MaPhuongXa { get; set; }

    public string? DiaChiCuThe { get; set; }
}