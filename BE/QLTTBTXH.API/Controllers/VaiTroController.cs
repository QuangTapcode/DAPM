using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLTTBTXH.API.Data;
using QLTTBTXH.API.DTOs.Common;
using QLTTBTXH.API.DTOs.DanhMuc;
using QLTTBTXH.API.Services;

namespace QLTTBTXH.API.Controllers;

[ApiController]
[Route("api/roles")]
[Authorize(Roles = Roles.ADMIN + "," + Roles.TRUONG_PHONG)]
public class VaiTroController : ControllerBase
{
    private readonly QuanLyTTBTContext _db;
    public VaiTroController(QuanLyTTBTContext db) { _db = db; }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<VaiTroDto>>>> GetAll()
    {
        var roles = await _db.VAITRO.ToListAsync();
        var mapRQ = (await _db.QUYENHAN_VAITRO.ToListAsync())
            .GroupBy(x => x.MaVaiTro)
            .ToDictionary(g => g.Key, g => g.Select(x => x.MaQuyen).ToList());

        var list = roles.Select(r => new VaiTroDto
        {
            MaVaiTro = r.MaVaiTro,
            TenVaiTro = r.TenVaiTro,
            MoTa = r.MoTa,
            Quyens = mapRQ.TryGetValue(r.MaVaiTro, out var q) ? q : new()
        }).ToList();
        return Ok(ApiResponse<List<VaiTroDto>>.Ok(list));
    }

    [HttpGet("permissions")]
    public async Task<ActionResult<ApiResponse<List<QuyenHanDto>>>> Permissions()
    {
        var list = await _db.QUYENHAN.Select(q => new QuyenHanDto
        { MaQuyen = q.MaQuyen, TenQuyen = q.TenQuyen, MoTa = q.MoTa }).ToListAsync();
        return Ok(ApiResponse<List<QuyenHanDto>>.Ok(list));
    }
}
