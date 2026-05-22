using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLTTBTXH.API.Models.Entities;

[Table("LICHHENGAPMATNHANNUOI")]
public class LichHenGapMatNhanNuoi
{
    [Key]
    [Column("MaLichGap", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaLichGap { get; set; } = null!;

    [Column("MaYeuCauNhan", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaYeuCauNhan { get; set; } = null!;

    [Column("MaCanBo", TypeName = "char(8)")]
    [MaxLength(8)]
    public string MaCanBo { get; set; } = null!;

    [Column("NgayGapMat")]
    public DateTime? NgayGapMat { get; set; }

    [Column("ThoiGian")]
    public DateTime ThoiGian { get; set; }

    [Column("DiaDiem")]
    [MaxLength(200)]
    public string? DiaDiem { get; set; }

    [Column("TrangThai")]
    [MaxLength(30)]
    public string TrangThai { get; set; } = "Chờ xác nhận";

    [Column("PhanHoiNguoiNhan")]
    [MaxLength(200)]
    public string? PhanHoiNguoiNhan { get; set; }

    [Column("ThoiGianDeXuatMoi")]
    public DateTime? ThoiGianDeXuatMoi { get; set; }

    [Column("NgayTao")]
    public DateTime NgayTao { get; set; } = DateTime.Now;

    [Column("NgayCapNhat")]
    public DateTime? NgayCapNhat { get; set; }

    [ForeignKey(nameof(MaYeuCauNhan))]
    public YeuCauNhanNuoi? YeuCauNhanNuoi { get; set; }

    [ForeignKey(nameof(MaCanBo))]
    public NguoiDung? CanBo { get; set; }

    public ICollection<ChiTietGapMat> ChiTietGapMats { get; set; } = new List<ChiTietGapMat>();
}
