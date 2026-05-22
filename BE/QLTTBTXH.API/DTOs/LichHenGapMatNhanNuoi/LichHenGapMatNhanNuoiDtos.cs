using System.ComponentModel.DataAnnotations;

namespace QLTTBTXH.API.DTOs.LichHenGapMatNhanNuoi;

public class ChiTietGapMatDto
{
    public string MaTre { get; set; } = null!;
    public string? TenTre { get; set; }
    public string? KetQua { get; set; }
    public string? GhiChuCanBo { get; set; }
}

public class LichHenGapMatNhanNuoiDto
{
    public string MaLichGap { get; set; } = null!;
    public string MaYeuCauNhan { get; set; } = null!;
    public string? TenNguoiNhan { get; set; }
    public string MaCanBo { get; set; } = null!;
    public string? TenCanBo { get; set; }
    public DateTime? NgayGapMat { get; set; }
    public DateTime ThoiGian { get; set; }
    public string? DiaDiem { get; set; }
    public string TrangThai { get; set; } = null!;
    public string? PhanHoiNguoiNhan { get; set; }
    public DateTime? ThoiGianDeXuatMoi { get; set; }
    public DateTime NgayTao { get; set; }
    public DateTime? NgayCapNhat { get; set; }
    public List<ChiTietGapMatDto> Children { get; set; } = new();

    // FE aliases
    public string Id => MaLichGap;
    public string RequestId => MaYeuCauNhan;
    public string OfficerId => MaCanBo;
    public string Status => TrangThai;
}

public class CreateLichHenGapMatNhanNuoiDto
{
    [Required]
    [MaxLength(8)]
    public string MaYeuCauNhan { get; set; } = null!;

    [MaxLength(8)]
    public string? MaCanBo { get; set; }

    public DateTime? NgayGapMat { get; set; }

    [Required]
    public DateTime ThoiGian { get; set; }

    [MaxLength(200)]
    public string? DiaDiem { get; set; }

    public List<string> MaTres { get; set; } = new();
}

public class UpdateLichHenGapMatNhanNuoiDto
{
    public DateTime? NgayGapMat { get; set; }
    public DateTime? ThoiGian { get; set; }
    public string? DiaDiem { get; set; }
    public string? TrangThai { get; set; }
    public string? PhanHoiNguoiNhan { get; set; }
    public DateTime? ThoiGianDeXuatMoi { get; set; }
    public List<UpdateChiTietGapMatDto>? Children { get; set; }
}

public class UpdateChiTietGapMatDto
{
    [Required]
    [MaxLength(8)]
    public string MaTre { get; set; } = null!;

    [MaxLength(30)]
    public string? KetQua { get; set; }

    [MaxLength(200)]
    public string? GhiChuCanBo { get; set; }
}
