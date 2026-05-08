using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLTTBTXH.API.Models.Entities;

[Table("LOAINGUOIGUITRE")]
public class LoaiNguoiGuiTre
{
    [Key]
    [Column("MaLoaiNguoiGui", TypeName = "char(4)")]
    [MaxLength(4)]
    public string MaLoaiNguoiGui { get; set; } = null!;

    [Column("TenLoaiNguoiGui")]
    [MaxLength(100)]
    public string TenLoaiNguoiGui { get; set; } = null!;

    [Column("BatBuocGiayTo")]
    public bool BatBuocGiayTo { get; set; } = true;

    [Column("MoTa")]
    [MaxLength(200)]
    public string? MoTa { get; set; }
}
