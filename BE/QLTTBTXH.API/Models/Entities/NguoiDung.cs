using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLTTBTXH.API.Models.Entities;

[Table("NGUOIDUNG")]
public class NguoiDung
{
    [Key]
    [Column("MaNguoiDung", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaNguoiDung { get; set; } = null!;

    [Column("SDT")]
    [MaxLength(15)]
    public string SDT { get; set; } = null!;

    [Column("MatKhau")]
    [MaxLength(255)]
    public string MatKhau { get; set; } = null!;

    [Column("HoTen")]
    [MaxLength(100)]
    public string HoTen { get; set; } = null!;

    [Column("NgaySinh", TypeName = "date")]
    public DateTime? NgaySinh { get; set; }

    [Column("GioiTinh")]
    [MaxLength(5)]
    public string GioiTinh { get; set; } = null!;

    [Column("CCCD", TypeName = "char(12)")]
    [MaxLength(12)]
    public string? CCCD { get; set; }

    [Column("Email")]
    [MaxLength(254)]
    public string? Email { get; set; }

    [Column("MaXaPhuong", TypeName = "char(6)")]
    [MaxLength(6)]
    public string? MaXaPhuong { get; set; }

    [Column("DiaChiCuThe")]
    [MaxLength(200)]
    public string? DiaChiCuThe { get; set; }

    [Column("NgayTao")]
    public DateTime NgayTao { get; set; } = DateTime.Now;

    [Column("TrangThaiTK")]
    public bool TrangThaiTK { get; set; } = true;

    [ForeignKey(nameof(MaXaPhuong))]
    public PhuongXa? PhuongXa { get; set; }

    public ICollection<NguoiDungVaiTro> NguoiDungVaiTros { get; set; } = new List<NguoiDungVaiTro>();
}
