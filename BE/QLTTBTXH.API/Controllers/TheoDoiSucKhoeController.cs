using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLTTBTXH.API.Data;
using QLTTBTXH.API.DTOs.Common;
using QLTTBTXH.API.DTOs.TheoDoiSucKhoe;
using QLTTBTXH.API.Models.Entities;
using QLTTBTXH.API.Services;
using System.Security.Claims;

namespace QLTTBTXH.API.Controllers;

[ApiController]
[Route("api/health-records")]
[Authorize]
public class TheoDoiSucKhoeController : ControllerBase
{
    private readonly QuanLyTTBTContext _db;
    private readonly ICodeGenerator _code;

    public TheoDoiSucKhoeController(QuanLyTTBTContext db, ICodeGenerator code) { _db = db; _code = code; }

    private static TheoDoiSucKhoeDto Map(TheoDoiSucKhoe h) => new()
    {
        MaTheoDoi = h.MaTheoDoi,
        MaTre = h.MaTre,
        TenTre = h.Tre?.HoTen,
        MaNguoiCapNhat = h.MaNguoiCapNhat,
        NgayCapNhat = h.NgayCapNhat,
        CanNang = h.CanNang,
        ChieuCao = h.ChieuCao,
        NhipTim = h.NhipTim,
        NhomMau = h.NhomMau,
        NhietDo = h.NhietDo,
        KetLuan = h.KetLuan,
        TinhTrangChiTiet = h.TinhTrangChiTiet
    };

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<TheoDoiSucKhoeDto>>>> GetAll([FromQuery] string? maTre = null)
    {
        var query = _db.THEODOISUCKHOE.Include(x => x.Tre).AsQueryable();
        if (!string.IsNullOrEmpty(maTre)) query = query.Where(x => x.MaTre == maTre);
        var list = (await query.OrderByDescending(x => x.NgayCapNhat).ToListAsync()).Select(Map).ToList();
        return Ok(ApiResponse<List<TheoDoiSucKhoeDto>>.Ok(list));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<TheoDoiSucKhoeDto>>> GetById(string id)
    {
        var h = await _db.THEODOISUCKHOE.Include(x => x.Tre).FirstOrDefaultAsync(x => x.MaTheoDoi == id);
        if (h is null) return NotFound(ApiResponse<TheoDoiSucKhoeDto>.Fail("Not found"));
        return Ok(ApiResponse<TheoDoiSucKhoeDto>.Ok(Map(h)));
    }

    [HttpPost]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.TIEP_NHAN + "," + Roles.NHAN_NUOI + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<TheoDoiSucKhoeDto>>> Create([FromBody] CreateTheoDoiSucKhoeDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var h = new TheoDoiSucKhoe
        {
            MaTheoDoi = await _code.NextTheoDoiSucKhoeAsync(),
            MaTre = dto.MaTre,
            MaNguoiCapNhat = userId,
            NgayCapNhat = DateTime.Now,
            CanNang = dto.CanNang,
            ChieuCao = dto.ChieuCao,
            NhipTim = dto.NhipTim,
            NhomMau = dto.NhomMau,
            NhietDo = dto.NhietDo,
            KetLuan = dto.KetLuan,
            TinhTrangChiTiet = dto.TinhTrangChiTiet
        };
        _db.THEODOISUCKHOE.Add(h);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<TheoDoiSucKhoeDto>.Ok(Map(h), "Đã ghi nhận theo dõi"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.TIEP_NHAN + "," + Roles.NHAN_NUOI + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<TheoDoiSucKhoeDto>>> Update(string id, [FromBody] UpdateTheoDoiSucKhoeDto dto)
    {
        var h = await _db.THEODOISUCKHOE.FirstOrDefaultAsync(x => x.MaTheoDoi == id);
        if (h is null) return NotFound(ApiResponse<TheoDoiSucKhoeDto>.Fail("Not found"));
        if (dto.CanNang.HasValue) h.CanNang = dto.CanNang;
        if (dto.ChieuCao.HasValue) h.ChieuCao = dto.ChieuCao;
        if (dto.NhipTim.HasValue) h.NhipTim = dto.NhipTim;
        if (dto.NhomMau != null) h.NhomMau = dto.NhomMau;
        if (dto.NhietDo.HasValue) h.NhietDo = dto.NhietDo;
        if (dto.KetLuan != null) h.KetLuan = dto.KetLuan;
        if (dto.TinhTrangChiTiet != null) h.TinhTrangChiTiet = dto.TinhTrangChiTiet;
        h.NgayCapNhat = DateTime.Now;
        h.MaNguoiCapNhat = User.FindFirstValue(ClaimTypes.NameIdentifier);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<TheoDoiSucKhoeDto>.Ok(Map(h), "Đã cập nhật"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(string id)
    {
        var h = await _db.THEODOISUCKHOE.FirstOrDefaultAsync(x => x.MaTheoDoi == id);
        if (h is null) return NotFound(ApiResponse<bool>.Fail("Not found"));
        _db.THEODOISUCKHOE.Remove(h);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Đã xóa"));
    }
}
