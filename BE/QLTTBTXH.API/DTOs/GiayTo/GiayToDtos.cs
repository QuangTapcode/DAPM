using System.ComponentModel.DataAnnotations;

namespace QLTTBTXH.API.DTOs.GiayTo;

public class GiayToDto
{
    public string MaGiayTo { get; set; } = null!;
    public string TenGiayTo { get; set; } = null!;
    public string LoaiGiayTo { get; set; } = null!;
    public string? DuongDanFile { get; set; }
    public string TrangThai { get; set; } = "Chờ xác minh";
    public string? MaYeuCauGuiTre { get; set; }
    public string? MaYeuCauNhan { get; set; }
    public DateTime? NgayCapNhat { get; set; }
    public string Id => MaGiayTo;
    public string Name => TenGiayTo;
    public string? Url => DuongDanFile;
}

public class CreateGiayToDto
{
    [Required] public string TenGiayTo { get; set; } = null!;
    [Required] public string LoaiGiayTo { get; set; } = null!;
    public string? DuongDanFile { get; set; }
    public string? MaYeuCauGuiTre { get; set; }
    public string? MaYeuCauNhan { get; set; }
    public string TrangThai { get; set; } = "Chờ xác minh";
}

public class UpdateGiayToDto
{
    public string? TenGiayTo { get; set; }
    public string? LoaiGiayTo { get; set; }
    public string? DuongDanFile { get; set; }
    public string? TrangThai { get; set; }
}
