using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLTTBTXH.API.Models.Entities;

[Table("QUYENHAN")]
public class QuyenHan
{
    [Key]
    [Column("MaQuyen", TypeName = "char(5)")]
    [MaxLength(5)]
    public string MaQuyen { get; set; } = null!;

    [Column("TenQuyen")]
    [MaxLength(100)]
    public string TenQuyen { get; set; } = null!;

    [Column("MoTa")]
    [MaxLength(200)]
    public string? MoTa { get; set; }

    public ICollection<QuyenHanVaiTro> QuyenHanVaiTros { get; set; } = new List<QuyenHanVaiTro>();
}
