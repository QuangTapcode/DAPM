using System.ComponentModel.DataAnnotations;

namespace QLTTBTXH.API.DTOs.Tre;

public class TreDto
{
    public string MaTre { get; set; } = null!;
    public string HoTen { get; set; } = null!;
    public DateTime? NgaySinh { get; set; }
    public string GioiTinh { get; set; } = null!;
    public string? MaPhuongXa { get; set; }
    public string? TenPhuongXa { get; set; }
    public string? DiaChiCuThe { get; set; }
    public string? DanToc { get; set; }
    public string? TinhCach { get; set; }
    public string? SoThich { get; set; }
    public string? DacDiemNhanDang { get; set; }
    public string TrangThai { get; set; } = null!;
    public DateTime? NgayTiepNhan { get; set; }
    public DateTime? NgayCapNhat { get; set; }
    public DateTime? NgayNhanNuoi { get; set; }
    public string? GhiChu { get; set; }
    public string? MaNguoiCapNhat { get; set; }
    public string? HinhAnh { get; set; }

    // FE compatibility (childApi.js uses "id", "status", "createdAt", ...)
    public string Id => MaTre;
    public string FullName => HoTen;
    public string Status => TrangThai;
}

public class CreateTreDto
{
    [Required] public string HoTen { get; set; } = null!;
    public DateTime? NgaySinh { get; set; }
    [Required] public string GioiTinh { get; set; } = "Khác";
    public string? MaPhuongXa { get; set; }
    public string? DiaChiCuThe { get; set; }
    public string? DanToc { get; set; }
    public string? TinhCach { get; set; }
    public string? SoThich { get; set; }
    public string? DacDiemNhanDang { get; set; }
    public string TrangThai { get; set; } = "Chờ tiếp nhận";
    public DateTime? NgayTiepNhan { get; set; }
    public DateTime? NgayNhanNuoi { get; set; }
    public string? GhiChu { get; set; }
    public string? HinhAnh { get; set; }
}

public class UpdateTreDto
{
    public string? HoTen { get; set; }
    public DateTime? NgaySinh { get; set; }
    public string? GioiTinh { get; set; }
    public string? MaPhuongXa { get; set; }
    public string? DiaChiCuThe { get; set; }
    public string? DanToc { get; set; }
    public string? TinhCach { get; set; }
    public string? SoThich { get; set; }
    public string? DacDiemNhanDang { get; set; }
    public string? TrangThai { get; set; }
    public DateTime? NgayTiepNhan { get; set; }
    public DateTime? NgayNhanNuoi { get; set; }
    public string? GhiChu { get; set; }
    public string? HinhAnh { get; set; }
}
