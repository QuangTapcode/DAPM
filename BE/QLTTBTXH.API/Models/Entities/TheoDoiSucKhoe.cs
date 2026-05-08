using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLTTBTXH.API.Models.Entities;

[Table("THEODOISUCKHOE")]
public class TheoDoiSucKhoe
{
    [Key]
    [Column("MaTheoDoi", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaTheoDoi { get; set; } = null!;

    [Column("MaTre", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaTre { get; set; } = null!;

    [Column("MaNguoiCapNhat", TypeName = "char(8)")]
    [MaxLength(8)]
    public string? MaNguoiCapNhat { get; set; }

    [Column("NgayCapNhat")]
    public DateTime NgayCapNhat { get; set; } = DateTime.Now;

    [Column("CanNang", TypeName = "decimal(5,2)")]
    public decimal? CanNang { get; set; }

    [Column("ChieuCao", TypeName = "decimal(5,2)")]
    public decimal? ChieuCao { get; set; }

    [Column("NhipTim")]
    public short? NhipTim { get; set; }

    [Column("NhomMau", TypeName = "char(3)")]
    [MaxLength(3)]
    public string? NhomMau { get; set; }

    [Column("NhietDo", TypeName = "decimal(4,2)")]
    public decimal? NhietDo { get; set; }

    [Column("KetLuan")]
    [MaxLength(100)]
    public string? KetLuan { get; set; }

    [Column("TinhTrangChiTiet")]
    [MaxLength(200)]
    public string? TinhTrangChiTiet { get; set; }

    [ForeignKey(nameof(MaTre))]
    public Tre? Tre { get; set; }

    [ForeignKey(nameof(MaNguoiCapNhat))]
    public NguoiDung? NguoiCapNhat { get; set; }
}
