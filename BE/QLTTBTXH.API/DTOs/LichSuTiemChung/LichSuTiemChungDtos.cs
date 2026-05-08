using System.ComponentModel.DataAnnotations;

namespace QLTTBTXH.API.DTOs.LichSuTiemChung;

public class LichSuTiemChungDto
{
    public string MaLSTiemChung { get; set; } = null!;
    public string MaTre { get; set; } = null!;
    public string MaVacxin { get; set; } = null!;
    public string? TenVacxin { get; set; }
    public string? PhongBenh { get; set; }
    public DateTime NgayTiem { get; set; }
    public string? GhiChu { get; set; }
    public string Id => MaLSTiemChung;
}

public class CreateLichSuTiemChungDto
{
    [Required] public string MaTre { get; set; } = null!;
    [Required] public string MaVacxin { get; set; } = null!;
    [Required] public DateTime NgayTiem { get; set; }
    public string? GhiChu { get; set; }
}

public class UpdateLichSuTiemChungDto
{
    public string? MaVacxin { get; set; }
    public DateTime? NgayTiem { get; set; }
    public string? GhiChu { get; set; }
}
