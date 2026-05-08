using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLTTBTXH.API.Models.Entities;

[Table("YEUCAUGUITRE")]
public class YeuCauGuiTre
{
    [Key]
    [Column("MaYeuCauGuiTre", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaYeuCauGuiTre { get; set; } = null!;

    [Column("MaNguoiGui", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaNguoiGui { get; set; } = null!;

    [Column("MaLoaiNguoiGui", TypeName = "char(4)")]
    [MaxLength(4)]
    public string MaLoaiNguoiGui { get; set; } = null!;

    [Column("QuanHeVoiTre")]
    [MaxLength(50)]
    public string? QuanHeVoiTre { get; set; }

    [Column("LyDoGui")]
    [MaxLength(200)]
    public string? LyDoGui { get; set; }

    [Column("NgayTao", TypeName = "datetime2(0)")]
    public DateTime NgayTao { get; set; } = DateTime.Now;

    [Column("NgayCapNhat", TypeName = "datetime2(0)")]
    public DateTime? NgayCapNhat { get; set; }

    [Column("TrangThaiYC")]
    [MaxLength(20)]
    public string TrangThaiYC { get; set; } = "Chờ xử lý";

    [Column("GhiChu")]
    [MaxLength(200)]
    public string? GhiChu { get; set; }

    [ForeignKey(nameof(MaNguoiGui))]
    public NguoiDung? NguoiGui { get; set; }

    [ForeignKey(nameof(MaLoaiNguoiGui))]
    public LoaiNguoiGuiTre? LoaiNguoiGui { get; set; }

    public ThongTinTreTam? ThongTinTreTam { get; set; }
}
