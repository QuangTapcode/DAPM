using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLTTBTXH.API.Models.Entities;

[Table("VAITRO")]
public class VaiTro
{
    [Key]
    [Column("MaVaiTro", TypeName = "char(4)")]
    [MaxLength(4)]
    public string MaVaiTro { get; set; } = null!;

    [Column("TenVaiTro")]
    [MaxLength(50)]
    public string TenVaiTro { get; set; } = null!;

    [Column("MoTa")]
    [MaxLength(200)]
    public string? MoTa { get; set; }

    public ICollection<QuyenHanVaiTro> QuyenHanVaiTros { get; set; } = new List<QuyenHanVaiTro>();
    public ICollection<NguoiDungVaiTro> NguoiDungVaiTros { get; set; } = new List<NguoiDungVaiTro>();
}
