using System.ComponentModel.DataAnnotations;

namespace QLTTBTXH.API.DTOs.YeuCauGuiTre;

public class YeuCauGuiTreDto
{
    public string MaYeuCauGuiTre { get; set; } = null!;
    public string MaNguoiGui { get; set; } = null!;
    public string? TenNguoiGui { get; set; }
    public string MaLoaiNguoiGui { get; set; } = null!;
    public string? TenLoaiNguoiGui { get; set; }
    public string? QuanHeVoiTre { get; set; }
    public string? LyDoGui { get; set; }
    public DateTime NgayTao { get; set; }
    public DateTime? NgayCapNhat { get; set; }
    public string TrangThaiYC { get; set; } = null!;
    public string? GhiChu { get; set; }

    // Thông tin liên hệ người gửi (từ bảng NGUOIDUNG)
    public string? SenderCccd { get; set; }
    public string? SenderPhone { get; set; }
    public string? SenderEmail { get; set; }
    public string? SenderProvince { get; set; }
    public string? SenderWard { get; set; }
    public string? SenderAddress { get; set; }

    public ThongTinTreTamDto? ThongTinTre { get; set; }
    public List<string> GiayTos { get; set; } = new();

    /// <summary>Mã trẻ thực sau khi yêu cầu được duyệt (null nếu chưa duyệt).</summary>
    public string? MaTre { get; set; }

    // FE compatibility aliases
    public string Id => MaYeuCauGuiTre;
    public string Status => TrangThaiYC;
    public string SenderId => MaNguoiGui;
    public DateTime CreatedAt => NgayTao;
    public DateTime? UpdatedAt => NgayCapNhat;
}

public class ThongTinTreTamDto
{
    public string? MaThongTin { get; set; }
    public string TenTre { get; set; } = null!;
    public DateTime? NgaySinh { get; set; }
    public string GioiTinh { get; set; } = "Khác";
    public string? DanToc { get; set; }
}

public class CreateYeuCauGuiTreDto
{
    /// <summary>Nếu không truyền, BE sẽ lấy user hiện tại từ JWT.</summary>
    public string? MaNguoiGui { get; set; }
    [Required] public string MaLoaiNguoiGui { get; set; } = null!;
    public string? QuanHeVoiTre { get; set; }
    public string? LyDoGui { get; set; }
    public string? GhiChu { get; set; }

    [Required] public ThongTinTreTamDto ThongTinTre { get; set; } = new() { TenTre = "" };
}

public class UpdateYeuCauGuiTreDto
{
    public string? MaLoaiNguoiGui { get; set; }
    public string? QuanHeVoiTre { get; set; }
    public string? LyDoGui { get; set; }
    public string? TrangThaiYC { get; set; }
    public string? GhiChu { get; set; }
    public ThongTinTreTamDto? ThongTinTre { get; set; }
}

public class RejectDto { public string? Reason { get; set; } public string? ReasonReject { get; set; } }
