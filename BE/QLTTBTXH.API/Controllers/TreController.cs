using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLTTBTXH.API.Data;
using QLTTBTXH.API.DTOs.Common;
using QLTTBTXH.API.DTOs.Tre;
using QLTTBTXH.API.Models.Entities;
using QLTTBTXH.API.Services;
using System.Security.Claims;

namespace QLTTBTXH.API.Controllers;

[ApiController]
[Route("api/children")]
[Authorize]
public class TreController : ControllerBase
{
    private readonly QuanLyTTBTContext _db;
    private readonly ICodeGenerator _code;

    public TreController(QuanLyTTBTContext db, ICodeGenerator code) { _db = db; _code = code; }

    private static TreDto Map(Models.Entities.Tre t) => new()
    {
        MaTre = t.MaTre,
        HoTen = t.HoTen,
        NgaySinh = t.NgaySinh,
        GioiTinh = t.GioiTinh,
        MaPhuongXa = t.MaPhuongXa,
        TenPhuongXa = t.PhuongXa?.TenPhuongXa,
        DiaChiCuThe = t.DiaChiCuThe,
        DanToc = t.DanToc,
        TinhCach = t.TinhCach,
        SoThich = t.SoThich,
        DacDiemNhanDang = t.DacDiemNhanDang,
        TrangThai = t.TrangThai,
        NgayTiepNhan = t.NgayTiepNhan,
        NgayCapNhat = t.NgayCapNhat,
        NgayNhanNuoi = t.NgayNhanNuoi,
        GhiChu = t.GhiChu,
        MaNguoiCapNhat = t.MaNguoiCapNhat,
        HinhAnh = t.HinhAnh
    };

    /// <summary>Danh sách trẻ (có phân trang và lọc theo trạng thái, từ khoá).</summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<TreDto>>>> GetAll([FromQuery] QueryParams q)
    {
        var query = _db.TRE.Include(t => t.PhuongXa).AsQueryable();
        if (!string.IsNullOrWhiteSpace(q.Status)) query = query.Where(t => t.TrangThai == q.Status);
        if (!string.IsNullOrWhiteSpace(q.Search))
            query = query.Where(t => t.HoTen.Contains(q.Search) || t.MaTre.Contains(q.Search));

        var total = await query.CountAsync();
        var entities = await query
            .OrderByDescending(t => t.NgayCapNhat)
            .Skip((q.Page - 1) * q.Limit).Take(q.Limit)
            .ToListAsync();
        var items = entities.Select(Map).ToList();

        return Ok(ApiResponse<PagedResult<TreDto>>.Ok(new PagedResult<TreDto>
        {
            Items = items,
            Total = total,
            Page = q.Page,
            Limit = q.Limit,
            TotalPages = (int)Math.Ceiling(total / (double)q.Limit)
        }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<TreDto>>> GetById(string id)
    {
        var t = await _db.TRE.Include(x => x.PhuongXa).FirstOrDefaultAsync(x => x.MaTre == id);
        if (t is null) return NotFound(ApiResponse<TreDto>.Fail("Child not found"));
        return Ok(ApiResponse<TreDto>.Ok(Map(t)));
    }

    [HttpPost]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.TIEP_NHAN + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<TreDto>>> Create([FromBody] CreateTreDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var t = new Models.Entities.Tre
        {
            MaTre = await _code.NextTreAsync(),
            HoTen = dto.HoTen,
            NgaySinh = dto.NgaySinh,
            GioiTinh = dto.GioiTinh,
            MaPhuongXa = dto.MaPhuongXa,
            DiaChiCuThe = dto.DiaChiCuThe,
            DanToc = dto.DanToc,
            TinhCach = dto.TinhCach,
            SoThich = dto.SoThich,
            DacDiemNhanDang = dto.DacDiemNhanDang,
            TrangThai = dto.TrangThai,
            NgayTiepNhan = dto.NgayTiepNhan ?? DateTime.Today,
            NgayCapNhat = DateTime.Now,
            NgayNhanNuoi = dto.NgayNhanNuoi,
            GhiChu = dto.GhiChu,
            HinhAnh = dto.HinhAnh,
            MaNguoiCapNhat = userId
        };
        _db.TRE.Add(t);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<TreDto>.Ok(Map(t), "Tạo trẻ thành công"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.TIEP_NHAN + "," + Roles.NHAN_NUOI + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<TreDto>>> Update(string id, [FromBody] UpdateTreDto dto)
    {
        var t = await _db.TRE.FirstOrDefaultAsync(x => x.MaTre == id);
        if (t is null) return NotFound(ApiResponse<TreDto>.Fail("Child not found"));

        if (dto.HoTen != null) t.HoTen = dto.HoTen;
        if (dto.NgaySinh.HasValue) t.NgaySinh = dto.NgaySinh;
        if (dto.GioiTinh != null) t.GioiTinh = dto.GioiTinh;
        if (dto.MaPhuongXa != null) t.MaPhuongXa = dto.MaPhuongXa;
        if (dto.DiaChiCuThe != null) t.DiaChiCuThe = dto.DiaChiCuThe;
        if (dto.DanToc != null) t.DanToc = dto.DanToc;
        if (dto.TinhCach != null) t.TinhCach = dto.TinhCach;
        if (dto.SoThich != null) t.SoThich = dto.SoThich;
        if (dto.DacDiemNhanDang != null) t.DacDiemNhanDang = dto.DacDiemNhanDang;
        if (dto.TrangThai != null) t.TrangThai = dto.TrangThai;
        if (dto.NgayTiepNhan.HasValue) t.NgayTiepNhan = dto.NgayTiepNhan;
        if (dto.NgayNhanNuoi.HasValue) t.NgayNhanNuoi = dto.NgayNhanNuoi;
        if (dto.GhiChu != null) t.GhiChu = dto.GhiChu;
        if (dto.HinhAnh != null) t.HinhAnh = dto.HinhAnh;

        t.NgayCapNhat = DateTime.Now;
        t.MaNguoiCapNhat = User.FindFirstValue(ClaimTypes.NameIdentifier);

        await _db.SaveChangesAsync();
        return Ok(ApiResponse<TreDto>.Ok(Map(t), "Cập nhật thành công"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(string id)
    {
        var t = await _db.TRE.FirstOrDefaultAsync(x => x.MaTre == id);
        if (t is null) return NotFound(ApiResponse<bool>.Fail("Child not found"));
        _db.TRE.Remove(t);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Đã xoá"));
    }

    /// <summary>Trả về lịch sử tiêm chủng của một trẻ.</summary>
    [HttpGet("{id}/vaccinations")]
    public async Task<ActionResult<ApiResponse<List<object>>>> Vaccinations(string id)
    {
        var list = await _db.LICHSUTIEMCHUNG
            .Include(x => x.Vacxin)
            .Where(x => x.MaTre == id)
            .OrderByDescending(x => x.NgayTiem)
            .Select(x => new { x.MaLSTiemChung, x.MaVacxin, TenVacxin = x.Vacxin!.TenVacxin, PhongBenh = x.Vacxin!.PhongBenh, x.NgayTiem, x.GhiChu })
            .ToListAsync();
        return Ok(ApiResponse<List<object>>.Ok(list.Cast<object>().ToList()));
    }

    /// <summary>Lịch sử theo dõi sức khỏe của một trẻ.</summary>
    [HttpGet("{id}/health")]
    public async Task<ActionResult<ApiResponse<List<object>>>> Health(string id)
    {
        var list = await _db.THEODOISUCKHOE
            .Where(x => x.MaTre == id)
            .OrderByDescending(x => x.NgayCapNhat)
            .Select(x => new
            {
                x.MaTheoDoi, x.MaTre, x.NgayCapNhat,
                x.CanNang, x.ChieuCao, x.NhipTim, x.NhomMau, x.NhietDo,
                x.KetLuan, x.TinhTrangChiTiet, x.MaNguoiCapNhat
            })
            .ToListAsync();
        return Ok(ApiResponse<List<object>>.Ok(list.Cast<object>().ToList()));
    }
}
