using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLTTBTXH.API.Models.Entities;

[Table("YEUCAUNHANNUOI")]
public class YeuCauNhanNuoi
{
    [Key]
    [Column("MaYeuCauNhan", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaYeuCauNhan { get; set; } = null!;

    [Column("MaNguoiNhan", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaNguoiNhan { get; set; } = null!;

    [Column("ThuNhapHangThang", TypeName = "decimal(18,2)")]
    public decimal ThuNhapHangThang { get; set; } = 0;

    [Column("SoConDangNuoi")]
    public int SoConDangNuoi { get; set; } = 0;

    [Column("TinhTrangHonNhan")]
    [MaxLength(30)]
    public string TinhTrangHonNhan { get; set; } = "Độc thân";

    [Column("LoaiNoiO")]
    [MaxLength(50)]
    public string LoaiNoiO { get; set; } = "Nhà sở hữu";

    [Column("SucKhoeDatYeuCau")]
    public bool SucKhoeDatYeuCau { get; set; } = true;

    [Column("QuanHeVoiTre")]
    [MaxLength(50)]
    public string QuanHeVoiTre { get; set; } = "Không";

    [Column("LyDoNhanNuoi")]
    [MaxLength(60)]
    public string? LyDoNhanNuoi { get; set; }

    [Column("MongMuonTuoiToiDa")]
    public int? MongMuonTuoiToiDa { get; set; }

    [Column("MongMuonGioiTinh")]
    [MaxLength(5)]
    public string? MongMuonGioiTinh { get; set; }

    [Column("HopLeSoBo")]
    public bool HopLeSoBo { get; set; } = false;

    [Column("DiemUuTien", TypeName = "decimal(4,1)")]
    public decimal DiemUuTien { get; set; } = 0;

    [Column("LyDoTuChoiSoBo")]
    [MaxLength(500)]
    public string? LyDoTuChoiSoBo { get; set; }

    [Column("TrangThai")]
    [MaxLength(30)]
    public string TrangThai { get; set; } = "Chờ duyệt";

    [Column("NgayTao")]
    public DateTime NgayTao { get; set; } = DateTime.Now;

    [Column("GhiChu")]
    [MaxLength(300)]
    public string? GhiChu { get; set; }

    [ForeignKey(nameof(MaNguoiNhan))]
    public NguoiDung? NguoiNhan { get; set; }
}
