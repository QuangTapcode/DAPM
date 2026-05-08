using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLTTBTXH.API.Data;
using QLTTBTXH.API.DTOs.Common;
using QLTTBTXH.API.DTOs.DanhMuc;

namespace QLTTBTXH.API.Controllers;

[ApiController]
[Route("api/stats")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly QuanLyTTBTContext _db;
    public DashboardController(QuanLyTTBTContext db) { _db = db; }

    /// <summary>Tổng quan số liệu dùng cho Dashboard (Admin, Trưởng phòng, Cán bộ).</summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<DashboardStatsDto>>> Get()
    {
        var s = new DashboardStatsDto
        {
            TotalUsers = await _db.NGUOIDUNG.CountAsync(),
            ActiveUsers = await _db.NGUOIDUNG.CountAsync(u => u.TrangThaiTK),
            TotalChildren = await _db.TRE.CountAsync(),
            ChildrenInCare = await _db.TRE.CountAsync(t => t.TrangThai == "Đang chăm sóc"),
            ChildrenWaitingAdoption = await _db.TRE.CountAsync(t => t.TrangThai == "Chờ nhận nuôi"),
            ChildrenAdopted = await _db.TRE.CountAsync(t => t.TrangThai == "Đã nhận nuôi"),
            PendingSendRequests = await _db.YEUCAUGUITRE.CountAsync(y => y.TrangThaiYC == "Chờ xử lý" || y.TrangThaiYC == "Đang xem xét"),
            PendingAdoptionRequests = await _db.YEUCAUNHANNUOI.CountAsync(y => y.TrangThai == "Chờ xử lý" || y.TrangThai == "Đang xem xét"),
            TotalSendRequests = await _db.YEUCAUGUITRE.CountAsync(),
            TotalAdoptionRequests = await _db.YEUCAUNHANNUOI.CountAsync(),
            TotalReceptionProfiles = await _db.HOSOTIEPNHANTRE.CountAsync(),
            TotalAdoptionProfiles = await _db.HOSONHANNUOI.CountAsync()
        };
        return Ok(ApiResponse<DashboardStatsDto>.Ok(s));
    }

    /// <summary>Phân bổ trạng thái trẻ theo nhóm (cho biểu đồ).</summary>
    [HttpGet("children-by-status")]
    public async Task<ActionResult<ApiResponse<Dictionary<string, int>>>> ChildrenByStatus()
    {
        var map = await _db.TRE.GroupBy(t => t.TrangThai)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToListAsync();
        return Ok(ApiResponse<Dictionary<string, int>>.Ok(map.ToDictionary(x => x.Key, x => x.Count)));
    }

    [HttpGet("requests-by-month")]
    public async Task<ActionResult<ApiResponse<object>>> RequestsByMonth()
    {
        var send = await _db.YEUCAUGUITRE
            .GroupBy(y => new { y.NgayTao.Year, y.NgayTao.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
            .ToListAsync();
        var adopt = await _db.YEUCAUNHANNUOI
            .GroupBy(y => new { y.NgayTao.Year, y.NgayTao.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
            .ToListAsync();
        return Ok(ApiResponse<object>.Ok(new { send, adopt }));
    }
}
