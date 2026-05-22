using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLTTBTXH.API.Models.Entities;

[Table("PHUONG_XA")]
public class PhuongXa
{
    [Key]
    [Column("MaPhuongXa", TypeName = "char(6)")]
    public string MaPhuongXa { get; set; } = null!;

    [Column("TenPhuongXa")]
    public string TenPhuongXa { get; set; } = null!;

    [Column("MaTinhTP", TypeName = "char(3)")]
    public string MaTinhTP { get; set; } = null!;

    [ForeignKey(nameof(MaTinhTP))]
    public TinhTP? TinhTP { get; set; }
}