using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLTTBTXH.API.Models.Entities;

[Table("LICHSUTIEMCHUNG")]
public class LichSuTiemChung
{
    [Key]
    [Column("MaLSTiemChung", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaLSTiemChung { get; set; } = null!;

    [Column("MaTre", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaTre { get; set; } = null!;

    [Column("MaVacxin", TypeName = "char(5)")]
    [MaxLength(5)]
    public string MaVacxin { get; set; } = null!;

    [Column("MuiSo")]
    public int MuiSo { get; set; }

    [Column("NgayTiem", TypeName = "date")]
    public DateTime NgayTiem { get; set; }

    [Column("GhiChu")]
    [MaxLength(100)]
    public string? GhiChu { get; set; }

    [ForeignKey(nameof(MaTre))]
    public Tre? Tre { get; set; }

    [ForeignKey(nameof(MaVacxin))]
    public Vacxin? Vacxin { get; set; }
}
