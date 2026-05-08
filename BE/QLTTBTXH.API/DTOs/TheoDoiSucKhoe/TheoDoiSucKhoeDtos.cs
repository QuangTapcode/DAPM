using System.ComponentModel.DataAnnotations;

namespace QLTTBTXH.API.DTOs.TheoDoiSucKhoe;

public class TheoDoiSucKhoeDto
{
    public string MaTheoDoi { get; set; } = null!;
    public string MaTre { get; set; } = null!;
    public string? TenTre { get; set; }
    public string? MaNguoiCapNhat { get; set; }
    public DateTime NgayCapNhat { get; set; }
    public decimal? CanNang { get; set; }
    public decimal? ChieuCao { get; set; }
    public short? NhipTim { get; set; }
    public string? NhomMau { get; set; }
    public decimal? NhietDo { get; set; }
    public string? KetLuan { get; set; }
    public string? TinhTrangChiTiet { get; set; }
    public string Id => MaTheoDoi;
}

public class CreateTheoDoiSucKhoeDto
{
    [Required] public string MaTre { get; set; } = null!;
    public decimal? CanNang { get; set; }
    public decimal? ChieuCao { get; set; }
    public short? NhipTim { get; set; }
    public string? NhomMau { get; set; }
    public decimal? NhietDo { get; set; }
    public string? KetLuan { get; set; }
    public string? TinhTrangChiTiet { get; set; }
}

public class UpdateTheoDoiSucKhoeDto
{
    public decimal? CanNang { get; set; }
    public decimal? ChieuCao { get; set; }
    public short? NhipTim { get; set; }
    public string? NhomMau { get; set; }
    public decimal? NhietDo { get; set; }
    public string? KetLuan { get; set; }
    public string? TinhTrangChiTiet { get; set; }
}
