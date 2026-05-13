using System.ComponentModel.DataAnnotations;

namespace QLTTBTXH.API.DTOs.HoSoNhanNuoi;

public class HoSoNhanNuoiDto
{
    public string MaHSNhanNuoi { get; set; } = null!;
    // Alias dùng cho FE
    public string MaHoSoNhanNuoi => MaHSNhanNuoi;
    public string MaYeuCauNhan { get; set; } = null!;
    public string MaTre { get; set; } = null!;
    public string? TenTre { get; set; }
    public string MaCanBo { get; set; } = null!;
    // Aliases cho FE
    public string MaCanBoLap => MaCanBo;
    public string? TenCanBo { get; set; }
    public string? TenCanBoLap => TenCanBo;
    // Thông tin người nhận nuôi (từ YeuCauNhanNuoi.NguoiNhan)
    public string? TenNguoiNhan { get; set; }
    public string? SDTNguoiNhan { get; set; }
    public string? LyDoNhanNuoi { get; set; }
    public string? MongMuonVeTre { get; set; }
    public decimal? ThuNhapHangThang { get; set; }
    public string? NgheNghiep { get; set; }
    public DateTime NgayLap { get; set; }
    public DateTime? NgayDuyet { get; set; }
    public string TrangThai { get; set; } = null!;
    public string? GhiChu { get; set; }
    public string Id => MaHSNhanNuoi;
    public string Status => TrangThai;
}

public class CreateHoSoNhanNuoiDto
{
    [Required] public string MaYeuCauNhan { get; set; } = null!;
    [Required] public string MaTre { get; set; } = null!;
    public string? MaCanBo { get; set; }
    public string? GhiChu { get; set; }
}

public class UpdateHoSoNhanNuoiDto
{
    public string? MaTre { get; set; }
    public string? TrangThai { get; set; }
    public string? GhiChu { get; set; }
}
