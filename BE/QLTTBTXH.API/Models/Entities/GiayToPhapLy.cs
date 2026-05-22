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

    [Column("MaLoaiGiayTo", TypeName = "char(6)")]
    [MaxLength(6)]
    public string MaLoaiGiayTo { get; set; } = null!;

    [ForeignKey(nameof(MaLoaiGiayTo))]
    public LoaiGiayToBatBuoc? LoaiGiayToBatBuoc { get; set; }

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
