using System.ComponentModel.DataAnnotations;

namespace QLTTBTXH.API.DTOs.HoSoTiepNhan;

public class HoSoTiepNhanDto
{
    public string MaHSTiepNhan { get; set; } = null!;
    public string MaYeuCauGuiTre { get; set; } = null!;
    public string? MaTre { get; set; }
    public string? TenTre { get; set; }
    public string MaCanBoTiepNhan { get; set; } = null!;
    public string? TenCanBo { get; set; }
    // Thông tin người gửi trẻ (từ YeuCauGuiTre.NguoiGui)
    public string? TenNguoiGui { get; set; }
    public string? QuanHeVoiTre { get; set; }
    public string? LyDoGui { get; set; }
    public DateTime? NgaySinhTre { get; set; }
    public string? GioiTinhTre { get; set; }
    public DateTime NgayTiepNhan { get; set; }
    public string TrangThai { get; set; } = null!;
    public DateTime? NgayDuyet { get; set; }
    public string? GhiChu { get; set; }
    public string Id => MaHSTiepNhan;
    public string Status => TrangThai;
}

public class CreateHoSoTiepNhanDto
{
    [Required] public string MaYeuCauGuiTre { get; set; } = null!;
    public string? MaTre { get; set; }
    public string? MaCanBoTiepNhan { get; set; }
    public string? GhiChu { get; set; }
}

public class UpdateHoSoTiepNhanDto
{
    public string? MaTre { get; set; }
    public string? TrangThai { get; set; }
    public string? GhiChu { get; set; }
}
