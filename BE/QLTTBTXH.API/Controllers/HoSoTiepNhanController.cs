using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLTTBTXH.API.Data;
using QLTTBTXH.API.DTOs.Common;
using QLTTBTXH.API.DTOs.HoSoTiepNhan;
using QLTTBTXH.API.Models.Entities;
using QLTTBTXH.API.Services;
using System.Security.Claims;

namespace QLTTBTXH.API.Controllers;

[ApiController]
[Route("api/reception-profiles")]
[Authorize]
public class HoSoTiepNhanController : ControllerBase
{
    private readonly QuanLyTTBTContext _db;
    private readonly ICodeGenerator _code;

    public HoSoTiepNhanController(QuanLyTTBTContext db, ICodeGenerator code) { _db = db; _code = code; }

    private static HoSoTiepNhanDto Map(HoSoTiepNhanTre h) => new()
    {
        MaHSTiepNhan = h.MaHSTiepNhan,
        MaYeuCauGuiTre = h.MaYeuCauGuiTre,
        MaTre = h.MaTre,
        TenTre = h.Tre?.HoTen,
        MaCanBoTiepNhan = h.MaCanBoTiepNhan,
        TenCanBo = h.CanBoTiepNhan?.HoTen,
        TenNguoiGui = h.YeuCauGuiTre?.NguoiGui?.HoTen,
        QuanHeVoiTre = h.YeuCauGuiTre?.QuanHeVoiTre,
        LyDoGui = h.YeuCauGuiTre?.LyDoGui,
        NgaySinhTre = h.Tre?.NgaySinh,
        GioiTinhTre = h.Tre?.GioiTinh,
        NgayTiepNhan = h.NgayTiepNhan,
        TrangThai = h.TrangThai,
        NgayDuyet = h.NgayDuyet,
        GhiChu = h.GhiChu
    };

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<HoSoTiepNhanDto>>>> GetAll([FromQuery] QueryParams q)
    {
        var query = _db.HOSOTIEPNHANTRE
            .Include(h => h.Tre)
            .Include(h => h.CanBoTiepNhan)
            .Include(h => h.YeuCauGuiTre).ThenInclude(y => y!.NguoiGui)
            .AsQueryable();
        if (!string.IsNullOrWhiteSpace(q.Status)) query = query.Where(h => h.TrangThai == q.Status);

        var total = await query.CountAsync();
        var entities = await query.OrderByDescending(h => h.NgayTiepNhan)
            .Skip((q.Page - 1) * q.Limit).Take(q.Limit).ToListAsync();
        var items = entities.Select(Map).ToList();

        return Ok(ApiResponse<PagedResult<HoSoTiepNhanDto>>.Ok(new PagedResult<HoSoTiepNhanDto>
        {
            Items = items, Total = total, Page = q.Page, Limit = q.Limit,
            TotalPages = (int)Math.Ceiling(total / (double)q.Limit)
        }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<HoSoTiepNhanDto>>> GetById(string id)
    {
        var h = await _db.HOSOTIEPNHANTRE
            .Include(x => x.Tre)
            .Include(x => x.CanBoTiepNhan)
            .Include(x => x.YeuCauGuiTre).ThenInclude(y => y!.NguoiGui)
            .FirstOrDefaultAsync(x => x.MaHSTiepNhan == id);
        if (h is null) return NotFound(ApiResponse<HoSoTiepNhanDto>.Fail("Not found"));
        return Ok(ApiResponse<HoSoTiepNhanDto>.Ok(Map(h)));
    }

    [HttpPost]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.TIEP_NHAN + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<HoSoTiepNhanDto>>> Create([FromBody] CreateHoSoTiepNhanDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (await _db.HOSOTIEPNHANTRE.AnyAsync(x => x.MaYeuCauGuiTre == dto.MaYeuCauGuiTre))
            return BadRequest(ApiResponse<HoSoTiepNhanDto>.Fail("Yêu cầu đã có hồ sơ tiếp nhận"));

        var h = new HoSoTiepNhanTre
        {
            MaHSTiepNhan = await _code.NextHoSoTiepNhanAsync(),
            MaYeuCauGuiTre = dto.MaYeuCauGuiTre,
            MaTre = dto.MaTre,
            MaCanBoTiepNhan = dto.MaCanBoTiepNhan ?? userId,
            NgayTiepNhan = DateTime.Today,
            TrangThai = "Đang xử lý",
            GhiChu = dto.GhiChu
        };
        _db.HOSOTIEPNHANTRE.Add(h);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<HoSoTiepNhanDto>.Ok(Map(h), "Đã tạo hồ sơ"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.TIEP_NHAN + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<HoSoTiepNhanDto>>> Update(string id, [FromBody] UpdateHoSoTiepNhanDto dto)
    {
        var h = await _db.HOSOTIEPNHANTRE.FirstOrDefaultAsync(x => x.MaHSTiepNhan == id);
        if (h is null) return NotFound(ApiResponse<HoSoTiepNhanDto>.Fail("Not found"));
        if (dto.MaTre != null) h.MaTre = dto.MaTre;
        if (dto.TrangThai != null) h.TrangThai = dto.TrangThai;
        if (dto.GhiChu != null) h.GhiChu = dto.GhiChu;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<HoSoTiepNhanDto>.Ok(Map(h), "Đã cập nhật"));
    }

    [HttpPost("{id}/approve")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<bool>>> Approve(string id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var h = await _db.HOSOTIEPNHANTRE.FirstOrDefaultAsync(x => x.MaHSTiepNhan == id);
        if (h is null) return NotFound(ApiResponse<bool>.Fail("Not found"));
        if (h.TrangThai == "Đã duyệt") return BadRequest(ApiResponse<bool>.Fail("Hồ sơ đã được duyệt trước đó"));

        var y = await _db.YEUCAUGUITRE
            .Include(x => x.ThongTinTreTam)
            .Include(x => x.NguoiGui)
            .FirstOrDefaultAsync(x => x.MaYeuCauGuiTre == h.MaYeuCauGuiTre);
        if (y is null) return BadRequest(ApiResponse<bool>.Fail("Không tìm thấy yêu cầu gửi trẻ"));
        if (y.ThongTinTreTam is null) return BadRequest(ApiResponse<bool>.Fail("Thiếu thông tin trẻ tạm"));

        using var tx = await _db.Database.BeginTransactionAsync();

        var maTre = await _code.NextTreAsync();
        _db.TRE.Add(new Models.Entities.Tre
        {
            MaTre = maTre,
            HoTen = y.ThongTinTreTam.TenTre,
            NgaySinh = y.ThongTinTreTam.NgaySinh,
            GioiTinh = y.ThongTinTreTam.GioiTinh,
            DanToc = y.ThongTinTreTam.DanToc,
            MaPhuongXa = y.NguoiGui?.MaPhuongXa,
            DiaChiCuThe = y.NguoiGui?.DiaChiCuThe,
            TrangThai = "Đang chăm sóc",
            NgayTiepNhan = DateTime.Today,
            NgayCapNhat = DateTime.Now,
            GhiChu = "Tạo tự động khi duyệt hồ sơ tiếp nhận",
            MaNguoiCapNhat = userId
        });

        h.MaTre = maTre;
        h.TrangThai = "Đã duyệt";
        h.NgayDuyet = DateTime.Today;

        y.TrangThaiYC = "Đã tiếp nhận";
        y.NgayCapNhat = DateTime.Now;

        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        return Ok(ApiResponse<bool>.Ok(true, "Đã duyệt hồ sơ tiếp nhận, trẻ đã được thêm vào hệ thống"));
    }

    [HttpPost("{id}/reject")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.TIEP_NHAN + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<bool>>> Reject(string id, [FromBody] DTOs.YeuCauGuiTre.RejectDto body)
    {
        var h = await _db.HOSOTIEPNHANTRE.FirstOrDefaultAsync(x => x.MaHSTiepNhan == id);
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
        var h = await _db.HOSOTIEPNHANTRE.FirstOrDefaultAsync(x => x.MaHSTiepNhan == id);
        if (h is null) return NotFound(ApiResponse<bool>.Fail("Not found"));
        _db.HOSOTIEPNHANTRE.Remove(h);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Đã xóa"));
    }
}
