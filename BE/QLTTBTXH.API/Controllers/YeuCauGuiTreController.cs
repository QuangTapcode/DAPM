using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLTTBTXH.API.Data;
using QLTTBTXH.API.DTOs.Common;
using QLTTBTXH.API.DTOs.YeuCauGuiTre;
using QLTTBTXH.API.Models.Entities;
using QLTTBTXH.API.Services;
using System.Security.Claims;

namespace QLTTBTXH.API.Controllers;

[ApiController]
[Route("api/receptions")]
[Authorize]
public class YeuCauGuiTreController : ControllerBase
{
    private readonly QuanLyTTBTContext _db;
    private readonly ICodeGenerator _code;

    public YeuCauGuiTreController(QuanLyTTBTContext db, ICodeGenerator code) { _db = db; _code = code; }

    private static YeuCauGuiTreDto Map(YeuCauGuiTre y, List<string> giayTos) => new()
    {
        MaYeuCauGuiTre = y.MaYeuCauGuiTre,
        MaNguoiGui = y.MaNguoiGui,
        TenNguoiGui = y.NguoiGui?.HoTen,
        MaLoaiNguoiGui = y.MaLoaiNguoiGui,
        TenLoaiNguoiGui = y.LoaiNguoiGui?.TenLoaiNguoiGui,
        QuanHeVoiTre = y.QuanHeVoiTre,
        LyDoGui = y.LyDoGui,
        NgayTao = y.NgayTao,
        NgayCapNhat = y.NgayCapNhat,
        TrangThaiYC = y.TrangThaiYC,
        GhiChu = y.GhiChu,
        GiayTos = giayTos,
        ThongTinTre = y.ThongTinTreTam is null ? null : new ThongTinTreTamDto
        {
            MaThongTin = y.ThongTinTreTam.MaThongTin,
            TenTre = y.ThongTinTreTam.TenTre,
            NgaySinh = y.ThongTinTreTam.NgaySinh,
            GioiTinh = y.ThongTinTreTam.GioiTinh,
            DanToc = y.ThongTinTreTam.DanToc
        }
    };

    /// <summary>Danh sách yêu cầu gửi trẻ. Lọc theo SenderId (FE sender role), hoặc Status.</summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<YeuCauGuiTreDto>>>> GetAll([FromQuery] QueryParams q)
    {
        var query = _db.YEUCAUGUITRE
            .Include(y => y.NguoiGui)
            .Include(y => y.LoaiNguoiGui)
            .Include(y => y.ThongTinTreTam)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(q.SenderId))
            query = query.Where(y => y.MaNguoiGui == q.SenderId);
        if (!string.IsNullOrWhiteSpace(q.Status))
            query = query.Where(y => y.TrangThaiYC == q.Status);

        var total = await query.CountAsync();
        var entities = await query
            .OrderByDescending(y => y.NgayTao)
            .Skip((q.Page - 1) * q.Limit).Take(q.Limit)
            .ToListAsync();

        var ids = entities.Select(y => y.MaYeuCauGuiTre).ToList();
        var giayToLookup = (await _db.GIAYTOPHAPLY.Where(g => g.MaYeuCauGuiTre != null && ids.Contains(g.MaYeuCauGuiTre)).ToListAsync())
            .GroupBy(g => g.MaYeuCauGuiTre!)
            .ToDictionary(g => g.Key, g => g.Select(x => x.MaGiayTo).ToList());

        var items = entities.Select(e =>
            Map(e, giayToLookup.TryGetValue(e.MaYeuCauGuiTre, out var gs) ? gs : new())).ToList();

        return Ok(ApiResponse<PagedResult<YeuCauGuiTreDto>>.Ok(new PagedResult<YeuCauGuiTreDto>
        {
            Items = items, Total = total, Page = q.Page, Limit = q.Limit,
            TotalPages = (int)Math.Ceiling(total / (double)q.Limit)
        }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<YeuCauGuiTreDto>>> GetById(string id)
    {
        var y = await _db.YEUCAUGUITRE
            .Include(y => y.NguoiGui)
            .Include(y => y.LoaiNguoiGui)
            .Include(y => y.ThongTinTreTam)
            .FirstOrDefaultAsync(y => y.MaYeuCauGuiTre == id);
        if (y is null) return NotFound(ApiResponse<YeuCauGuiTreDto>.Fail("Reception request not found"));

        var gs = await _db.GIAYTOPHAPLY.Where(g => g.MaYeuCauGuiTre == id).Select(g => g.MaGiayTo).ToListAsync();
        return Ok(ApiResponse<YeuCauGuiTreDto>.Ok(Map(y, gs)));
    }

    /// <summary>Tạo yêu cầu gửi trẻ (giống sp_TaoYeuCauGuiTre).</summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<YeuCauGuiTreDto>>> Create([FromBody] CreateYeuCauGuiTreDto dto)
    {
        var currentUser = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var maNguoiGui = dto.MaNguoiGui ?? currentUser;
        if (string.IsNullOrEmpty(maNguoiGui))
            return BadRequest(ApiResponse<YeuCauGuiTreDto>.Fail("Không xác định người gửi"));

        var y = new YeuCauGuiTre
        {
            MaYeuCauGuiTre = await _code.NextYeuCauGuiTreAsync(),
            MaNguoiGui = maNguoiGui,
            MaLoaiNguoiGui = dto.MaLoaiNguoiGui,
            QuanHeVoiTre = dto.QuanHeVoiTre,
            LyDoGui = dto.LyDoGui,
            NgayTao = DateTime.Now,
            TrangThaiYC = "Chờ xử lý",
            GhiChu = dto.GhiChu
        };
        _db.YEUCAUGUITRE.Add(y);

        var tt = new ThongTinTreTam
        {
            MaThongTin = await _code.NextThongTinTreTamAsync(),
            MaYeuCauGuiTre = y.MaYeuCauGuiTre,
            TenTre = dto.ThongTinTre.TenTre,
            NgaySinh = dto.ThongTinTre.NgaySinh,
            GioiTinh = dto.ThongTinTre.GioiTinh,
            DanToc = dto.ThongTinTre.DanToc
        };
        _db.THONGTINTRETAM.Add(tt);

        await _db.SaveChangesAsync();
        y.ThongTinTreTam = tt;
        return Ok(ApiResponse<YeuCauGuiTreDto>.Ok(Map(y, new()), "Đã tạo yêu cầu"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<YeuCauGuiTreDto>>> Update(string id, [FromBody] UpdateYeuCauGuiTreDto dto)
    {
        var y = await _db.YEUCAUGUITRE
            .Include(x => x.ThongTinTreTam)
            .FirstOrDefaultAsync(x => x.MaYeuCauGuiTre == id);
        if (y is null) return NotFound(ApiResponse<YeuCauGuiTreDto>.Fail("Reception request not found"));

        if (dto.MaLoaiNguoiGui != null) y.MaLoaiNguoiGui = dto.MaLoaiNguoiGui;
        if (dto.QuanHeVoiTre != null) y.QuanHeVoiTre = dto.QuanHeVoiTre;
        if (dto.LyDoGui != null) y.LyDoGui = dto.LyDoGui;
        if (dto.TrangThaiYC != null) y.TrangThaiYC = dto.TrangThaiYC;
        if (dto.GhiChu != null) y.GhiChu = dto.GhiChu;
        y.NgayCapNhat = DateTime.Now;

        if (dto.ThongTinTre is not null && y.ThongTinTreTam is not null)
        {
            y.ThongTinTreTam.TenTre = dto.ThongTinTre.TenTre;
            y.ThongTinTreTam.NgaySinh = dto.ThongTinTre.NgaySinh;
            y.ThongTinTreTam.GioiTinh = dto.ThongTinTre.GioiTinh;
            y.ThongTinTreTam.DanToc = dto.ThongTinTre.DanToc;
        }

        await _db.SaveChangesAsync();
        var gs = await _db.GIAYTOPHAPLY.Where(g => g.MaYeuCauGuiTre == id).Select(g => g.MaGiayTo).ToListAsync();
        return Ok(ApiResponse<YeuCauGuiTreDto>.Ok(Map(y, gs), "Đã cập nhật"));
    }

    /// <summary>Duyệt yêu cầu gửi trẻ (giống sp_DuyetYeuCauGuiTre). Tự động tạo hồ sơ tiếp nhận và bản ghi trẻ.</summary>
    [HttpPost("{id}/approve")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.TIEP_NHAN + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<object>>> Approve(string id, [FromQuery] string? ghiChu = null)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var y = await _db.YEUCAUGUITRE
            .Include(x => x.ThongTinTreTam)
            .Include(x => x.NguoiGui)
            .FirstOrDefaultAsync(x => x.MaYeuCauGuiTre == id);
        if (y is null) return NotFound(ApiResponse<object>.Fail("Yêu cầu không tồn tại"));
        if (y.TrangThaiYC == "Đã hủy") return BadRequest(ApiResponse<object>.Fail("Không thể duyệt yêu cầu đã hủy"));
        if (y.ThongTinTreTam is null) return BadRequest(ApiResponse<object>.Fail("Không có thông tin trẻ tạm"));

        var hasValidDocs = await _db.GIAYTOPHAPLY
            .AnyAsync(g => g.MaYeuCauGuiTre == id && g.TrangThai == "Hợp lệ");
        if (!hasValidDocs) return BadRequest(ApiResponse<object>.Fail("Chưa có giấy tờ hợp lệ"));

        using var tx = await _db.Database.BeginTransactionAsync();

        var existingHS = await _db.HOSOTIEPNHANTRE.FirstOrDefaultAsync(h => h.MaYeuCauGuiTre == id);
        string maTre = existingHS?.MaTre ?? "";

        if (string.IsNullOrEmpty(maTre))
        {
            maTre = await _code.NextTreAsync();
            _db.TRE.Add(new Models.Entities.Tre
            {
                MaTre = maTre,
                HoTen = y.ThongTinTreTam.TenTre,
                NgaySinh = y.ThongTinTreTam.NgaySinh,
                GioiTinh = y.ThongTinTreTam.GioiTinh,
                MaPhuongXa = y.NguoiGui?.MaPhuongXa,
                DiaChiCuThe = y.NguoiGui?.DiaChiCuThe,
                DanToc = y.ThongTinTreTam.DanToc,
                TrangThai = "Đang chăm sóc",
                NgayTiepNhan = DateTime.Today,
                NgayCapNhat = DateTime.Now,
                GhiChu = "Tạo tự động từ yêu cầu gửi trẻ được duyệt",
                MaNguoiCapNhat = userId
            });
        }

        if (existingHS is not null)
        {
            existingHS.MaTre = maTre;
            existingHS.MaCanBoTiepNhan = userId;
            existingHS.TrangThai = "Đã duyệt";
            existingHS.NgayDuyet = DateTime.Today;
            if (!string.IsNullOrEmpty(ghiChu)) existingHS.GhiChu = ghiChu;
        }
        else
        {
            _db.HOSOTIEPNHANTRE.Add(new HoSoTiepNhanTre
            {
                MaHSTiepNhan = await _code.NextHoSoTiepNhanAsync(),
                MaYeuCauGuiTre = id,
                MaTre = maTre,
                MaCanBoTiepNhan = userId,
                NgayTiepNhan = DateTime.Today,
                TrangThai = "Đã duyệt",
                NgayDuyet = DateTime.Today,
                GhiChu = ghiChu
            });
        }

        y.TrangThaiYC = "Đã tiếp nhận";
        y.NgayCapNhat = DateTime.Now;

        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        return Ok(ApiResponse<object>.Ok(new { maTre, y.TrangThaiYC }, "Đã duyệt yêu cầu gửi trẻ"));
    }

    /// <summary>Từ chối yêu cầu gửi trẻ.</summary>
    [HttpPost("{id}/reject")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.TIEP_NHAN + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<bool>>> Reject(string id, [FromBody] RejectDto body)
    {
        var y = await _db.YEUCAUGUITRE.FirstOrDefaultAsync(x => x.MaYeuCauGuiTre == id);
        if (y is null) return NotFound(ApiResponse<bool>.Fail("Yêu cầu không tồn tại"));
        y.TrangThaiYC = "Từ chối";
        y.NgayCapNhat = DateTime.Now;
        var reason = body?.Reason ?? body?.ReasonReject;
        if (!string.IsNullOrWhiteSpace(reason)) y.GhiChu = reason;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Đã từ chối"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(string id)
    {
        var y = await _db.YEUCAUGUITRE.Include(x => x.ThongTinTreTam)
            .FirstOrDefaultAsync(x => x.MaYeuCauGuiTre == id);
        if (y is null) return NotFound(ApiResponse<bool>.Fail("Not found"));

        y.TrangThaiYC = "Đã hủy";
        y.NgayCapNhat = DateTime.Now;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Đã hủy yêu cầu"));
    }
}
