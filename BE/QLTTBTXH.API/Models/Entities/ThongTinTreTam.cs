using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLTTBTXH.API.Models.Entities;

[Table("THONGTINTRETAM")]
public class ThongTinTreTam
{
    [Key]
    [Column("MaThongTin", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaThongTin { get; set; } = null!;

    [Column("MaYeuCauGuiTre", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaYeuCauGuiTre { get; set; } = null!;

    [Column("TenTre")]
    [MaxLength(100)]
    public string TenTre { get; set; } = null!;

    [Column("NgaySinh", TypeName = "date")]
    public DateTime? NgaySinh { get; set; }

    [Column("GioiTinh")]
    [MaxLength(5)]
    public string GioiTinh { get; set; } = "Khác";

    [Column("DanToc")]
    [MaxLength(30)]
    public string? DanToc { get; set; }

    [ForeignKey(nameof(MaYeuCauGuiTre))]
    public YeuCauGuiTre? YeuCauGuiTre { get; set; }
}
