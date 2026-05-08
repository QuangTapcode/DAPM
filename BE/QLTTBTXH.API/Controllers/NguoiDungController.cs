using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLTTBTXH.API.Data;
using QLTTBTXH.API.DTOs.Common;
using QLTTBTXH.API.DTOs.NguoiDung;
using QLTTBTXH.API.Models.Entities;
using QLTTBTXH.API.Services;

namespace QLTTBTXH.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class NguoiDungController : ControllerBase
{
    private readonly QuanLyTTBTContext _db;
    private readonly ICodeGenerator _code;
    private readonly IPasswordService _pwd;

    public NguoiDungController(QuanLyTTBTContext db, ICodeGenerator code, IPasswordService pwd)
    {
        _db = db; _code = code; _pwd = pwd;
    }

    private static NguoiDungDto Map(NguoiDung u, List<string> roles) => new()
    {
        Id = u.MaNguoiDung,
        HoTen = u.HoTen,
        SDT = u.SDT,
        Email = u.Email,
        CCCD = u.CCCD,
        GioiTinh = u.GioiTinh,
        NgaySinh = u.NgaySinh,
        MaXaPhuong = u.MaXaPhuong,
        DiaChiCuThe = u.DiaChiCuThe,
        NgayTao = u.NgayTao,
        TrangThaiTK = u.TrangThaiTK,
        Roles = roles,
        Role = Services.Roles.ToFeKey(roles.FirstOrDefault() ?? "")
    };

    [HttpGet]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<PagedResult<NguoiDungDto>>>> GetAll([FromQuery] QueryParams q)
    {
        var query = _db.NGUOIDUNG.AsQueryable();
        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var s = q.Search.ToLower();
            query = query.Where(u => u.HoTen.ToLower().Contains(s)
                || (u.Email != null && u.Email.ToLower().Contains(s))
                || u.SDT.Contains(s));
        }
        if (!string.IsNullOrWhiteSpace(q.Role))
        {
            // allow FE-key or role-code
            var code = q.Role.ToUpper() switch
            {
                "ADMIN" => Roles.ADMIN,
                "STAFF-RECEPTION" => Roles.TIEP_NHAN,
                "STAFF-ADOPTION" => Roles.NHAN_NUOI,
                "SENDER" => Roles.NGUOI_GUI,
                "ADOPTER" => Roles.NGUOI_NHAN,
                "MANAGER" => Roles.TRUONG_PHONG,
                _ => q.Role
            };
            query = query.Where(u => _db.NGUOIDUNG_VAITRO.Any(r => r.MaNguoiDung == u.MaNguoiDung && r.MaVaiTro == code));
        }

        var total = await query.CountAsync();
        var entities = await query
            .OrderByDescending(u => u.NgayTao)
            .Skip((q.Page - 1) * q.Limit).Take(q.Limit).ToListAsync();
        var ids = entities.Select(e => e.MaNguoiDung).ToList();
        var roleLookup = (await _db.NGUOIDUNG_VAITRO.Where(r => ids.Contains(r.MaNguoiDung)).ToListAsync())
            .GroupBy(r => r.MaNguoiDung).ToDictionary(g => g.Key, g => g.Select(r => r.MaVaiTro).ToList());

        var items = entities.Select(e =>
            Map(e, roleLookup.TryGetValue(e.MaNguoiDung, out var rs) ? rs : new List<string>())).ToList();

        return Ok(ApiResponse<PagedResult<NguoiDungDto>>.Ok(new PagedResult<NguoiDungDto>
        {
            Items = items, Total = total, Page = q.Page, Limit = q.Limit,
            TotalPages = (int)Math.Ceiling(total / (double)q.Limit)
        }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<NguoiDungDto>>> GetById(string id)
    {
        var u = await _db.NGUOIDUNG.FirstOrDefaultAsync(x => x.MaNguoiDung == id);
        if (u is null) return NotFound(ApiResponse<NguoiDungDto>.Fail("User not found"));
        var roles = await _db.NGUOIDUNG_VAITRO.Where(r => r.MaNguoiDung == id).Select(r => r.MaVaiTro).ToListAsync();
        return Ok(ApiResponse<NguoiDungDto>.Ok(Map(u, roles)));
    }

    [HttpPost]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<NguoiDungDto>>> Create([FromBody] CreateNguoiDungDto dto)
    {
        if (await _db.NGUOIDUNG.AnyAsync(u => u.SDT == dto.SDT))
            return BadRequest(ApiResponse<NguoiDungDto>.Fail("SĐT đã tồn tại"));
        if (!string.IsNullOrWhiteSpace(dto.Email) &&
            await _db.NGUOIDUNG.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(ApiResponse<NguoiDungDto>.Fail("Email đã tồn tại"));
        if (!string.IsNullOrWhiteSpace(dto.CCCD) &&
            await _db.NGUOIDUNG.AnyAsync(u => u.CCCD == dto.CCCD))
            return BadRequest(ApiResponse<NguoiDungDto>.Fail("CCCD đã tồn tại"));

        var u = new NguoiDung
        {
            MaNguoiDung = await _code.NextNguoiDungAsync(),
            HoTen = dto.HoTen,
            SDT = dto.SDT,
            MatKhau = _pwd.Hash(dto.Password),
            Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email,
            CCCD = string.IsNullOrWhiteSpace(dto.CCCD) ? null : dto.CCCD,
            GioiTinh = dto.GioiTinh,
            NgaySinh = dto.NgaySinh,
            MaXaPhuong = string.IsNullOrWhiteSpace(dto.MaXaPhuong) ? null : dto.MaXaPhuong,
            DiaChiCuThe = dto.DiaChiCuThe,
            NgayTao = DateTime.Now,
            TrangThaiTK = true
        };
        _db.NGUOIDUNG.Add(u);

        var roles = dto.Roles ?? new List<string> { Roles.NGUOI_GUI, Roles.NGUOI_NHAN };
        foreach (var r in roles.Distinct())
            _db.NGUOIDUNG_VAITRO.Add(new NguoiDungVaiTro { MaNguoiDung = u.MaNguoiDung, MaVaiTro = r });

        await _db.SaveChangesAsync();
        return Ok(ApiResponse<NguoiDungDto>.Ok(Map(u, roles), "Đã tạo người dùng"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<NguoiDungDto>>> Update(string id, [FromBody] UpdateNguoiDungDto dto)
    {
        var u = await _db.NGUOIDUNG.FirstOrDefaultAsync(x => x.MaNguoiDung == id);
        if (u is null) return NotFound(ApiResponse<NguoiDungDto>.Fail("User not found"));

        if (dto.HoTen != null) u.HoTen = dto.HoTen;
        if (dto.SDT != null) u.SDT = dto.SDT;
        if (dto.Email != null) u.Email = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email;
        if (dto.CCCD != null) u.CCCD = string.IsNullOrWhiteSpace(dto.CCCD) ? null : dto.CCCD;
        if (dto.GioiTinh != null) u.GioiTinh = dto.GioiTinh;
        if (dto.NgaySinh.HasValue) u.NgaySinh = dto.NgaySinh;
        if (dto.MaXaPhuong != null) u.MaXaPhuong = string.IsNullOrWhiteSpace(dto.MaXaPhuong) ? null : dto.MaXaPhuong;
        if (dto.DiaChiCuThe != null) u.DiaChiCuThe = dto.DiaChiCuThe;
        if (dto.TrangThaiTK.HasValue) u.TrangThaiTK = dto.TrangThaiTK.Value;

        if (dto.Roles is not null)
        {
            var existing = _db.NGUOIDUNG_VAITRO.Where(r => r.MaNguoiDung == id);
            _db.NGUOIDUNG_VAITRO.RemoveRange(existing);
            foreach (var r in dto.Roles.Distinct())
                _db.NGUOIDUNG_VAITRO.Add(new NguoiDungVaiTro { MaNguoiDung = id, MaVaiTro = r });
        }

        await _db.SaveChangesAsync();
        var roles = await _db.NGUOIDUNG_VAITRO.Where(r => r.MaNguoiDung == id).Select(r => r.MaVaiTro).ToListAsync();
        return Ok(ApiResponse<NguoiDungDto>.Ok(Map(u, roles), "Cập nhật thành công"));
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.TRUONG_PHONG)]
    public async Task<ActionResult<ApiResponse<bool>>> SetStatus(string id, [FromBody] UpdateStatusDto dto)
    {
        var u = await _db.NGUOIDUNG.FirstOrDefaultAsync(x => x.MaNguoiDung == id);
        if (u is null) return NotFound(ApiResponse<bool>.Fail("User not found"));
        u.TrangThaiTK = dto.TrangThaiTK;
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = Roles.ADMIN)]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(string id)
    {
        var u = await _db.NGUOIDUNG.FirstOrDefaultAsync(x => x.MaNguoiDung == id);
        if (u is null) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy tài khoản"));

        // Bước 1: Xóa vai trò trước và commit riêng (không liên quan FK khác)
        var roleRows = await _db.NGUOIDUNG_VAITRO.Where(r => r.MaNguoiDung == id).ToListAsync();
        if (roleRows.Count > 0)
        {
            _db.NGUOIDUNG_VAITRO.RemoveRange(roleRows);
            await _db.SaveChangesAsync();
        }

        // Bước 2: Thử xóa user
        try
        {
            _db.NGUOIDUNG.Remove(u);
            await _db.SaveChangesAsync();
            return Ok(ApiResponse<bool>.Ok(true, "Đã xóa tài khoản"));
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException)
        {
            // User có yêu cầu gửi/nhận nuôi liên kết → không thể xóa cứng, khóa thay thế
            _db.ChangeTracker.Clear();
            u.TrangThaiTK = false;
            _db.NGUOIDUNG.Update(u);
            await _db.SaveChangesAsync();
            return BadRequest(ApiResponse<bool>.Fail(
                "Tài khoản có dữ liệu liên quan (yêu cầu gửi/nhận nuôi), không thể xóa hoàn toàn. Tài khoản đã được khóa thay thế."));
        }
    }
}
