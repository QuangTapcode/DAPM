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
        MaLoaiGiayTo = g.MaLoaiGiayTo,
        TenLoaiGiayTo = g.LoaiGiayToBatBuoc?.TenLoaiGiayTo,
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
        var query = _db.GIAYTOPHAPLY.Include(g => g.LoaiGiayToBatBuoc).AsQueryable();
        if (!string.IsNullOrEmpty(maYeuCauGuiTre)) query = query.Where(g => g.MaYeuCauGuiTre == maYeuCauGuiTre);
        if (!string.IsNullOrEmpty(maYeuCauNhan)) query = query.Where(g => g.MaYeuCauNhan == maYeuCauNhan);
        if (!string.IsNullOrEmpty(status)) query = query.Where(g => g.TrangThai == status);

        var list = (await query.OrderByDescending(g => g.NgayCapNhat).ToListAsync()).Select(Map).ToList();
        return Ok(ApiResponse<List<GiayToDto>>.Ok(list));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<GiayToDto>>> GetById(string id)
    {
        var g = await _db.GIAYTOPHAPLY.Include(x => x.LoaiGiayToBatBuoc).FirstOrDefaultAsync(x => x.MaGiayTo == id);
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
            MaLoaiGiayTo = dto.MaLoaiGiayTo,
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
        var g = await _db.GIAYTOPHAPLY.Include(x => x.LoaiGiayToBatBuoc).FirstOrDefaultAsync(x => x.MaGiayTo == id);
        if (g is null) return NotFound(ApiResponse<GiayToDto>.Fail("Not found"));

        if (dto.MaLoaiGiayTo != null) g.MaLoaiGiayTo = dto.MaLoaiGiayTo;
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

        // If this document belongs to an adoption request, and all documents for
        // that request are now valid, move the request to "Chờ ghép trẻ" when
        // it is currently in "Đang xác minh".
        if (!string.IsNullOrWhiteSpace(g.MaYeuCauNhan))
        {
            var maYeuCau = g.MaYeuCauNhan!;

            var docs = await _db.GIAYTOPHAPLY
                .Where(x => x.MaYeuCauNhan == maYeuCau)
                .ToListAsync();

            if (docs.Count > 0 && docs.All(d => d.TrangThai == "Hợp lệ"))
            {
                var y = await _db.YEUCAUNHANNUOI.FirstOrDefaultAsync(x => x.MaYeuCauNhan == maYeuCau);
                if (y != null && y.TrangThai == "Đang xác minh")
                {
                    y.TrangThai = "Chờ ghép trẻ";
                    await _db.SaveChangesAsync();
                }
            }
        }

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
    /// <summary>Upload file giấy tờ (multipart/form-data). Lưu vào wwwroot/uploads/giayto.</summary>
    [HttpPost("upload")]
    [RequestSizeLimit(25_000_000)]
    public async Task<ActionResult<ApiResponse<object>>> Upload(
        IFormFile file,
        [FromForm] string maLoaiGiayTo,
        [FromForm] string? maYeuCauGuiTre = null,
        [FromForm] string? maYeuCauNhan = null)
    {
        if (file is null || file.Length == 0)
            return BadRequest(ApiResponse<object>.Fail("File rỗng"));

        if (string.IsNullOrWhiteSpace(maLoaiGiayTo))
            return BadRequest(ApiResponse<object>.Fail("Thiếu mã loại giấy tờ"));

        var hasGuiTre = !string.IsNullOrWhiteSpace(maYeuCauGuiTre);
        var hasNhanNuoi = !string.IsNullOrWhiteSpace(maYeuCauNhan);

        if (!hasGuiTre && !hasNhanNuoi)
        {
            return BadRequest(ApiResponse<object>.Fail(
                "Phải gắn giấy tờ với MaYeuCauGuiTre hoặc MaYeuCauNhan"
            ));
        }

        if (hasGuiTre && hasNhanNuoi)
        {
            return BadRequest(ApiResponse<object>.Fail(
                "Một giấy tờ chỉ được gắn với một loại yêu cầu"
            ));
        }

        maLoaiGiayTo = maLoaiGiayTo.Trim();
        maYeuCauGuiTre = hasGuiTre ? maYeuCauGuiTre!.Trim() : null;
        maYeuCauNhan = hasNhanNuoi ? maYeuCauNhan!.Trim() : null;

        var loaiGiayToTonTai = await _db.LOAIGIAYTOBATBUOC
            .AnyAsync(x => x.MaLoaiGiayTo == maLoaiGiayTo);

        if (!loaiGiayToTonTai)
            return BadRequest(ApiResponse<object>.Fail("Loại giấy tờ không tồn tại"));

        if (hasGuiTre)
        {
            var yeuCauGuiTreTonTai = await _db.YEUCAUGUITRE
                .AnyAsync(x => x.MaYeuCauGuiTre == maYeuCauGuiTre);

            if (!yeuCauGuiTreTonTai)
                return BadRequest(ApiResponse<object>.Fail("Yêu cầu gửi trẻ không tồn tại"));
        }

        if (hasNhanNuoi)
        {
            var yeuCauNhanTonTai = await _db.YEUCAUNHANNUOI
                .AnyAsync(x => x.MaYeuCauNhan == maYeuCauNhan);

            if (!yeuCauNhanTonTai)
                return BadRequest(ApiResponse<object>.Fail("Yêu cầu nhận nuôi không tồn tại"));
        }

        var subFolder = hasGuiTre ? maYeuCauGuiTre! : maYeuCauNhan!;

        var root = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var folder = Path.Combine(root, "uploads", "giayto", subFolder.ToLowerInvariant());

        Directory.CreateDirectory(folder);

        var safeFileName = Path.GetFileName(file.FileName);
        var fileName = $"{Guid.NewGuid():N}_{safeFileName}";
        var filePath = Path.Combine(folder, fileName);

        await using (var fs = System.IO.File.Create(filePath))
        {
            await file.CopyToAsync(fs);
        }

        var relPath = $"/uploads/giayto/{subFolder.ToLowerInvariant()}/{fileName}";

        var existingG = hasGuiTre
            ? await _db.GIAYTOPHAPLY.FirstOrDefaultAsync(x => x.MaYeuCauGuiTre == maYeuCauGuiTre && x.MaLoaiGiayTo == maLoaiGiayTo)
            : await _db.GIAYTOPHAPLY.FirstOrDefaultAsync(x => x.MaYeuCauNhan == maYeuCauNhan && x.MaLoaiGiayTo == maLoaiGiayTo);

        GiayToPhapLy g;
        if (existingG != null)
        {
            existingG.DuongDanFile = relPath;
            existingG.TrangThai = "Chờ xác minh";
            existingG.NgayCapNhat = DateTime.Now;
            g = existingG;
        }
        else
        {
            g = new GiayToPhapLy
            {
                MaGiayTo = await _code.NextGiayToAsync(),
                MaLoaiGiayTo = maLoaiGiayTo,
                DuongDanFile = relPath,
                TrangThai = "Chờ xác minh",
                MaYeuCauGuiTre = maYeuCauGuiTre,
                MaYeuCauNhan = maYeuCauNhan,
                NgayCapNhat = DateTime.Now
            };
            _db.GIAYTOPHAPLY.Add(g);
        }

        await _db.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            g.MaGiayTo,
            g.MaLoaiGiayTo,
            g.DuongDanFile,
            g.TrangThai,
            g.MaYeuCauGuiTre,
            g.MaYeuCauNhan,
            g.NgayCapNhat,
            url = relPath
        }, "Đã upload"));
    }
}
