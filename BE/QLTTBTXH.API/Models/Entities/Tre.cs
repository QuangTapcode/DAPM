using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLTTBTXH.API.Models.Entities;

[Table("TRE")]
public class Tre
{
    [Key]
    [Column("MaTre", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaTre { get; set; } = null!;

    [Column("HoTen")]
    [MaxLength(100)]
    public string HoTen { get; set; } = null!;

    [Column("NgaySinh", TypeName = "date")]
    public DateTime? NgaySinh { get; set; }

    [Column("GioiTinh")]
    [MaxLength(5)]
    public string GioiTinh { get; set; } = null!;

    [Column("MaPhuongXa", TypeName = "char(6)")]
    [MaxLength(6)]
    public string? MaPhuongXa { get; set; }

    [Column("DiaChiCuThe")]
    [MaxLength(200)]
    public string? DiaChiCuThe { get; set; }

    [Column("DanToc")]
    [MaxLength(30)]
    public string? DanToc { get; set; }

    [Column("TinhCach")]
    [MaxLength(150)]
    public string? TinhCach { get; set; }

    [Column("SoThich")]
    [MaxLength(150)]
    public string? SoThich { get; set; }

    [Column("DacDiemNhanDang")]
    [MaxLength(150)]
    public string? DacDiemNhanDang { get; set; }

    [Column("TrangThai")]
    [MaxLength(20)]
    public string TrangThai { get; set; } = null!;

    [Column("NgayTiepNhan", TypeName = "date")]
    public DateTime? NgayTiepNhan { get; set; }

    [Column("NgayCapNhat", TypeName = "datetime2(0)")]
    public DateTime? NgayCapNhat { get; set; }

    [Column("NgayNhanNuoi", TypeName = "date")]
    public DateTime? NgayNhanNuoi { get; set; }

    [Column("GhiChu")]
    [MaxLength(200)]
    public string? GhiChu { get; set; }

    [Column("MaNguoiCapNhat", TypeName = "char(8)")]
    [MaxLength(8)]
    public string? MaNguoiCapNhat { get; set; }

    [Column("HinhAnh")]
    [MaxLength(255)]
    public string? HinhAnh { get; set; }

    [ForeignKey(nameof(MaPhuongXa))]
    public PhuongXa? PhuongXa { get; set; }

    [ForeignKey(nameof(MaNguoiCapNhat))]
    public NguoiDung? NguoiCapNhat { get; set; }

    public ICollection<LichSuTiemChung> LichSuTiemChungs { get; set; } = new List<LichSuTiemChung>();
    public ICollection<TheoDoiSucKhoe> TheoDoiSucKhoes { get; set; } = new List<TheoDoiSucKhoe>();
}
