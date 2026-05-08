using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLTTBTXH.API.Models.Entities;

[Table("HOSOTIEPNHANTRE")]
public class HoSoTiepNhanTre
{
    [Key]
    [Column("MaHSTiepNhan", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaHSTiepNhan { get; set; } = null!;

    [Column("MaYeuCauGuiTre", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaYeuCauGuiTre { get; set; } = null!;

    [Column("MaTre", TypeName = "char(8)")]
    [MaxLength(8)]
    public string? MaTre { get; set; }

    [Column("MaCanBoTiepNhan", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaCanBoTiepNhan { get; set; } = null!;

    [Column("NgayTiepNhan", TypeName = "date")]
    public DateTime NgayTiepNhan { get; set; } = DateTime.Today;

    [Column("TrangThai")]
    [MaxLength(20)]
    public string TrangThai { get; set; } = "Đang xử lý";

    [Column("NgayDuyet", TypeName = "date")]
    public DateTime? NgayDuyet { get; set; }

    [Column("GhiChu")]
    [MaxLength(200)]
    public string? GhiChu { get; set; }

    [ForeignKey(nameof(MaYeuCauGuiTre))]
    public YeuCauGuiTre? YeuCauGuiTre { get; set; }

    [ForeignKey(nameof(MaTre))]
    public Tre? Tre { get; set; }

    [ForeignKey(nameof(MaCanBoTiepNhan))]
    public NguoiDung? CanBoTiepNhan { get; set; }
}
