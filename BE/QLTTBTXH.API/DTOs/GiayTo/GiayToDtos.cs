using System.ComponentModel.DataAnnotations;

namespace QLTTBTXH.API.DTOs.GiayTo;

public class GiayToDto
{
    public string MaGiayTo { get; set; } = null!;
    public string MaLoaiGiayTo { get; set; } = null!;
    public string? TenLoaiGiayTo { get; set; }
    public string? DuongDanFile { get; set; }
    public string TrangThai { get; set; } = "Chờ xác minh";
    public string? MaYeuCauGuiTre { get; set; }
    public string? MaYeuCauNhan { get; set; }
    public DateTime? NgayCapNhat { get; set; }
    public string Id => MaGiayTo;
    public string? Url => DuongDanFile;
}

public class CreateGiayToDto
{
    [Required] public string MaLoaiGiayTo { get; set; } = null!;
    public string? DuongDanFile { get; set; }
    public string? MaYeuCauGuiTre { get; set; }
    public string? MaYeuCauNhan { get; set; }
    public string TrangThai { get; set; } = "Chờ xác minh";
}

public class UpdateGiayToDto
{
    public string? MaLoaiGiayTo { get; set; }
    public string? DuongDanFile { get; set; }
    public string? TrangThai { get; set; }
}
