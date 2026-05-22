using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLTTBTXH.API.Models.Entities;

[Table("CHITIETGAPMAT")]
public class ChiTietGapMat
{
    [Column("MaLichGap", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaLichGap { get; set; } = null!;

    [Column("MaTre", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaTre { get; set; } = null!;

    [Column("KetQua")]
    [MaxLength(30)]
    public string? KetQua { get; set; }

    [Column("GhiChuCanBo")]
    [MaxLength(200)]
    public string? GhiChuCanBo { get; set; }

    [ForeignKey(nameof(MaLichGap))]
    public LichHenGapMatNhanNuoi? LichGapMat { get; set; }

    [ForeignKey(nameof(MaTre))]
    public Tre? Tre { get; set; }
}
