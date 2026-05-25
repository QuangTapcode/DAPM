using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLTTBTXH.API.Data;
using QLTTBTXH.API.DTOs.Common;
using QLTTBTXH.API.DTOs.LichSuTiemChung;
using QLTTBTXH.API.Models.Entities;
using QLTTBTXH.API.Services;

namespace QLTTBTXH.API.Controllers;

[ApiController]
[Route("api/vaccinations")]
[Authorize]
public class LichSuTiemChungController : ControllerBase
{
    private readonly QuanLyTTBTContext _db;
    private readonly ICodeGenerator _code;

    public LichSuTiemChungController(QuanLyTTBTContext db, ICodeGenerator code) { _db = db; _code = code; }

    private static LichSuTiemChungDto Map(LichSuTiemChung l) => new()
    {
        MaLSTiemChung = l.MaLSTiemChung,
        MaTre = l.MaTre.Trim(),
        MaVacxin = l.MaVacxin.Trim(),
        TenVacxin = l.Vacxin?.TenVacxin,
        PhongBenh = l.Vacxin?.PhongBenh,
        MuiSo = l.MuiSo,
        NgayTiem = l.NgayTiem,
        GhiChu = l.GhiChu
    };

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<LichSuTiemChungDto>>>> GetAll([FromQuery] string? maTre = null)
    {
        var query = _db.LICHSUTIEMCHUNG.Include(x => x.Vacxin).AsQueryable();
        if (!string.IsNullOrEmpty(maTre)) query = query.Where(x => x.MaTre == maTre);
        var list = (await query.OrderByDescending(x => x.NgayTiem).ToListAsync()).Select(Map).ToList();
        return Ok(ApiResponse<List<LichSuTiemChungDto>>.Ok(list));
    }

    [HttpPost]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.TIEP_NHAN + "," + Roles.NHAN_NUOI + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<LichSuTiemChungDto>>> Create([FromBody] CreateLichSuTiemChungDto dto)
    {
        var l = new LichSuTiemChung
        {
            MaLSTiemChung = await _code.NextLichSuTiemChungAsync(),
            MaTre = dto.MaTre,
            MaVacxin = dto.MaVacxin,
            MuiSo = dto.MuiSo,
            NgayTiem = dto.NgayTiem,
            GhiChu = dto.GhiChu
        };
        _db.LICHSUTIEMCHUNG.Add(l);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<LichSuTiemChungDto>.Ok(Map(l), "Đã thêm mũi tiêm"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.TIEP_NHAN + "," + Roles.NHAN_NUOI + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<LichSuTiemChungDto>>> Update(string id, [FromBody] UpdateLichSuTiemChungDto dto)
    {
        var l = await _db.LICHSUTIEMCHUNG.FirstOrDefaultAsync(x => x.MaLSTiemChung == id);
        if (l is null) return NotFound(ApiResponse<LichSuTiemChungDto>.Fail("Not found"));
        if (dto.MaVacxin != null) l.MaVacxin = dto.MaVacxin;
        if (dto.MuiSo.HasValue) l.MuiSo = dto.MuiSo.Value;
        if (dto.NgayTiem.HasValue) l.NgayTiem = dto.NgayTiem.Value;
        if (dto.GhiChu != null) l.GhiChu = dto.GhiChu;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<LichSuTiemChungDto>.Ok(Map(l), "Đã cập nhật"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(string id)
    {
        var l = await _db.LICHSUTIEMCHUNG.FirstOrDefaultAsync(x => x.MaLSTiemChung == id);
        if (l is null) return NotFound(ApiResponse<bool>.Fail("Not found"));
        _db.LICHSUTIEMCHUNG.Remove(l);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Đã xóa"));
    }
}
