using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLTTBTXH.API.Models.Entities;

[Table("NGUOIDUNG_VAITRO")]
public class NguoiDungVaiTro
{
    [Column("MaNguoiDung", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaNguoiDung { get; set; } = null!;

    [Column("MaVaiTro", TypeName = "char(4)")]
    [MaxLength(4)]
    public string MaVaiTro { get; set; } = null!;

    [ForeignKey(nameof(MaNguoiDung))]
    public NguoiDung? NguoiDung { get; set; }

    [ForeignKey(nameof(MaVaiTro))]
    public VaiTro? VaiTro { get; set; }
}
