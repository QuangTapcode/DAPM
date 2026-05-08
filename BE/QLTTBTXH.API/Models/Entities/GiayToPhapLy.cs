using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLTTBTXH.API.Models.Entities;

[Table("GIAYTOPHAPLY")]
public class GiayToPhapLy
{
    [Key]
    [Column("MaGiayTo", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaGiayTo { get; set; } = null!;

    [Column("TenGiayTo")]
    [MaxLength(150)]
    public string TenGiayTo { get; set; } = null!;

    [Column("LoaiGiayTo")]
    [MaxLength(50)]
    public string LoaiGiayTo { get; set; } = null!;

    [Column("DuongDanFile")]
    [MaxLength(255)]
    public string? DuongDanFile { get; set; }

    [Column("TrangThai")]
    [MaxLength(20)]
    public string TrangThai { get; set; } = "Chờ xác minh";

    [Column("MaYeuCauGuiTre", TypeName = "char(8)")]
    [MaxLength(8)]
    public string? MaYeuCauGuiTre { get; set; }

    [Column("MaYeuCauNhan", TypeName = "char(8)")]
    [MaxLength(8)]
    public string? MaYeuCauNhan { get; set; }

    [Column("NgayCapNhat", TypeName = "datetime2(0)")]
    public DateTime? NgayCapNhat { get; set; }

    [ForeignKey(nameof(MaYeuCauGuiTre))]
    public YeuCauGuiTre? YeuCauGuiTre { get; set; }

    [ForeignKey(nameof(MaYeuCauNhan))]
    public YeuCauNhanNuoi? YeuCauNhanNuoi { get; set; }
}
