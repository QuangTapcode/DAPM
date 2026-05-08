using System.ComponentModel.DataAnnotations;

namespace QLTTBTXH.API.DTOs.NguoiDung;

public class NguoiDungDto
{
    public string Id { get; set; } = null!;
    public string HoTen { get; set; } = null!;
    public string SDT { get; set; } = null!;
    public string? Email { get; set; }
    public string? CCCD { get; set; }
    public string GioiTinh { get; set; } = null!;
    public DateTime? NgaySinh { get; set; }
    public string? MaXaPhuong { get; set; }
    public string? DiaChiCuThe { get; set; }
    public DateTime NgayTao { get; set; }
    public bool TrangThaiTK { get; set; }
    public List<string> Roles { get; set; } = new();
    public string Role { get; set; } = "guest";
    /// <summary>Alias of HoTen for FE compatibility.</summary>
    public string FullName => HoTen;
    public string Phone => SDT;
    public bool IsActive => TrangThaiTK;
    public DateTime CreatedAt => NgayTao;
}

public class CreateNguoiDungDto
{
    [Required] public string SDT { get; set; } = null!;
    [Required] public string HoTen { get; set; } = null!;
    public string Password { get; set; } = "123456";
    [Required] public string GioiTinh { get; set; } = "Khác";
    public DateTime? NgaySinh { get; set; }
    public string? CCCD { get; set; }
    public string? Email { get; set; }
    public string? MaXaPhuong { get; set; }
    public string? DiaChiCuThe { get; set; }
    /// <summary>Role codes to assign (ADMI, QLNT, QLNN, NGGT, NGNN, TPQL). Optional.</summary>
    public List<string>? Roles { get; set; }
}

public class UpdateNguoiDungDto
{
    public string? HoTen { get; set; }
    public string? SDT { get; set; }
    public string? Email { get; set; }
    public string? CCCD { get; set; }
    public string? GioiTinh { get; set; }
    public DateTime? NgaySinh { get; set; }
    public string? MaXaPhuong { get; set; }
    public string? DiaChiCuThe { get; set; }
    public bool? TrangThaiTK { get; set; }
    public List<string>? Roles { get; set; }
}

public class UpdateStatusDto { public bool TrangThaiTK { get; set; } }
