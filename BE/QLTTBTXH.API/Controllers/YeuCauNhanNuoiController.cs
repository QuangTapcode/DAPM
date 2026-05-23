using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLTTBTXH.API.Data;
using QLTTBTXH.API.DTOs.Common;
using QLTTBTXH.API.DTOs.Tre;
using QLTTBTXH.API.DTOs.YeuCauGuiTre;
using QLTTBTXH.API.DTOs.YeuCauNhanNuoi;
using QLTTBTXH.API.Models.Entities;
using QLTTBTXH.API.Services;
using System.Security.Claims;

namespace QLTTBTXH.API.Controllers;

[ApiController]
[Route("api/adoptions")]
[Authorize]
public class YeuCauNhanNuoiController : ControllerBase
{
    private readonly QuanLyTTBTContext _db;
    private readonly ICodeGenerator _code;
    private readonly IWebHostEnvironment _env;

    private static readonly HashSet<string> AllowedFileExtensions = new(
        new[] { ".pdf", ".jpg", ".jpeg", ".png" },
        StringComparer.OrdinalIgnoreCase
    );

    public YeuCauNhanNuoiController(
        QuanLyTTBTContext db,
        ICodeGenerator code,
        IWebHostEnvironment env)
    {
        _db = db;
        _code = code;
        _env = env;
    }

    private static YeuCauNhanNuoiDto Map(YeuCauNhanNuoi y, List<string> giayTos, int soGiayTo = 0) => new()
    {
        MaYeuCauNhan = y.MaYeuCauNhan,
        MaNguoiNhan = y.MaNguoiNhan,

        TenNguoiNhan = y.NguoiNhan?.HoTen,
        SDTNguoiNhan = y.NguoiNhan?.SDT,
        NgaySinhNguoiNhan = y.NguoiNhan?.NgaySinh,

        ThuNhapHangThang = y.ThuNhapHangThang,
        SoConDangNuoi = y.SoConDangNuoi,
        TinhTrangHonNhan = y.TinhTrangHonNhan,
        LoaiNoiO = y.LoaiNoiO,
        SucKhoeDatYeuCau = y.SucKhoeDatYeuCau,
        QuanHeVoiTre = y.QuanHeVoiTre,

        LyDoNhanNuoi = y.LyDoNhanNuoi,
        MongMuonTuoiToiDa = y.MongMuonTuoiToiDa,
        MongMuonGioiTinh = y.MongMuonGioiTinh,

        HopLeSoBo = y.HopLeSoBo,
        DiemUuTien = y.DiemUuTien,
        LyDoTuChoiSoBo = y.LyDoTuChoiSoBo,
        TrangThai = y.TrangThai,
        NgayTao = y.NgayTao,
        GhiChu = y.GhiChu,

        GiayTos = giayTos,
        SoGiayTo = soGiayTo,
        SoGiayToHopLe = giayTos.Count
    };

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<YeuCauNhanNuoiDto>>>> GetAll(
        [FromQuery] QueryParams q)
    {
        var query = _db.YEUCAUNHANNUOI
            .Include(y => y.NguoiNhan)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(q.AdopterId))
        {
            query = query.Where(y => y.MaNguoiNhan == q.AdopterId);
        }

        if (!string.IsNullOrWhiteSpace(q.Status))
        {
            query = query.Where(y => y.TrangThai == q.Status);
        }

        var total = await query.CountAsync();

        var entities = await query
    .OrderByDescending(y => y.DiemUuTien)
    .ThenBy(y => y.NgayTao)
    .Skip((q.Page - 1) * q.Limit)
    .Take(q.Limit)
    .ToListAsync();

        var ids = entities
            .Select(y => y.MaYeuCauNhan)
            .ToList();

        var giayToLookup = (await _db.GIAYTOPHAPLY
                .Where(g => g.MaYeuCauNhan != null && ids.Contains(g.MaYeuCauNhan))
                .ToListAsync())
            .GroupBy(g => g.MaYeuCauNhan!)
            .ToDictionary(
                g => g.Key,
                g => g.Select(x => x.MaGiayTo).ToList()
            );

        var totalRequiredDocs = await _db.LOAIGIAYTOBATBUOC.CountAsync(x => x.ApDungYCNN && x.BatBuoc);

        var items = entities
            .Select(e => Map(
                e,
                giayToLookup.TryGetValue(e.MaYeuCauNhan, out var gs)
                    ? gs
                    : new List<string>(),
                totalRequiredDocs
            ))
            .ToList();

        return Ok(ApiResponse<PagedResult<YeuCauNhanNuoiDto>>.Ok(new PagedResult<YeuCauNhanNuoiDto>
        {
            Items = items,
            Total = total,
            Page = q.Page,
            Limit = q.Limit,
            TotalPages = (int)Math.Ceiling(total / (double)q.Limit)
        }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<YeuCauNhanNuoiDto>>> GetById(string id)
    {
        var y = await _db.YEUCAUNHANNUOI
            .Include(y => y.NguoiNhan)
            .FirstOrDefaultAsync(y => y.MaYeuCauNhan == id);

        if (y is null)
        {
            return NotFound(ApiResponse<YeuCauNhanNuoiDto>.Fail("Không tìm thấy yêu cầu nhận nuôi"));
        }

        var gs = await _db.GIAYTOPHAPLY
            .Where(g => g.MaYeuCauNhan == id)
            .Select(g => g.MaGiayTo)
            .ToListAsync();

        return Ok(ApiResponse<YeuCauNhanNuoiDto>.Ok(Map(y, gs)));
    }

    /// <summary>
    /// Người dùng gửi yêu cầu nhận nuôi hoàn chỉnh: nội dung + giấy tờ.
    /// Hệ thống xét nội dung sơ bộ trước. Nếu đạt thì lưu giấy tờ ở trạng thái Chờ xác minh.
    /// </summary>
    [HttpPost("submit")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(50_000_000)]
    public async Task<ActionResult<ApiResponse<YeuCauNhanNuoiDto>>> Submit(
        [FromForm] CreateYeuCauNhanNuoiSubmitDto dto)
    {
        var maNguoiNhan = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(maNguoiNhan))
        {
            return BadRequest(ApiResponse<YeuCauNhanNuoiDto>.Fail("Không xác định người nhận"));
        }

        if (dto.Files.Count != dto.MaLoaiGiayTos.Count)
        {
            return BadRequest(ApiResponse<YeuCauNhanNuoiDto>.Fail(
                "Số lượng file và mã loại giấy tờ không khớp"
            ));
        }

        var y = new YeuCauNhanNuoi
        {
            MaYeuCauNhan = await _code.NextYeuCauNhanNuoiAsync(),
            MaNguoiNhan = maNguoiNhan,
            ThuNhapHangThang = dto.ThuNhapHangThang,
            SoConDangNuoi = dto.SoConDangNuoi,
            TinhTrangHonNhan = dto.TinhTrangHonNhan,
            LoaiNoiO = dto.LoaiNoiO,
            SucKhoeDatYeuCau = dto.SucKhoeDatYeuCau,
            QuanHeVoiTre = dto.QuanHeVoiTre,
            LyDoNhanNuoi = dto.LyDoNhanNuoi,
            MongMuonTuoiToiDa = dto.MongMuonTuoiToiDa,
            MongMuonGioiTinh = dto.MongMuonGioiTinh,
            GhiChu = dto.GhiChu,
            NgayTao = DateTime.Now
        };

        AssessContentOnly(y);

        if (y.TrangThai == "Từ chối sơ bộ")
        {
            _db.YEUCAUNHANNUOI.Add(y);
            await _db.SaveChangesAsync();

            return Ok(ApiResponse<YeuCauNhanNuoiDto>.Ok(
                Map(y, new List<string>()),
                "Yêu cầu bị từ chối sơ bộ"
            ));
        }

        var validUploadedItems = dto.Files
            .Select((file, index) => new
            {
                File = file,
                MaLoaiGiayTo = dto.MaLoaiGiayTos[index]?.Trim()
            })
            .Where(x =>
                x.File != null &&
                x.File.Length > 0 &&
                !string.IsNullOrWhiteSpace(x.MaLoaiGiayTo))
            .ToList();

        var uploadedDocTypeCodes = validUploadedItems
            .Select(x => x.MaLoaiGiayTo!)
            .ToList();

        var missingDocs = await GetMissingRequiredDocumentsAsync(y, uploadedDocTypeCodes);

        if (missingDocs.Any())
        {
            return BadRequest(ApiResponse<YeuCauNhanNuoiDto>.Fail(
                "Thiếu giấy tờ bắt buộc: " + string.Join(", ", missingDocs)
            ));
        }

        foreach (var item in validUploadedItems)
        {
            var extension = Path.GetExtension(item.File.FileName);

            if (!AllowedFileExtensions.Contains(extension))
            {
                return BadRequest(ApiResponse<YeuCauNhanNuoiDto>.Fail(
                    $"File {item.File.FileName} không đúng định dạng. Chỉ chấp nhận PDF, JPG, JPEG, PNG."
                ));
            }

            var loaiGiayToTonTai = await _db.LOAIGIAYTOBATBUOC
                .AnyAsync(x => x.MaLoaiGiayTo == item.MaLoaiGiayTo);

            if (!loaiGiayToTonTai)
            {
                return BadRequest(ApiResponse<YeuCauNhanNuoiDto>.Fail(
                    $"Loại giấy tờ không tồn tại: {item.MaLoaiGiayTo}"
                ));
            }
        }

        await using var transaction = await _db.Database.BeginTransactionAsync();

        try
        {
            _db.YEUCAUNHANNUOI.Add(y);
            await _db.SaveChangesAsync();

            var root = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var subFolder = y.MaYeuCauNhan.ToLowerInvariant();
            var folder = Path.Combine(root, "uploads", "giayto", subFolder);

            Directory.CreateDirectory(folder);

            var giayToIds = new List<string>();

            foreach (var item in validUploadedItems)
            {
                var safeFileName = Path.GetFileName(item.File.FileName);
                var fileName = $"{Guid.NewGuid():N}_{safeFileName}";
                var filePath = Path.Combine(folder, fileName);

                await using (var fs = System.IO.File.Create(filePath))
                {
                    await item.File.CopyToAsync(fs);
                }

                var relPath = $"/uploads/giayto/{subFolder}/{fileName}";

                var g = new GiayToPhapLy
                {
                    MaGiayTo = await _code.NextGiayToAsync(),
                    MaLoaiGiayTo = item.MaLoaiGiayTo!,
                    DuongDanFile = relPath,
                    TrangThai = "Chờ xác minh",
                    MaYeuCauNhan = y.MaYeuCauNhan,
                    MaYeuCauGuiTre = null,
                    NgayCapNhat = DateTime.Now
                };

                _db.GIAYTOPHAPLY.Add(g);

                // Lưu ngay từng giấy tờ để lần NextGiayToAsync() tiếp theo không sinh trùng mã
                await _db.SaveChangesAsync();

                giayToIds.Add(g.MaGiayTo);
            }

            await transaction.CommitAsync();

            return Ok(ApiResponse<YeuCauNhanNuoiDto>.Ok(
                Map(y, giayToIds),
                "Đã gửi yêu cầu nhận nuôi"
            ));
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    [HttpPost("{id}/approve")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.NHAN_NUOI + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<bool>>> Approve(string id)
    {
        var y = await _db.YEUCAUNHANNUOI
            .FirstOrDefaultAsync(x => x.MaYeuCauNhan == id);

        if (y is null)
        {
            return NotFound(ApiResponse<bool>.Fail("Không tìm thấy yêu cầu nhận nuôi"));
        }

        y.TrangThai = "Đã duyệt";

        await _db.SaveChangesAsync();

        return Ok(ApiResponse<bool>.Ok(true, "Đã duyệt yêu cầu"));
    }
[HttpPost("{id}/start-matching")]
[Authorize(Roles = Roles.ADMIN + "," + Roles.NHAN_NUOI + "," + Roles.TRUONG_PHONG)]
public async Task<ActionResult<ApiResponse<bool>>> StartMatching(string id)
{
    var y = await _db.YEUCAUNHANNUOI
        .FirstOrDefaultAsync(x => x.MaYeuCauNhan == id);

    if (y is null)
    {
        return NotFound(ApiResponse<bool>.Fail("Không tìm thấy yêu cầu nhận nuôi"));
    }

    if (y.TrangThai == "Ghép trẻ")
    {
        return Ok(ApiResponse<bool>.Ok(true, "Yêu cầu đang ở bước ghép trẻ"));
    }

    if (y.TrangThai != "Đã duyệt")
    {
        return BadRequest(ApiResponse<bool>.Fail(
            "Chỉ yêu cầu đã duyệt giấy tờ mới được chuyển sang ghép trẻ"
        ));
    }

    var giayTos = await _db.GIAYTOPHAPLY
        .Where(g => g.MaYeuCauNhan == id)
        .ToListAsync();

    if (!giayTos.Any())
    {
        return BadRequest(ApiResponse<bool>.Fail(
            "Yêu cầu chưa có giấy tờ để ghép trẻ"
        ));
    }

    var hasInvalidDocument = giayTos.Any(g => g.TrangThai != "Hợp lệ");

    if (hasInvalidDocument)
    {
        return BadRequest(ApiResponse<bool>.Fail(
            "Chỉ được chuyển sang ghép trẻ khi tất cả giấy tờ đã hợp lệ"
        ));
    }

    y.TrangThai = "Ghép trẻ";

    await _db.SaveChangesAsync();

    return Ok(ApiResponse<bool>.Ok(true, "Đã chuyển yêu cầu sang bước ghép trẻ"));
}
    [HttpPost("{id}/reject")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.NHAN_NUOI + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<bool>>> Reject(string id, [FromBody] RejectDto body)
    {
        var y = await _db.YEUCAUNHANNUOI
            .FirstOrDefaultAsync(x => x.MaYeuCauNhan == id);

        if (y is null)
        {
            return NotFound(ApiResponse<bool>.Fail("Không tìm thấy yêu cầu nhận nuôi"));
        }

        y.TrangThai = "Từ chối sơ bộ";
        y.GhiChu = body.Reason ?? body.ReasonReject;

        await _db.SaveChangesAsync();

        return Ok(ApiResponse<bool>.Ok(true, "Đã từ chối yêu cầu"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(string id)
    {
        var y = await _db.YEUCAUNHANNUOI
            .FirstOrDefaultAsync(x => x.MaYeuCauNhan == id);

        if (y is null)
        {
            return NotFound(ApiResponse<bool>.Fail("Không tìm thấy yêu cầu nhận nuôi"));
        }

        _db.YEUCAUNHANNUOI.Remove(y);

        await _db.SaveChangesAsync();

        return Ok(ApiResponse<bool>.Ok(true, "Đã xóa"));
    }

    [HttpGet("{id}/matching-children")]
    public async Task<ActionResult<ApiResponse<List<TreDto>>>> GetMatchingChildren(
        string id,
        [FromQuery] string? childName,
        [FromQuery] DateTime? childBirthDate)
    {
        var y = await _db.YEUCAUNHANNUOI
            .Include(x => x.NguoiNhan)
            .FirstOrDefaultAsync(x => x.MaYeuCauNhan == id);

        if (y is null)
        {
            return NotFound(ApiResponse<List<TreDto>>.Fail("Yêu cầu nhận nuôi không tồn tại"));
        }

        if (y.NguoiNhan == null)
        {
            return BadRequest(ApiResponse<List<TreDto>>.Fail("Không tìm thấy thông tin người nhận nuôi"));
        }

        if (y.NguoiNhan.NgaySinh == null)
        {
            return BadRequest(ApiResponse<List<TreDto>>.Fail("Người nhận nuôi chưa cập nhật ngày sinh"));
        }

        var currentYear = DateTime.Today.Year;
        var adopterAge = currentYear - y.NguoiNhan.NgaySinh.Value.Year;

        var query = _db.TRE
            .Include(t => t.PhuongXa)
            .AsQueryable();

        // Chỉ lấy trẻ "Chờ nhận nuôi" và chưa có hồ sơ nhận nuôi nào đang xử lý
        var activeProfileChildIds = _db.HOSONHANNUOI
            .Where(h => h.TrangThai == "Đang lập" || h.TrangThai == "Chờ duyệt" || h.TrangThai == "Đã duyệt" || h.TrangThai == "Đã hoàn tất")
            .Select(h => h.MaTre);

        query = query.Where(t =>
            t.TrangThai == "Chờ nhận nuôi" &&
            t.NgaySinh != null &&
            !activeProfileChildIds.Contains(t.MaTre));

        query = query.Where(t =>
            (currentYear - t.NgaySinh!.Value.Year) < 16);

        query = query.Where(t =>
            (adopterAge - (currentYear - t.NgaySinh!.Value.Year)) >= 20);

        if (y.MongMuonTuoiToiDa.HasValue)
        {
            query = query.Where(t =>
                (currentYear - t.NgaySinh!.Value.Year) <= y.MongMuonTuoiToiDa.Value);
        }

        if (!string.IsNullOrEmpty(y.MongMuonGioiTinh))
        {
            query = query.Where(t => t.GioiTinh == y.MongMuonGioiTinh);
        }

        if (y.QuanHeVoiTre == "Người thân")
        {
            if (!string.IsNullOrWhiteSpace(childName))
            {
                var keyword = childName.Trim();
                query = query.Where(t => t.HoTen.Contains(keyword));
            }

            if (childBirthDate.HasValue)
            {
                var birthDate = childBirthDate.Value.Date;

                query = query.Where(t =>
                    t.NgaySinh.HasValue &&
                    t.NgaySinh.Value.Date == birthDate);
            }
        }

        var matchedChildren = await query.ToListAsync();

        var dtos = matchedChildren.Select(t => new TreDto
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
        }).ToList();

        return Ok(ApiResponse<List<TreDto>>.Ok(dtos));
    }

    private static void AssessContentOnly(YeuCauNhanNuoi y)
    {
        y.HopLeSoBo = true;
        y.LyDoTuChoiSoBo = "";

        decimal diem = 0;

        if (y.ThuNhapHangThang < 6000000)
        {
            y.HopLeSoBo = false;
            y.LyDoTuChoiSoBo += "- Thu nhập dưới mức yêu cầu tối thiểu 6 triệu. ";
        }

        if (!y.SucKhoeDatYeuCau)
        {
            y.HopLeSoBo = false;
            y.LyDoTuChoiSoBo += "- Không đủ điều kiện sức khỏe. ";
        }

        if (y.SoConDangNuoi > 4)
        {
            y.HopLeSoBo = false;
            y.LyDoTuChoiSoBo += "- Số con đang nuôi vượt quá giới hạn cho phép. ";
        }

        if (y.QuanHeVoiTre == "Người thân")
        {
            diem += 5;
        }

        if (y.ThuNhapHangThang >= 30000000)
        {
            diem += 3;
        }
        else if (y.ThuNhapHangThang >= 15000000)
        {
            diem += 2;
        }
        else if (y.ThuNhapHangThang >= 6000000)
        {
            diem += 1;
        }

        if (y.SoConDangNuoi == 0)
        {
            diem += 2;
        }
        else if (y.SoConDangNuoi <= 2)
        {
            diem += 1;
        }

        y.DiemUuTien = diem;

        if (y.HopLeSoBo)
        {
            y.TrangThai = "Đang xác minh";
            y.LyDoTuChoiSoBo = null;
        }
        else
        {
            y.TrangThai = "Từ chối sơ bộ";
        }
    }

    private async Task<List<string>> GetMissingRequiredDocumentsAsync(
        YeuCauNhanNuoi y,
        List<string> uploadedDocTypeCodes)
    {
        var requiredDocs = await _db.LOAIGIAYTOBATBUOC
            .Where(x => x.ApDungYCNN && x.BatBuoc)
            .ToListAsync();

        if (y.QuanHeVoiTre == "Người thân")
        {
            var relationshipDocs = await _db.LOAIGIAYTOBATBUOC
                .Where(x =>
                    x.ApDungYCNN &&
                    (
                        x.TenLoaiGiayTo.Contains("quan hệ") ||
                        x.TenLoaiGiayTo.Contains("người thân")
                    ))
                .ToListAsync();

            requiredDocs.AddRange(relationshipDocs);
        }

        var uploadedSet = uploadedDocTypeCodes
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim())
            .ToHashSet();

        return requiredDocs
            .GroupBy(x => x.MaLoaiGiayTo)
            .Select(g => g.First())
            .Where(doc => !uploadedSet.Contains(doc.MaLoaiGiayTo.Trim()))
            .Select(doc => doc.TenLoaiGiayTo)
            .ToList();
    }
}