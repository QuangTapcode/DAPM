using System.ComponentModel.DataAnnotations;

namespace QLTTBTXH.API.DTOs.LichHenGapMat;

public class LichHenGapMatDto
{
    public string MaLichGap { get; set; } = null!;
    public string MaYeuCauNhan { get; set; } = null!;
    public string MaTre { get; set; } = null!;
    public string? TenTre { get; set; }
    public string MaCanBo { get; set; } = null!;
    public string? TenCanBo { get; set; }
    // Thông tin người nhận nuôi
    public string? TenNguoiNhan { get; set; }
    public string? SDTNguoiNhan { get; set; }
    // Lịch hẹn
    public DateTime ThoiGian { get; set; }
    // Aliases cho FE
    public string NgayGap => ThoiGian.ToString("yyyy-MM-dd");
    public string GioGap => ThoiGian.ToString("HH:mm");
    public DateTime? NgayGapMat { get; set; }
    public string? DiaDiem { get; set; }
    public string TrangThai { get; set; } = null!;
    public string? KetQua { get; set; }
    // Alias FE dùng KetQuaGapMat
    public string? KetQuaGapMat => KetQua;
    public string? PhanHoiNguoiNhan { get; set; }
    public DateTime? ThoiGianDeXuatMoi { get; set; }
    public string? GhiChuCanBo { get; set; }
    // Alias FE dùng GhiChu
    public string? GhiChu => GhiChuCanBo;
    public DateTime NgayTao { get; set; }
    public DateTime? NgayCapNhat { get; set; }
    public string Id => MaLichGap;
}

public class CreateLichHenDto
{
    [Required] public string MaYeuCauNhan { get; set; } = null!;
    [Required] public string MaTre { get; set; } = null!;
    [Required] public DateTime ThoiGian { get; set; }
    public string? DiaDiem { get; set; }
    public string? MaCanBo { get; set; }
    public string? GhiChuCanBo { get; set; }
}

public class UpdateLichHenDto
{
    public DateTime? ThoiGian { get; set; }
    public string? DiaDiem { get; set; }
    public string? TrangThai { get; set; }
    public string? KetQua { get; set; }
    public string? PhanHoiNguoiNhan { get; set; }
    public DateTime? ThoiGianDeXuatMoi { get; set; }
    public string? GhiChuCanBo { get; set; }
    public DateTime? NgayGapMat { get; set; }
}
