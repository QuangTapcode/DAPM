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
    public int? MongMuonTuoiToiDa { get; set; }
    public string? MongMuonGioiTinh { get; set; }
    public decimal ThuNhapHangThang { get; set; }
    public int SoConDangNuoi { get; set; }
    public string TinhTrangHonNhan { get; set; } = "Độc thân";
    public string LoaiNoiO { get; set; } = "Nhà sở hữu";
    public bool SucKhoeDatYeuCau { get; set; }
    public string QuanHeVoiTre { get; set; } = "Không";
    public bool HopLeSoBo { get; set; }
    public decimal DiemUuTien { get; set; }
    public string? LyDoTuChoiSoBo { get; set; }
    public string TrangThai { get; set; } = null!;
    public DateTime NgayTao { get; set; }
    public string? GhiChu { get; set; }
    public List<string> GiayTos { get; set; } = new();
    public int SoGiayTo { get; set; }
    public int SoGiayToHopLe { get; set; }

    // FE aliases
    public string Id => MaYeuCauNhan;
    public string AdopterId => MaNguoiNhan;
    public string Status => TrangThai;
}

public class CreateYeuCauNhanNuoiDto
{
    /// <summary>Nếu null thì lấy từ JWT.</summary>
    public decimal ThuNhapHangThang { get; set; }
    public int SoConDangNuoi { get; set; }
    public string TinhTrangHonNhan { get; set; } = "Độc thân";
    public string LoaiNoiO { get; set; } = "Nhà sở hữu";
    public bool SucKhoeDatYeuCau { get; set; } = true;
    public string QuanHeVoiTre { get; set; } = "Không";
    public string? LyDoNhanNuoi { get; set; }
    public int? MongMuonTuoiToiDa { get; set; }
    public string? MongMuonGioiTinh { get; set; }
    public string? GhiChu { get; set; }
}

public class UpdateYeuCauNhanNuoiDto
{
    public decimal? ThuNhapHangThang { get; set; }
    public int? SoConDangNuoi { get; set; }
    public string? TinhTrangHonNhan { get; set; }
    public string? LoaiNoiO { get; set; }
    public bool? SucKhoeDatYeuCau { get; set; }
    public string? QuanHeVoiTre { get; set; }
    public string? LyDoNhanNuoi { get; set; }
    public int? MongMuonTuoiToiDa { get; set; }
    public string? MongMuonGioiTinh { get; set; }
    public string? TrangThai { get; set; }
    public string? GhiChu { get; set; }
}
public class CreateYeuCauNhanNuoiSubmitDto
{
    public decimal ThuNhapHangThang { get; set; }
    public int SoConDangNuoi { get; set; }
    public string TinhTrangHonNhan { get; set; } = null!;
    public string LoaiNoiO { get; set; } = null!;
    public bool SucKhoeDatYeuCau { get; set; }
    public string QuanHeVoiTre { get; set; } = null!;
    public string LyDoNhanNuoi { get; set; } = null!;
    public int? MongMuonTuoiToiDa { get; set; }
    public string? MongMuonGioiTinh { get; set; }
    public string? GhiChu { get; set; }

    public List<string> MaLoaiGiayTos { get; set; } = new();
    public List<IFormFile> Files { get; set; } = new();
}
