using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLTTBTXH.API.Models.Entities;

[Table("HOSONHANNUOI")]
public class HoSoNhanNuoi
{
    [Key]
    [Column("MaHSNhanNuoi", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaHSNhanNuoi { get; set; } = null!;

    [Column("MaYeuCauNhan", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaYeuCauNhan { get; set; } = null!;

    [Column("MaTre", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaTre { get; set; } = null!;

    [Column("MaCanBo", TypeName = "char(8)")]
    [MaxLength(8)]
    public string? MaCanBo { get; set; }

    [Column("NgayLap", TypeName = "date")]
    public DateTime NgayLap { get; set; } = DateTime.Today;

    [Column("NgayDuyet", TypeName = "date")]
    public DateTime? NgayDuyet { get; set; }

    [Column("TrangThai")]
    [MaxLength(20)]
    public string TrangThai { get; set; } = "Đang lập";

    [Column("GhiChu")]
    [MaxLength(100)]
    public string? GhiChu { get; set; }

    [ForeignKey(nameof(MaYeuCauNhan))]
    public YeuCauNhanNuoi? YeuCauNhanNuoi { get; set; }

    [ForeignKey(nameof(MaTre))]
    public Tre? Tre { get; set; }

    [ForeignKey(nameof(MaCanBo))]
    public NguoiDung? CanBo { get; set; }
}
