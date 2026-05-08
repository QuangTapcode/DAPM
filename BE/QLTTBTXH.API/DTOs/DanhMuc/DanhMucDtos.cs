namespace QLTTBTXH.API.DTOs.DanhMuc;

public class TinhTpDto { public string MaTinhTP { get; set; } = null!; public string TenTinhTP { get; set; } = null!; }
public class PhuongXaDto
{
    public string MaPhuongXa { get; set; } = null!;
    public string TenPhuongXa { get; set; } = null!;
    public string MaTinhTP { get; set; } = null!;
    public string? TenTinhTP { get; set; }
}
public class VacxinDto { public string MaVacxin { get; set; } = null!; public string TenVacxin { get; set; } = null!; public string PhongBenh { get; set; } = null!; }
public class LoaiNguoiGuiDto
{
    public string MaLoaiNguoiGui { get; set; } = null!;
    public string TenLoaiNguoiGui { get; set; } = null!;
    public bool BatBuocGiayTo { get; set; }
    public string? MoTa { get; set; }
}
public class VaiTroDto
{
    public string MaVaiTro { get; set; } = null!;
    public string TenVaiTro { get; set; } = null!;
    public string? MoTa { get; set; }
    public List<string> Quyens { get; set; } = new();
}
public class QuyenHanDto
{
    public string MaQuyen { get; set; } = null!;
    public string TenQuyen { get; set; } = null!;
    public string? MoTa { get; set; }
}
public class DashboardStatsDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int TotalChildren { get; set; }
    public int ChildrenInCare { get; set; }
    public int ChildrenWaitingAdoption { get; set; }
    public int ChildrenAdopted { get; set; }
    public int PendingSendRequests { get; set; }
    public int PendingAdoptionRequests { get; set; }
    public int TotalSendRequests { get; set; }
    public int TotalAdoptionRequests { get; set; }
    public int TotalReceptionProfiles { get; set; }
    public int TotalAdoptionProfiles { get; set; }
}
