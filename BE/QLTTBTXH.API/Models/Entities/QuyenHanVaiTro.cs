using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLTTBTXH.API.Models.Entities;

[Table("QUYENHAN_VAITRO")]
public class QuyenHanVaiTro
{
    [Column("MaQuyen", TypeName = "char(5)")]
    [MaxLength(5)]
    public string MaQuyen { get; set; } = null!;

    [Column("MaVaiTro", TypeName = "char(4)")]
    [MaxLength(4)]
    public string MaVaiTro { get; set; } = null!;

    [ForeignKey(nameof(MaQuyen))]
    public QuyenHan? QuyenHan { get; set; }

    [ForeignKey(nameof(MaVaiTro))]
    public VaiTro? VaiTro { get; set; }
}
