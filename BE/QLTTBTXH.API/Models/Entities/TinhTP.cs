using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLTTBTXH.API.Models.Entities;

[Table("TINH_TP")]
public class TinhTP
{
    [Key]
    [Column("MaTinhTP", TypeName = "char(3)")]
    [MaxLength(3)]
    public string MaTinhTP { get; set; } = null!;

    [Column("TenTinhTP")]
    [MaxLength(100)]
    public string TenTinhTP { get; set; } = null!;

    public ICollection<PhuongXa> PhuongXas { get; set; } = new List<PhuongXa>();
}
