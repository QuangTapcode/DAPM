using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLTTBTXH.API.Data;
using QLTTBTXH.API.DTOs.Common;
using QLTTBTXH.API.DTOs.GiayTo;
using QLTTBTXH.API.Models.Entities;
using QLTTBTXH.API.Services;

namespace QLTTBTXH.API.Controllers;

[ApiController]
[Route("api/documents")]
[Authorize]
public class GiayToController : ControllerBase
{
    private readonly QuanLyTTBTContext _db;
    private readonly ICodeGenerator _code;
    private readonly IWebHostEnvironment _env;

    public GiayToController(QuanLyTTBTContext db, ICodeGenerator code, IWebHostEnvironment env)
    {
        _db = db; _code = code; _env = env;
    }

    private static GiayToDto Map(GiayToPhapLy g) => new()
    {
        MaGiayTo = g.MaGiayTo,
        TenGiayTo = g.TenGiayTo,
        LoaiGiayTo = g.LoaiGiayTo,
        DuongDanFile = g.DuongDanFile,
        TrangThai = g.TrangThai,
        MaYeuCauGuiTre = g.MaYeuCauGuiTre,
        MaYeuCauNhan = g.MaYeuCauNhan,
        NgayCapNhat = g.NgayCapNhat
    };

    /// <summary>Danh sách giấy tờ, có thể lọc theo yêu cầu gửi trẻ hoặc yêu cầu nhận nuôi.</summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<GiayToDto>>>> GetAll(
        [FromQuery] string? maYeuCauGuiTre = null,
        [FromQuery] string? maYeuCauNhan = null,
        [FromQuery] string? status = null)
    {
        var query = _db.GIAYTOPHAPLY.AsQueryable();
        if (!string.IsNullOrEmpty(maYeuCauGuiTre)) query = query.Where(g => g.MaYeuCauGuiTre == maYeuCauGuiTre);
        if (!string.IsNullOrEmpty(maYeuCauNhan)) query = query.Where(g => g.MaYeuCauNhan == maYeuCauNhan);
        if (!string.IsNullOrEmpty(status)) query = query.Where(g => g.TrangThai == status);

        var list = (await query.OrderByDescending(g => g.NgayCapNhat).ToListAsync()).Select(Map).ToList();
        return Ok(ApiResponse<List<GiayToDto>>.Ok(list));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<GiayToDto>>> GetById(string id)
    {
        var g = await _db.GIAYTOPHAPLY.FirstOrDefaultAsync(x => x.MaGiayTo == id);
        if (g is null) return NotFound(ApiResponse<GiayToDto>.Fail("Not found"));
        return Ok(ApiResponse<GiayToDto>.Ok(Map(g)));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<GiayToDto>>> Create([FromBody] CreateGiayToDto dto)
    {
        if ((string.IsNullOrEmpty(dto.MaYeuCauGuiTre) && string.IsNullOrEmpty(dto.MaYeuCauNhan)) ||
            (!string.IsNullOrEmpty(dto.MaYeuCauGuiTre) && !string.IsNullOrEmpty(dto.MaYeuCauNhan)))
            return BadRequest(ApiResponse<GiayToDto>.Fail("Phải gắn với đúng 1 trong 2: MaYeuCauGuiTre hoặc MaYeuCauNhan"));

        var g = new GiayToPhapLy
        {
            MaGiayTo = await _code.NextGiayToAsync(),
            TenGiayTo = dto.TenGiayTo,
            LoaiGiayTo = dto.LoaiGiayTo,
            DuongDanFile = dto.DuongDanFile,
            TrangThai = dto.TrangThai,
            MaYeuCauGuiTre = string.IsNullOrEmpty(dto.MaYeuCauGuiTre) ? null : dto.MaYeuCauGuiTre,
            MaYeuCauNhan = string.IsNullOrEmpty(dto.MaYeuCauNhan) ? null : dto.MaYeuCauNhan,
            NgayCapNhat = DateTime.Now
        };
        _db.GIAYTOPHAPLY.Add(g);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<GiayToDto>.Ok(Map(g), "Đã thêm giấy tờ"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<GiayToDto>>> Update(string id, [FromBody] UpdateGiayToDto dto)
    {
        var g = await _db.GIAYTOPHAPLY.FirstOrDefaultAsync(x => x.MaGiayTo == id);
        if (g is null) return NotFound(ApiResponse<GiayToDto>.Fail("Not found"));

        if (dto.TenGiayTo != null) g.TenGiayTo = dto.TenGiayTo;
        if (dto.LoaiGiayTo != null) g.LoaiGiayTo = dto.LoaiGiayTo;
        if (dto.DuongDanFile != null) g.DuongDanFile = dto.DuongDanFile;
        if (dto.TrangThai != null) g.TrangThai = dto.TrangThai;
        g.NgayCapNhat = DateTime.Now;

        await _db.SaveChangesAsync();
        return Ok(ApiResponse<GiayToDto>.Ok(Map(g), "Đã cập nhật"));
    }

    [HttpPatch("{id}/verify")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.TIEP_NHAN + "," + Roles.NHAN_NUOI + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<bool>>> Verify(string id, [FromQuery] string status = "Hợp lệ")
    {
        var g = await _db.GIAYTOPHAPLY.FirstOrDefaultAsync(x => x.MaGiayTo == id);
        if (g is null) return NotFound(ApiResponse<bool>.Fail("Not found"));
        var valid = new[] { "Chờ xác minh", "Hợp lệ", "Không hợp lệ", "Hết hạn", "Cần bổ sung" };
        if (!valid.Contains(status)) return BadRequest(ApiResponse<bool>.Fail("Trạng thái không hợp lệ"));
        g.TrangThai = status;
        g.NgayCapNhat = DateTime.Now;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, $"Đã cập nhật trạng thái → {status}"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(string id)
    {
        var g = await _db.GIAYTOPHAPLY.FirstOrDefaultAsync(x => x.MaGiayTo == id);
        if (g is null) return NotFound(ApiResponse<bool>.Fail("Not found"));
        _db.GIAYTOPHAPLY.Remove(g);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Đã xóa"));
    }

    /// <summary>Upload file giấy tờ (multipart/form-data). Lưu vào wwwroot/uploads/giayto.</summary>
    [HttpPost("upload")]
    [RequestSizeLimit(25_000_000)]
    public async Task<ActionResult<ApiResponse<object>>> Upload(IFormFile file,
        [FromForm] string tenGiayTo,
        [FromForm] string loaiGiayTo,
        [FromForm] string? maYeuCauGuiTre = null,
        [FromForm] string? maYeuCauNhan = null)
    {
        if (file is null || file.Length == 0)
            return BadRequest(ApiResponse<object>.Fail("File rỗng"));

        var subFolder = !string.IsNullOrEmpty(maYeuCauGuiTre) ? maYeuCauGuiTre :
                        !string.IsNullOrEmpty(maYeuCauNhan) ? maYeuCauNhan : "misc";

        var root = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var folder = Path.Combine(root, "uploads", "giayto", subFolder.ToLowerInvariant());
        Directory.CreateDirectory(folder);

        var fileName = $"{Guid.NewGuid():N}_{Path.GetFileName(file.FileName)}";
        var filePath = Path.Combine(folder, fileName);
        await using (var fs = System.IO.File.Create(filePath)) await file.CopyToAsync(fs);

        var relPath = $"/uploads/giayto/{subFolder.ToLowerInvariant()}/{fileName}";
        var g = new GiayToPhapLy
        {
            MaGiayTo = await _code.NextGiayToAsync(),
            TenGiayTo = tenGiayTo,
            LoaiGiayTo = loaiGiayTo,
            DuongDanFile = relPath,
            TrangThai = "Chờ xác minh",
            MaYeuCauGuiTre = string.IsNullOrEmpty(maYeuCauGuiTre) ? null : maYeuCauGuiTre,
            MaYeuCauNhan = string.IsNullOrEmpty(maYeuCauNhan) ? null : maYeuCauNhan,
            NgayCapNhat = DateTime.Now
        };
        _db.GIAYTOPHAPLY.Add(g);
        await _db.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { g.MaGiayTo, url = relPath }, "Đã upload"));
    }
}
