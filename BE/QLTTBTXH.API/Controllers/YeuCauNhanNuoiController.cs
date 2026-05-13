using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLTTBTXH.API.Data;
using QLTTBTXH.API.DTOs.Common;
using QLTTBTXH.API.DTOs.YeuCauGuiTre;
using QLTTBTXH.API.DTOs.YeuCauNhanNuoi;
using QLTTBTXH.API.Models.Entities;
using QLTTBTXH.API.Services;
using System.Security.Claims;

namespace QLTTBTXH.API.Controllers;

[ApiController]
[Route("api/adoptions")]
[Authorize]
public class YeuCauNhanNuoiController : ControllerBase
{
    private readonly QuanLyTTBTContext _db;
    private readonly ICodeGenerator _code;

    public YeuCauNhanNuoiController(QuanLyTTBTContext db, ICodeGenerator code) { _db = db; _code = code; }

    private static YeuCauNhanNuoiDto Map(YeuCauNhanNuoi y, List<string> giayTos) => new()
    {
        MaYeuCauNhan = y.MaYeuCauNhan,
        MaNguoiNhan = y.MaNguoiNhan,
        TenNguoiNhan = y.NguoiNhan?.HoTen,
        SDTNguoiNhan = y.NguoiNhan?.SDT,
        NgaySinhNguoiNhan = y.NguoiNhan?.NgaySinh,
        LyDoNhanNuoi = y.LyDoNhanNuoi,
        MongMuonVeTre = y.MongMuonVeTre,
        ThuNhapHangThang = y.ThuNhapHangThang,
        NgheNghiep = y.NgheNghiep,
        NgayTao = y.NgayTao,
        NgayCapNhat = y.NgayCapNhat,
        TrangThai = y.TrangThai,
        NguoiDuyet = y.NguoiDuyet,
        GiayTos = giayTos
    };

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<YeuCauNhanNuoiDto>>>> GetAll([FromQuery] QueryParams q)
    {
        var query = _db.YEUCAUNHANNUOI.Include(y => y.NguoiNhan).AsQueryable();
        if (!string.IsNullOrWhiteSpace(q.AdopterId))
            query = query.Where(y => y.MaNguoiNhan == q.AdopterId);
        if (!string.IsNullOrWhiteSpace(q.Status))
            query = query.Where(y => y.TrangThai == q.Status);

        var total = await query.CountAsync();
        var entities = await query.OrderByDescending(y => y.NgayTao)
            .Skip((q.Page - 1) * q.Limit).Take(q.Limit).ToListAsync();

        var ids = entities.Select(y => y.MaYeuCauNhan).ToList();
        var giayToLookup = (await _db.GIAYTOPHAPLY.Where(g => g.MaYeuCauNhan != null && ids.Contains(g.MaYeuCauNhan)).ToListAsync())
            .GroupBy(g => g.MaYeuCauNhan!).ToDictionary(g => g.Key, g => g.Select(x => x.MaGiayTo).ToList());

        var items = entities.Select(e =>
            Map(e, giayToLookup.TryGetValue(e.MaYeuCauNhan, out var gs) ? gs : new())).ToList();

        return Ok(ApiResponse<PagedResult<YeuCauNhanNuoiDto>>.Ok(new PagedResult<YeuCauNhanNuoiDto>
        {
            Items = items, Total = total, Page = q.Page, Limit = q.Limit,
            TotalPages = (int)Math.Ceiling(total / (double)q.Limit)
        }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<YeuCauNhanNuoiDto>>> GetById(string id)
    {
        var y = await _db.YEUCAUNHANNUOI.Include(y => y.NguoiNhan).FirstOrDefaultAsync(y => y.MaYeuCauNhan == id);
        if (y is null) return NotFound(ApiResponse<YeuCauNhanNuoiDto>.Fail("Adoption request not found"));
        var gs = await _db.GIAYTOPHAPLY.Where(g => g.MaYeuCauNhan == id).Select(g => g.MaGiayTo).ToListAsync();
        return Ok(ApiResponse<YeuCauNhanNuoiDto>.Ok(Map(y, gs)));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<YeuCauNhanNuoiDto>>> Create([FromBody] CreateYeuCauNhanNuoiDto dto)
    {
        var currentUser = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var maNguoiNhan = dto.MaNguoiNhan ?? currentUser;
        if (string.IsNullOrEmpty(maNguoiNhan))
            return BadRequest(ApiResponse<YeuCauNhanNuoiDto>.Fail("Không xác định người nhận"));

        var y = new YeuCauNhanNuoi
        {
            MaYeuCauNhan = await _code.NextYeuCauNhanNuoiAsync(),
            MaNguoiNhan = maNguoiNhan,
            LyDoNhanNuoi = dto.LyDoNhanNuoi,
            MongMuonVeTre = dto.MongMuonVeTre,
            ThuNhapHangThang = dto.ThuNhapHangThang,
            NgheNghiep = dto.NgheNghiep,
            NgayTao = DateTime.Now,
            TrangThai = "Chờ xử lý"
        };
        _db.YEUCAUNHANNUOI.Add(y);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<YeuCauNhanNuoiDto>.Ok(Map(y, new()), "Đã tạo yêu cầu nhận nuôi"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<YeuCauNhanNuoiDto>>> Update(string id, [FromBody] UpdateYeuCauNhanNuoiDto dto)
    {
        var y = await _db.YEUCAUNHANNUOI.FirstOrDefaultAsync(x => x.MaYeuCauNhan == id);
        if (y is null) return NotFound(ApiResponse<YeuCauNhanNuoiDto>.Fail("Not found"));

        if (dto.LyDoNhanNuoi != null) y.LyDoNhanNuoi = dto.LyDoNhanNuoi;
        if (dto.MongMuonVeTre != null) y.MongMuonVeTre = dto.MongMuonVeTre;
        if (dto.ThuNhapHangThang.HasValue) y.ThuNhapHangThang = dto.ThuNhapHangThang;
        if (dto.NgheNghiep != null) y.NgheNghiep = dto.NgheNghiep;
        if (dto.TrangThai != null) y.TrangThai = dto.TrangThai;
        y.NgayCapNhat = DateTime.Now;

        await _db.SaveChangesAsync();
        return Ok(ApiResponse<YeuCauNhanNuoiDto>.Ok(Map(y, new()), "Đã cập nhật"));
    }

    [HttpPost("{id}/approve")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.NHAN_NUOI + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<bool>>> Approve(string id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var y = await _db.YEUCAUNHANNUOI.FirstOrDefaultAsync(x => x.MaYeuCauNhan == id);
        if (y is null) return NotFound(ApiResponse<bool>.Fail("Not found"));

        y.TrangThai = "Đã duyệt";
        y.NguoiDuyet = userId;
        y.NgayCapNhat = DateTime.Now;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Đã duyệt yêu cầu"));
    }

    [HttpPost("{id}/reject")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.NHAN_NUOI + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<bool>>> Reject(string id, [FromBody] RejectDto body)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var y = await _db.YEUCAUNHANNUOI.FirstOrDefaultAsync(x => x.MaYeuCauNhan == id);
        if (y is null) return NotFound(ApiResponse<bool>.Fail("Not found"));

        y.TrangThai = "Từ chối";
        y.NguoiDuyet = userId;
        y.NgayCapNhat = DateTime.Now;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Đã từ chối yêu cầu"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(string id)
    {
        var y = await _db.YEUCAUNHANNUOI.FirstOrDefaultAsync(x => x.MaYeuCauNhan == id);
        if (y is null) return NotFound(ApiResponse<bool>.Fail("Not found"));
        _db.YEUCAUNHANNUOI.Remove(y);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Đã xóa"));
    }
}
