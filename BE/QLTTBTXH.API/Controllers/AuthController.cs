using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLTTBTXH.API.Data;
using QLTTBTXH.API.DTOs.Auth;
using QLTTBTXH.API.DTOs.Common;
using QLTTBTXH.API.Models.Entities;
using QLTTBTXH.API.Services;
using System.Security.Claims;

namespace QLTTBTXH.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly QuanLyTTBTContext _db;
    private readonly IJwtService _jwt;
    private readonly IPasswordService _pwd;
    private readonly ICodeGenerator _code;

    public AuthController(QuanLyTTBTContext db, IJwtService jwt, IPasswordService pwd, ICodeGenerator code)
    {
        _db = db; _jwt = jwt; _pwd = pwd; _code = code;
    }

    /// <summary>Đăng nhập bằng email hoặc số điện thoại. Trả về JWT.</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody] LoginDto req)
    {
        var user = await _db.NGUOIDUNG
            .Include(u => u.PhuongXa).ThenInclude(p => p!.TinhTP)
            .FirstOrDefaultAsync(u => u.Email == req.Email || u.SDT == req.Email);

        if (user is null || !_pwd.Verify(req.Password, user.MatKhau))
            return Unauthorized(ApiResponse<AuthResponseDto>.Fail("Email hoặc mật khẩu không đúng"));

        if (!user.TrangThaiTK)
            return StatusCode(403, ApiResponse<AuthResponseDto>.Fail("Tài khoản đã bị khóa"));

        var roles = await _db.NGUOIDUNG_VAITRO
            .Where(r => r.MaNguoiDung == user.MaNguoiDung)
            .Select(r => r.MaVaiTro)
            .ToListAsync();

        var token = _jwt.GenerateToken(user.MaNguoiDung, user.HoTen, user.Email, roles);
        var info = ToInfo(user, roles);

        return Ok(ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto { Token = token, User = info }));
    }

    /// <summary>Đăng ký (giống sp_DangKyNguoiDung_TuSinhMa) — mặc định gán vai trò NGGT và NGNN.</summary>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register([FromBody] RegisterDto req)
    {
        if (await _db.NGUOIDUNG.AnyAsync(u => u.SDT == req.SDT))
            return BadRequest(ApiResponse<AuthResponseDto>.Fail("Số điện thoại đã tồn tại"));

        if (!string.IsNullOrWhiteSpace(req.Email) &&
            await _db.NGUOIDUNG.AnyAsync(u => u.Email == req.Email))
            return BadRequest(ApiResponse<AuthResponseDto>.Fail("Email đã tồn tại"));

        if (!string.IsNullOrWhiteSpace(req.CCCD) &&
            await _db.NGUOIDUNG.AnyAsync(u => u.CCCD == req.CCCD))
            return BadRequest(ApiResponse<AuthResponseDto>.Fail("CCCD đã tồn tại"));

        var user = new NguoiDung
        {
            MaNguoiDung = await _code.NextNguoiDungAsync(),
            SDT = req.SDT,
            MatKhau = _pwd.Hash(req.Password),
            HoTen = req.FullName,
            NgaySinh = req.NgaySinh,
            GioiTinh = req.GioiTinh,
            CCCD = string.IsNullOrWhiteSpace(req.CCCD) ? null : req.CCCD,
            Email = string.IsNullOrWhiteSpace(req.Email) ? null : req.Email,
            MaXaPhuong = string.IsNullOrWhiteSpace(req.MaXaPhuong) ? null : req.MaXaPhuong,
            DiaChiCuThe = req.DiaChiCuThe,
            NgayTao = DateTime.Now,
            TrangThaiTK = true
        };

        _db.NGUOIDUNG.Add(user);
        _db.NGUOIDUNG_VAITRO.Add(new NguoiDungVaiTro { MaNguoiDung = user.MaNguoiDung, MaVaiTro = Roles.NGUOI_GUI });
        _db.NGUOIDUNG_VAITRO.Add(new NguoiDungVaiTro { MaNguoiDung = user.MaNguoiDung, MaVaiTro = Roles.NGUOI_NHAN });
        await _db.SaveChangesAsync();

        var roles = new List<string> { Roles.NGUOI_GUI, Roles.NGUOI_NHAN };
        var token = _jwt.GenerateToken(user.MaNguoiDung, user.HoTen, user.Email, roles);

        return Ok(ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
        {
            Token = token,
            User = ToInfo(user, roles)
        }, "Đăng ký thành công"));
    }

    /// <summary>Lấy thông tin người dùng hiện tại từ JWT.</summary>
    [HttpGet("profile")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<UserInfoDto>>> Profile()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(id))
            return Unauthorized(ApiResponse<UserInfoDto>.Fail("Token không hợp lệ"));

        var user = await _db.NGUOIDUNG
            .Include(u => u.PhuongXa).ThenInclude(p => p!.TinhTP)
            .FirstOrDefaultAsync(u => u.MaNguoiDung == id);
        if (user is null) return NotFound(ApiResponse<UserInfoDto>.Fail("User not found"));

        var roles = await _db.NGUOIDUNG_VAITRO
            .Where(r => r.MaNguoiDung == id).Select(r => r.MaVaiTro).ToListAsync();

        return Ok(ApiResponse<UserInfoDto>.Ok(ToInfo(user, roles)));
    }

    /// <summary>Đổi mật khẩu.</summary>
    [HttpPost("change-password")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<bool>>> ChangePassword([FromBody] ChangePasswordDto req)
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _db.NGUOIDUNG.FirstOrDefaultAsync(u => u.MaNguoiDung == id);
        if (user is null) return Unauthorized(ApiResponse<bool>.Fail("Không xác định người dùng"));

        if (!_pwd.Verify(req.OldPassword, user.MatKhau))
            return BadRequest(ApiResponse<bool>.Fail("Mật khẩu hiện tại không đúng"));

        user.MatKhau = _pwd.Hash(req.NewPassword);
        await _db.SaveChangesAsync();
        return Ok(ApiResponse<bool>.Ok(true, "Đổi mật khẩu thành công"));
    }

    /// <summary>Đăng xuất (stateless – chỉ để FE xóa token).</summary>
    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout() => Ok(ApiResponse<bool>.Ok(true, "Đã đăng xuất"));

    /// <summary>Refresh token đơn giản — reissue token cho user đang hợp lệ.</summary>
    [HttpPost("refresh")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> Refresh()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _db.NGUOIDUNG.FirstOrDefaultAsync(u => u.MaNguoiDung == id);
        if (user is null) return Unauthorized();
        var roles = await _db.NGUOIDUNG_VAITRO
            .Where(r => r.MaNguoiDung == id).Select(r => r.MaVaiTro).ToListAsync();
        var token = _jwt.GenerateToken(user.MaNguoiDung, user.HoTen, user.Email, roles);
        return Ok(ApiResponse<object>.Ok(new { token }));
    }

    private static UserInfoDto ToInfo(NguoiDung u, IEnumerable<string> roles)
    {
        var rolesList = roles.ToList();
        var primary = rolesList.FirstOrDefault() ?? "";
        return new UserInfoDto
        {
            Id = u.MaNguoiDung,
            FullName = u.HoTen,
            Email = u.Email,
            Phone = u.SDT,
            CCCD = u.CCCD,
            GioiTinh = u.GioiTinh,
            NgaySinh = u.NgaySinh,
            MaXaPhuong = u.MaXaPhuong,
            TenPhuongXa = u.PhuongXa?.TenPhuongXa,
            MaTinhTP = u.PhuongXa?.MaTinhTP,
            TenTinhTP = u.PhuongXa?.TinhTP?.TenTinhTP,
            DiaChiCuThe = u.DiaChiCuThe,
            IsActive = u.TrangThaiTK,
            CreatedAt = u.NgayTao,
            Roles = rolesList,
            Role = Services.Roles.ToFeKey(primary)
        };
    }
}
