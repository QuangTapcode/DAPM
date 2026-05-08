using System.ComponentModel.DataAnnotations;

namespace QLTTBTXH.API.DTOs.HoSoNhanNuoi;

public class HoSoNhanNuoiDto
{
    public string MaHSNhanNuoi { get; set; } = null!;
    public string MaYeuCauNhan { get; set; } = null!;
    public string MaTre { get; set; } = null!;
    public string? TenTre { get; set; }
    public string MaCanBo { get; set; } = null!;
    public string? TenCanBo { get; set; }
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
