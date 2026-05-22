using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLTTBTXH.API.Data;
using QLTTBTXH.API.DTOs.Common;
using QLTTBTXH.API.DTOs.DanhMuc;

namespace QLTTBTXH.API.Controllers;

[ApiController]
[Route("api/lookups")]
[AllowAnonymous]
public class DanhMucController : ControllerBase
{
    private readonly QuanLyTTBTContext _db;
    public DanhMucController(QuanLyTTBTContext db) { _db = db; }

    [HttpGet("tinh-tp")]
    public async Task<ActionResult<ApiResponse<List<TinhTpDto>>>> TinhTP()
    {
        var list = await _db.TINH_TP.Select(x => new TinhTpDto { MaTinhTP = x.MaTinhTP, TenTinhTP = x.TenTinhTP })
            .OrderBy(x => x.TenTinhTP).ToListAsync();
        return Ok(ApiResponse<List<TinhTpDto>>.Ok(list));
    }

    [HttpGet("phuong-xa")]
    public async Task<ActionResult<ApiResponse<List<PhuongXaDto>>>> PhuongXa([FromQuery] string? maTinhTP = null)
    {
        var q = _db.PHUONG_XA.Include(p => p.TinhTP).AsQueryable();
        if (!string.IsNullOrEmpty(maTinhTP)) q = q.Where(p => p.MaTinhTP == maTinhTP);
        var list = await q.Select(p => new PhuongXaDto
        {
            MaPhuongXa = p.MaPhuongXa,
            TenPhuongXa = p.TenPhuongXa,
            MaTinhTP = p.MaTinhTP,
            TenTinhTP = p.TinhTP!.TenTinhTP
        }).OrderBy(p => p.TenPhuongXa).ToListAsync();
        return Ok(ApiResponse<List<PhuongXaDto>>.Ok(list));
    }

    [HttpGet("vacxin")]
    public async Task<ActionResult<ApiResponse<List<VacxinDto>>>> Vacxins()
    {
        var list = await _db.VACXIN.Select(v => new VacxinDto
        { MaVacxin = v.MaVacxin, TenVacxin = v.TenVacxin, PhongBenh = v.PhongBenh })
            .OrderBy(x => x.TenVacxin).ToListAsync();
        return Ok(ApiResponse<List<VacxinDto>>.Ok(list));
    }

    [HttpGet("loai-nguoi-gui")]
    public async Task<ActionResult<ApiResponse<List<LoaiNguoiGuiDto>>>> LoaiNguoiGui()
    {
        var list = await _db.LOAINGUOIGUITRE.Select(l => new LoaiNguoiGuiDto
        {
            MaLoaiNguoiGui = l.MaLoaiNguoiGui,
            TenLoaiNguoiGui = l.TenLoaiNguoiGui,
            BatBuocGiayTo = l.BatBuocGiayTo,
            MoTa = l.MoTa
        }).ToListAsync();
        return Ok(ApiResponse<List<LoaiNguoiGuiDto>>.Ok(list));
    }

    [HttpGet("trang-thai-tre")]
    public ActionResult<ApiResponse<List<string>>> TrangThaiTre() =>
        Ok(ApiResponse<List<string>>.Ok(new List<string> {
            "Chờ tiếp nhận", "Đang chăm sóc", "Chờ nhận nuôi", "Đã nhận nuôi", "Đã trả về gia đình"
        }));

    [HttpGet("trang-thai-yeu-cau-gui-tre")]
    public ActionResult<ApiResponse<List<string>>> TrangThaiYCGT() =>
        Ok(ApiResponse<List<string>>.Ok(new List<string> {
            "Chờ xử lý", "Đang xem xét", "Đã tiếp nhận", "Từ chối", "Đã hủy"
        }));

    [HttpGet("trang-thai-yeu-cau-nhan-nuoi")]
    public ActionResult<ApiResponse<List<string>>> TrangThaiYCNN() =>
        Ok(ApiResponse<List<string>>.Ok(new List<string> {
            "Chờ xử lý", "Đang xem xét", "Chờ ghép trẻ", "Đã duyệt", "Từ chối", "Đã hoàn tất"
        }));

    [HttpGet("trang-thai-giay-to")]
    public ActionResult<ApiResponse<List<string>>> TrangThaiGiayTo() =>
        Ok(ApiResponse<List<string>>.Ok(new List<string> {
            "Chờ xác minh", "Hợp lệ", "Không hợp lệ", "Hết hạn", "Cần bổ sung"
        }));

    /// <summary>Danh sách loại giấy tờ bắt buộc áp dụng cho yêu cầu nhận nuôi.</summary>
    [HttpGet("loai-giay-to-bat-buoc-nhan-nuoi")]
    public async Task<IActionResult> GetLoaiGiayToNhanNuoi()
    {
        var data = await _db.LOAIGIAYTOBATBUOC
            .Where(x => x.ApDungYCNN)
            .OrderByDescending(x => x.BatBuoc)
            .ThenBy(x => x.TenLoaiGiayTo)
            .Select(x => new
            {
                x.MaLoaiGiayTo,
                x.TenLoaiGiayTo,
                x.ApDungYCNN,
                x.ApDungYCGT,
                x.BatBuoc,
                x.MoTa
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(data));
    }

    /// <summary>Danh sách loại giấy tờ bắt buộc áp dụng cho yêu cầu gửi trẻ.</summary>
    [HttpGet("loai-giay-to-bat-buoc-gui-tre")]
    public async Task<IActionResult> GetLoaiGiayToGuiTre()
    {
        var data = await _db.LOAIGIAYTOBATBUOC
            .Where(x => x.ApDungYCGT)
            .OrderByDescending(x => x.BatBuoc)
            .ThenBy(x => x.TenLoaiGiayTo)
            .Select(x => new
            {
                x.MaLoaiGiayTo,
                x.TenLoaiGiayTo,
                x.ApDungYCNN,
                x.ApDungYCGT,
                x.BatBuoc,
                x.MoTa
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(data));
    }
}
