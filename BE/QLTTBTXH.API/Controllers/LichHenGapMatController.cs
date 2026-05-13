using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLTTBTXH.API.Data;
using QLTTBTXH.API.DTOs.Common;
using QLTTBTXH.API.DTOs.LichHenGapMat;
using QLTTBTXH.API.Models.Entities;
using QLTTBTXH.API.Services;
using System.Security.Claims;

namespace QLTTBTXH.API.Controllers;

[ApiController]
[Route("api/adoption-meetings")]
[Authorize]
public class LichHenGapMatController : ControllerBase
{
    private readonly QuanLyTTBTContext _db;
    private readonly ICodeGenerator _code;

    public LichHenGapMatController(QuanLyTTBTContext db, ICodeGenerator code)
    {
        _db = db; _code = code;
    }

    private static LichHenGapMatDto Map(LichHenGapMat l) => new()
    {
        MaLichGap = l.MaLichGap,
        MaYeuCauNhan = l.MaYeuCauNhan,
        MaTre = l.MaTre,
        TenTre = l.Tre?.HoTen,
        MaCanBo = l.MaCanBo,
        TenCanBo = l.CanBo?.HoTen,
        TenNguoiNhan = l.YeuCauNhanNuoi?.NguoiNhan?.HoTen,
        SDTNguoiNhan = l.YeuCauNhanNuoi?.NguoiNhan?.SDT,
        ThoiGian = l.ThoiGian,
        NgayGapMat = l.NgayGapMat,
        DiaDiem = l.DiaDiem,
        TrangThai = l.TrangThai,
        KetQua = l.KetQua,
        PhanHoiNguoiNhan = l.PhanHoiNguoiNhan,
        ThoiGianDeXuatMoi = l.ThoiGianDeXuatMoi,
        GhiChuCanBo = l.GhiChuCanBo,
        NgayTao = l.NgayTao,
        NgayCapNhat = l.NgayCapNhat,
    };

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<LichHenGapMatDto>>>> GetAll([FromQuery] QueryParams q)
    {
        var query = _db.LICHHENGAPMAT
            .Include(l => l.Tre)
            .Include(l => l.CanBo)
            .Include(l => l.YeuCauNhanNuoi).ThenInclude(y => y!.NguoiNhan)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(q.Status))
            query = query.Where(l => l.TrangThai == q.Status);

        var total = await query.CountAsync();
        var items = await query.OrderByDescending(l => l.ThoiGian)
            .Skip((q.Page - 1) * q.Limit).Take(q.Limit)
            .ToListAsync();

        return Ok(ApiResponse<PagedResult<LichHenGapMatDto>>.Ok(new PagedResult<LichHenGapMatDto>
        {
            Items = items.Select(Map).ToList(),
            Total = total, Page = q.Page, Limit = q.Limit,
            TotalPages = (int)Math.Ceiling(total / (double)q.Limit)
        }));
    }

    [HttpGet("by-request/{maYeuCauNhan}")]
    public async Task<ActionResult<ApiResponse<List<LichHenGapMatDto>>>> GetByRequest(string maYeuCauNhan)
    {
        var items = await _db.LICHHENGAPMAT
            .Include(l => l.Tre)
            .Include(l => l.CanBo)
            .Include(l => l.YeuCauNhanNuoi).ThenInclude(y => y!.NguoiNhan)
            .Where(l => l.MaYeuCauNhan == maYeuCauNhan)
            .OrderByDescending(l => l.ThoiGian)
            .ToListAsync();

        return Ok(ApiResponse<List<LichHenGapMatDto>>.Ok(items.Select(Map).ToList()));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<LichHenGapMatDto>>> GetById(string id)
    {
        var l = await _db.LICHHENGAPMAT
            .Include(x => x.Tre)
            .Include(x => x.CanBo)
            .Include(x => x.YeuCauNhanNuoi).ThenInclude(y => y!.NguoiNhan)
            .FirstOrDefaultAsync(x => x.MaLichGap == id);

        if (l is null) return NotFound(ApiResponse<LichHenGapMatDto>.Fail("Không tìm thấy lịch hẹn"));
        return Ok(ApiResponse<LichHenGapMatDto>.Ok(Map(l)));
    }

    [HttpPost]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.NHAN_NUOI + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<LichHenGapMatDto>>> Create([FromBody] CreateLichHenDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var l = new LichHenGapMat
        {
            MaLichGap = await _code.NextLichHenGapMatAsync(),
            MaYeuCauNhan = dto.MaYeuCauNhan,
            MaTre = dto.MaTre,
            MaCanBo = dto.MaCanBo ?? userId,
            ThoiGian = dto.ThoiGian,
            DiaDiem = dto.DiaDiem,
            TrangThai = "Chờ xác nhận",
            GhiChuCanBo = dto.GhiChuCanBo,
            NgayTao = DateTime.Now,
        };

        _db.LICHHENGAPMAT.Add(l);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<LichHenGapMatDto>.Ok(Map(l), "Đã tạo lịch hẹn"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.NHAN_NUOI + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<LichHenGapMatDto>>> Update(string id, [FromBody] UpdateLichHenDto dto)
    {
        var l = await _db.LICHHENGAPMAT.FirstOrDefaultAsync(x => x.MaLichGap == id);
        if (l is null) return NotFound(ApiResponse<LichHenGapMatDto>.Fail("Không tìm thấy lịch hẹn"));

        if (dto.ThoiGian.HasValue) l.ThoiGian = dto.ThoiGian.Value;
        if (dto.DiaDiem != null) l.DiaDiem = dto.DiaDiem;
        if (dto.TrangThai != null) l.TrangThai = dto.TrangThai;
        if (dto.KetQua != null) l.KetQua = dto.KetQua;
        if (dto.PhanHoiNguoiNhan != null) l.PhanHoiNguoiNhan = dto.PhanHoiNguoiNhan;
        if (dto.ThoiGianDeXuatMoi.HasValue) l.ThoiGianDeXuatMoi = dto.ThoiGianDeXuatMoi;
        if (dto.GhiChuCanBo != null) l.GhiChuCanBo = dto.GhiChuCanBo;
        if (dto.NgayGapMat.HasValue) l.NgayGapMat = dto.NgayGapMat;
        l.NgayCapNhat = DateTime.Now;

        await _db.SaveChangesAsync();
        return Ok(ApiResponse<LichHenGapMatDto>.Ok(Map(l), "Đã cập nhật"));
    }

    /// <summary>Xác nhận lịch hẹn → TrangThai = "Đã xác nhận"</summary>
    [HttpPost("{id}/confirm")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.NHAN_NUOI + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<bool>>> Confirm(string id)
    {
        var l = await _db.LICHHENGAPMAT.FirstOrDefaultAsync(x => x.MaLichGap == id);
        if (l is null) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy"));
        l.TrangThai = "Đã xác nhận";
        l.NgayCapNhat = DateTime.Now;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Đã xác nhận lịch hẹn"));
    }

    /// <summary>Ghi nhận kết quả gặp mặt → TrangThai = "Đã gặp mặt", lưu KetQua + NgayGapMat</summary>
    [HttpPost("{id}/result")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.NHAN_NUOI + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<bool>>> RecordResult(string id, [FromBody] RecordResultDto dto)
    {
        var l = await _db.LICHHENGAPMAT.FirstOrDefaultAsync(x => x.MaLichGap == id);
        if (l is null) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy"));
        l.TrangThai = "Đã gặp mặt";
        l.KetQua = dto.KetQua;
        l.NgayGapMat = dto.NgayGapMat ?? DateTime.Today;
        if (dto.GhiChu != null) l.GhiChuCanBo = dto.GhiChu;
        l.NgayCapNhat = DateTime.Now;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Đã ghi nhận kết quả"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(string id)
    {
        var l = await _db.LICHHENGAPMAT.FirstOrDefaultAsync(x => x.MaLichGap == id);
        if (l is null) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy"));
        _db.LICHHENGAPMAT.Remove(l);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Đã xóa"));
    }
}

public class RecordResultDto
{
    public string? KetQua { get; set; }
    public DateTime? NgayGapMat { get; set; }
    public string? GhiChu { get; set; }
}
