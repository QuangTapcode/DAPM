using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLTTBTXH.API.Models.Entities;

[Table("VACXIN")]
public class Vacxin
{
    [Key]
    [Column("MaVacxin", TypeName = "char(5)")]
    [MaxLength(5)]
    public string MaVacxin { get; set; } = null!;

    [Column("TenVacxin")]
    [MaxLength(50)]
    public string TenVacxin { get; set; } = null!;

    [Column("PhongBenh")]
    [MaxLength(100)]
    public string PhongBenh { get; set; } = null!;

    public ICollection<LichSuTiemChung> LichSuTiemChungs { get; set; } = new List<LichSuTiemChung>();
}
