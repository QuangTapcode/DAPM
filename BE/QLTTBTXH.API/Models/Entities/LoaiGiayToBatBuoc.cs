using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLTTBTXH.API.Models.Entities;

[Table("LOAIGIAYTOBATBUOC")]
public class LoaiGiayToBatBuoc
{
    [Key]
    [Column("MaLoaiGiayTo", TypeName = "char(6)")]
    [MaxLength(6)]
    public string MaLoaiGiayTo { get; set; } = null!;

    [Column("TenLoaiGiayTo")]
    [MaxLength(100)]
    public string TenLoaiGiayTo { get; set; } = null!;

    [Column("ApDungYCNN")]
    public bool ApDungYCNN { get; set; } = false;

    [Column("ApDungYCGT")]
    public bool ApDungYCGT { get; set; } = false;

    [Column("BatBuoc")]
    public bool BatBuoc { get; set; } = true;

    [Column("MoTa")]
    [MaxLength(200)]
    public string? MoTa { get; set; }

    public ICollection<GiayToPhapLy> GiayToPhapLys { get; set; } = new List<GiayToPhapLy>();
}
