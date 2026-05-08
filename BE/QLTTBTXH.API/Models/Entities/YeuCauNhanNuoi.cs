using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLTTBTXH.API.Models.Entities;

[Table("YEUCAUNHANNUOI")]
public class YeuCauNhanNuoi
{
    [Key]
    [Column("MaYeuCauNhan", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaYeuCauNhan { get; set; } = null!;

    [Column("MaNguoiNhan", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaNguoiNhan { get; set; } = null!;

    [Column("LyDoNhanNuoi")]
    [MaxLength(200)]
    public string? LyDoNhanNuoi { get; set; }

    [Column("MongMuonVeTre")]
    [MaxLength(200)]
    public string? MongMuonVeTre { get; set; }

    [Column("ThuNhapHangThang", TypeName = "decimal(12,2)")]
    public decimal? ThuNhapHangThang { get; set; }

    [Column("NgheNghiep")]
    [MaxLength(100)]
    public string? NgheNghiep { get; set; }

    [Column("NgayTao")]
    public DateTime NgayTao { get; set; } = DateTime.Now;

    [Column("NgayCapNhat")]
    public DateTime? NgayCapNhat { get; set; }

    [Column("TrangThai")]
    [MaxLength(20)]
    public string TrangThai { get; set; } = "Chờ xử lý";

    [Column("NguoiDuyet", TypeName = "char(8)")]
    [MaxLength(8)]
    public string? NguoiDuyet { get; set; }

    [ForeignKey(nameof(MaNguoiNhan))]
    public NguoiDung? NguoiNhan { get; set; }

    [ForeignKey(nameof(NguoiDuyet))]
    public NguoiDung? NguoiDuyetNav { get; set; }
}
