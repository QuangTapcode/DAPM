using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLTTBTXH.API.Data;
using QLTTBTXH.API.DTOs.Common;
using QLTTBTXH.API.DTOs.LichHenGapMatNhanNuoi;
using QLTTBTXH.API.Models.Entities;
using QLTTBTXH.API.Services;
using System.Security.Claims;

namespace QLTTBTXH.API.Controllers;

[ApiController]
[Route("api/meetings")]
[Authorize]
public class LichHenGapMatController : ControllerBase
{
    private readonly QuanLyTTBTContext _db;
    private readonly ICodeGenerator _code;

    public LichHenGapMatController(QuanLyTTBTContext db, ICodeGenerator code)
    {
        _db = db;
        _code = code;
    }

    private async Task<LichHenGapMatNhanNuoiDto> MapAsync(LichHenGapMatNhanNuoi l)
    {
        var childDetails = await _db.CHITIETGAPMAT
            .Include(c => c.Tre)
            .Where(c => c.MaLichGap == l.MaLichGap)
            .Select(c => new ChiTietGapMatDto
            {
                MaTre = c.MaTre,
                TenTre = c.Tre != null ? c.Tre.HoTen : null,
                KetQua = c.KetQua,
                GhiChuCanBo = c.GhiChuCanBo
            })
            .ToListAsync();

        return new LichHenGapMatNhanNuoiDto
        {
            MaLichGap = l.MaLichGap,
            MaYeuCauNhan = l.MaYeuCauNhan,
            TenNguoiNhan = l.YeuCauNhanNuoi?.NguoiNhan?.HoTen,
            MaCanBo = l.MaCanBo,
            TenCanBo = l.CanBo?.HoTen,
            NgayGapMat = l.NgayGapMat,
            ThoiGian = l.ThoiGian,
            DiaDiem = l.DiaDiem,
            TrangThai = l.TrangThai,
            PhanHoiNguoiNhan = l.PhanHoiNguoiNhan,
            ThoiGianDeXuatMoi = l.ThoiGianDeXuatMoi,
            NgayTao = l.NgayTao,
            NgayCapNhat = l.NgayCapNhat,
            Children = childDetails
        };
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<LichHenGapMatNhanNuoiDto>>>> GetAll([FromQuery] QueryParams q, [FromQuery] string? maYeuCauNhan = null)
    {
        var query = _db.LICHHENGAPMATNHANNUOI
            .Include(l => l.YeuCauNhanNuoi).ThenInclude(y => y.NguoiNhan)
            .Include(l => l.CanBo)
            .AsQueryable();

        if (!string.IsNullOrEmpty(maYeuCauNhan))
            query = query.Where(l => l.MaYeuCauNhan == maYeuCauNhan);
        if (!string.IsNullOrEmpty(q.Status))
            query = query.Where(l => l.TrangThai == q.Status);

        var total = await query.CountAsync();
        var entities = await query.OrderByDescending(l => l.NgayTao)
            .Skip((q.Page - 1) * q.Limit).Take(q.Limit).ToListAsync();

        var items = new List<LichHenGapMatNhanNuoiDto>();
        foreach (var e in entities)
        {
            items.Add(await MapAsync(e));
        }

        return Ok(ApiResponse<PagedResult<LichHenGapMatNhanNuoiDto>>.Ok(new PagedResult<LichHenGapMatNhanNuoiDto>
        {
            Items = items,
            Total = total,
            Page = q.Page,
            Limit = q.Limit,
            TotalPages = (int)Math.Ceiling(total / (double)q.Limit)
        }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<LichHenGapMatNhanNuoiDto>>> GetById(string id)
    {
        var l = await _db.LICHHENGAPMATNHANNUOI
            .Include(l => l.YeuCauNhanNuoi).ThenInclude(y => y.NguoiNhan)
            .Include(l => l.CanBo)
            .FirstOrDefaultAsync(x => x.MaLichGap == id);

        if (l is null) return NotFound(ApiResponse<LichHenGapMatNhanNuoiDto>.Fail("Lịch hẹn không tồn tại"));
        return Ok(ApiResponse<LichHenGapMatNhanNuoiDto>.Ok(await MapAsync(l)));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<LichHenGapMatNhanNuoiDto>>> Create([FromBody] CreateLichHenGapMatNhanNuoiDto dto)
    {
        var currentUser = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var maCanBo = dto.MaCanBo ?? currentUser;

        var ycnn = await _db.YEUCAUNHANNUOI.AnyAsync(y => y.MaYeuCauNhan == dto.MaYeuCauNhan);
        if (!ycnn) return BadRequest(ApiResponse<LichHenGapMatNhanNuoiDto>.Fail("Yêu cầu nhận nuôi không tồn tại"));

        var nextId = await _code.NextLichHenGapMatNhanNuoiAsync();

        var l = new LichHenGapMatNhanNuoi
        {
            MaLichGap = nextId,
            MaYeuCauNhan = dto.MaYeuCauNhan,
            MaCanBo = maCanBo,
            NgayGapMat = dto.NgayGapMat,
            ThoiGian = dto.ThoiGian,
            DiaDiem = dto.DiaDiem,
            TrangThai = "Chờ xác nhận",
            NgayTao = DateTime.Now
        };

        _db.LICHHENGAPMATNHANNUOI.Add(l);

        if (dto.MaTres != null && dto.MaTres.Any())
        {
            foreach (var maTre in dto.MaTres.Distinct())
            {
                var treExists = await _db.TRE.AnyAsync(t => t.MaTre == maTre);
                if (!treExists) continue;

                var ct = new ChiTietGapMat
                {
                    MaLichGap = nextId,
                    MaTre = maTre,
                    KetQua = null,
                    GhiChuCanBo = null
                };
                _db.CHITIETGAPMAT.Add(ct);
            }
        }

        await _db.SaveChangesAsync();

        var createdMeeting = await _db.LICHHENGAPMATNHANNUOI
            .Include(m => m.YeuCauNhanNuoi).ThenInclude(y => y.NguoiNhan)
            .Include(m => m.CanBo)
            .FirstOrDefaultAsync(x => x.MaLichGap == nextId);

        return Ok(ApiResponse<LichHenGapMatNhanNuoiDto>.Ok(await MapAsync(createdMeeting!), "Đã lên lịch hẹn gặp mặt"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<LichHenGapMatNhanNuoiDto>>> Update(string id, [FromBody] UpdateLichHenGapMatNhanNuoiDto dto)
    {
        var l = await _db.LICHHENGAPMATNHANNUOI
            .Include(x => x.YeuCauNhanNuoi).ThenInclude(y => y.NguoiNhan)
            .Include(x => x.CanBo)
            .FirstOrDefaultAsync(x => x.MaLichGap == id);

        if (l is null) return NotFound(ApiResponse<LichHenGapMatNhanNuoiDto>.Fail("Lịch hẹn không tồn tại"));

        if (dto.NgayGapMat.HasValue) l.NgayGapMat = dto.NgayGapMat;
        if (dto.ThoiGian.HasValue) l.ThoiGian = dto.ThoiGian.Value;
        if (dto.DiaDiem != null) l.DiaDiem = dto.DiaDiem;
        if (dto.TrangThai != null) l.TrangThai = dto.TrangThai;
        if (dto.PhanHoiNguoiNhan != null) l.PhanHoiNguoiNhan = dto.PhanHoiNguoiNhan;
        if (dto.ThoiGianDeXuatMoi.HasValue) l.ThoiGianDeXuatMoi = dto.ThoiGianDeXuatMoi;

        l.NgayCapNhat = DateTime.Now;

        // Cập nhật kết quả đánh giá cho từng trẻ (nếu có)
        if (dto.Children != null && dto.Children.Any())
        {
            foreach (var item in dto.Children)
            {
                var ct = await _db.CHITIETGAPMAT.FirstOrDefaultAsync(x => x.MaLichGap == id && x.MaTre == item.MaTre);
                if (ct != null)
                {
                    if (item.KetQua != null) ct.KetQua = item.KetQua;
                    if (item.GhiChuCanBo != null) ct.GhiChuCanBo = item.GhiChuCanBo;
                }
            }
        }

        await _db.SaveChangesAsync();
        return Ok(ApiResponse<LichHenGapMatNhanNuoiDto>.Ok(await MapAsync(l), "Đã cập nhật lịch hẹn"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(string id)
    {
        var l = await _db.LICHHENGAPMATNHANNUOI.FirstOrDefaultAsync(x => x.MaLichGap == id);
        if (l is null) return NotFound(ApiResponse<bool>.Fail("Lịch hẹn không tồn tại"));

        // Xóa chi tiết liên quan trước
        var details = await _db.CHITIETGAPMAT.Where(x => x.MaLichGap == id).ToListAsync();
        _db.CHITIETGAPMAT.RemoveRange(details);

        _db.LICHHENGAPMATNHANNUOI.Remove(l);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<bool>.Ok(true, "Đã xóa lịch hẹn thành công"));
    }
}
