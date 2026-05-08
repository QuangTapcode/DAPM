using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLTTBTXH.API.Data;
using QLTTBTXH.API.DTOs.Common;
using QLTTBTXH.API.DTOs.HoSoNhanNuoi;
using QLTTBTXH.API.Models.Entities;
using QLTTBTXH.API.Services;
using System.Security.Claims;

namespace QLTTBTXH.API.Controllers;

[ApiController]
[Route("api/adoption-profiles")]
[Authorize]
public class HoSoNhanNuoiController : ControllerBase
{
    private readonly QuanLyTTBTContext _db;
    private readonly ICodeGenerator _code;

    public HoSoNhanNuoiController(QuanLyTTBTContext db, ICodeGenerator code) { _db = db; _code = code; }

    private static HoSoNhanNuoiDto Map(HoSoNhanNuoi h) => new()
    {
        MaHSNhanNuoi = h.MaHSNhanNuoi,
        MaYeuCauNhan = h.MaYeuCauNhan,
        MaTre = h.MaTre,
        TenTre = h.Tre?.HoTen,
        MaCanBo = h.MaCanBo,
        TenCanBo = h.CanBo?.HoTen,
        NgayLap = h.NgayLap,
        NgayDuyet = h.NgayDuyet,
        TrangThai = h.TrangThai,
        GhiChu = h.GhiChu
    };

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<HoSoNhanNuoiDto>>>> GetAll([FromQuery] QueryParams q)
    {
        var query = _db.HOSONHANNUOI.Include(h => h.Tre).Include(h => h.CanBo).AsQueryable();
        if (!string.IsNullOrWhiteSpace(q.Status)) query = query.Where(h => h.TrangThai == q.Status);

        var total = await query.CountAsync();
        var entities = await query.OrderByDescending(h => h.NgayLap)
            .Skip((q.Page - 1) * q.Limit).Take(q.Limit).ToListAsync();
        var items = entities.Select(Map).ToList();

        return Ok(ApiResponse<PagedResult<HoSoNhanNuoiDto>>.Ok(new PagedResult<HoSoNhanNuoiDto>
        {
            Items = items, Total = total, Page = q.Page, Limit = q.Limit,
            TotalPages = (int)Math.Ceiling(total / (double)q.Limit)
        }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<HoSoNhanNuoiDto>>> GetById(string id)
    {
        var h = await _db.HOSONHANNUOI.Include(x => x.Tre).Include(x => x.CanBo)
            .FirstOrDefaultAsync(x => x.MaHSNhanNuoi == id);
        if (h is null) return NotFound(ApiResponse<HoSoNhanNuoiDto>.Fail("Not found"));
        return Ok(ApiResponse<HoSoNhanNuoiDto>.Ok(Map(h)));
    }

    [HttpPost]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.NHAN_NUOI + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<HoSoNhanNuoiDto>>> Create([FromBody] CreateHoSoNhanNuoiDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (await _db.HOSONHANNUOI.AnyAsync(x => x.MaYeuCauNhan == dto.MaYeuCauNhan))
            return BadRequest(ApiResponse<HoSoNhanNuoiDto>.Fail("Yêu cầu đã có hồ sơ nhận nuôi"));

        var h = new HoSoNhanNuoi
        {
            MaHSNhanNuoi = await _code.NextHoSoNhanNuoiAsync(),
            MaYeuCauNhan = dto.MaYeuCauNhan,
            MaTre = dto.MaTre,
            MaCanBo = dto.MaCanBo ?? userId,
            NgayLap = DateTime.Today,
            TrangThai = "Đang lập",
            GhiChu = dto.GhiChu
        };
        _db.HOSONHANNUOI.Add(h);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<HoSoNhanNuoiDto>.Ok(Map(h), "Đã tạo hồ sơ"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.NHAN_NUOI + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<HoSoNhanNuoiDto>>> Update(string id, [FromBody] UpdateHoSoNhanNuoiDto dto)
    {
        var h = await _db.HOSONHANNUOI.FirstOrDefaultAsync(x => x.MaHSNhanNuoi == id);
        if (h is null) return NotFound(ApiResponse<HoSoNhanNuoiDto>.Fail("Not found"));
        if (dto.MaTre != null) h.MaTre = dto.MaTre;
        if (dto.TrangThai != null) h.TrangThai = dto.TrangThai;
        if (dto.GhiChu != null) h.GhiChu = dto.GhiChu;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<HoSoNhanNuoiDto>.Ok(Map(h), "Đã cập nhật"));
    }

    /// <summary>Hoàn tất hồ sơ: cập nhật trạng thái + NgayDuyet + trạng thái trẻ (Đã nhận nuôi) + ngày nhận nuôi.</summary>
    [HttpPost("{id}/approve")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.NHAN_NUOI + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<bool>>> Approve(string id)
    {
        var h = await _db.HOSONHANNUOI.Include(x => x.Tre).FirstOrDefaultAsync(x => x.MaHSNhanNuoi == id);
        if (h is null) return NotFound(ApiResponse<bool>.Fail("Not found"));

        h.TrangThai = "Đã duyệt";
        h.NgayDuyet = DateTime.Today;
        if (h.Tre is not null)
        {
            h.Tre.TrangThai = "Đã nhận nuôi";
            h.Tre.NgayNhanNuoi = DateTime.Today;
            h.Tre.NgayCapNhat = DateTime.Now;
        }
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Đã duyệt hồ sơ nhận nuôi"));
    }

    [HttpPost("{id}/reject")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.NHAN_NUOI + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<bool>>> Reject(string id, [FromBody] DTOs.YeuCauGuiTre.RejectDto body)
    {
        var h = await _db.HOSONHANNUOI.FirstOrDefaultAsync(x => x.MaHSNhanNuoi == id);
        if (h is null) return NotFound(ApiResponse<bool>.Fail("Not found"));
        h.TrangThai = "Từ chối";
        var reason = body?.Reason ?? body?.ReasonReject;
        if (!string.IsNullOrEmpty(reason)) h.GhiChu = reason;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Đã từ chối"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(string id)
    {
        var h = await _db.HOSONHANNUOI.FirstOrDefaultAsync(x => x.MaHSNhanNuoi == id);
        if (h is null) return NotFound(ApiResponse<bool>.Fail("Not found"));
        _db.HOSONHANNUOI.Remove(h);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Đã xóa"));
    }
}
