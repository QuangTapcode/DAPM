using System.ComponentModel.DataAnnotations;

namespace QLTTBTXH.API.DTOs.YeuCauNhanNuoi;

public class YeuCauNhanNuoiDto
{
    public string MaYeuCauNhan { get; set; } = null!;
    public string MaNguoiNhan { get; set; } = null!;
    public string? TenNguoiNhan { get; set; }
    public string? SDTNguoiNhan { get; set; }
    public DateTime? NgaySinhNguoiNhan { get; set; }
    public string? LyDoNhanNuoi { get; set; }
    public string? MongMuonVeTre { get; set; }
    public decimal? ThuNhapHangThang { get; set; }
    public string? NgheNghiep { get; set; }
    public DateTime NgayTao { get; set; }
    public DateTime? NgayCapNhat { get; set; }
    public string TrangThai { get; set; } = null!;
    public string? NguoiDuyet { get; set; }
    public List<string> GiayTos { get; set; } = new();

    // FE aliases
    public string Id => MaYeuCauNhan;
    public string AdopterId => MaNguoiNhan;
    public string Status => TrangThai;
    public DateTime CreatedAt => NgayTao;
    public DateTime? UpdatedAt => NgayCapNhat;
}

public class CreateYeuCauNhanNuoiDto
{
    /// <summary>Nếu null thì lấy từ JWT.</summary>
    public string? MaNguoiNhan { get; set; }
    public string? LyDoNhanNuoi { get; set; }
    public string? MongMuonVeTre { get; set; }
    public decimal? ThuNhapHangThang { get; set; }
    public string? NgheNghiep { get; set; }
}

public class UpdateYeuCauNhanNuoiDto
{
    public string? LyDoNhanNuoi { get; set; }
    public string? MongMuonVeTre { get; set; }
    public decimal? ThuNhapHangThang { get; set; }
    public string? NgheNghiep { get; set; }
    public string? TrangThai { get; set; }
}
