using Microsoft.EntityFrameworkCore;
using QLTTBTXH.API.Data;

namespace QLTTBTXH.API.Services;

/// <summary>
/// Generates the next business code for key entities (ND000001, TRE00001, YCGT0001, ...),
/// mirroring the logic in the fn_TaoMa* SQL functions from the seed script.
/// </summary>
public interface ICodeGenerator
{
    Task<string> NextNguoiDungAsync(CancellationToken ct = default);
    Task<string> NextTreAsync(CancellationToken ct = default);
    Task<string> NextYeuCauGuiTreAsync(CancellationToken ct = default);
    Task<string> NextYeuCauNhanNuoiAsync(CancellationToken ct = default);
    Task<string> NextHoSoTiepNhanAsync(CancellationToken ct = default);
    Task<string> NextHoSoNhanNuoiAsync(CancellationToken ct = default);
    Task<string> NextThongTinTreTamAsync(CancellationToken ct = default);
    Task<string> NextGiayToAsync(CancellationToken ct = default);
    Task<string> NextTheoDoiSucKhoeAsync(CancellationToken ct = default);
    Task<string> NextLichSuTiemChungAsync(CancellationToken ct = default);
}

public class CodeGenerator : ICodeGenerator
{
    private readonly QuanLyTTBTContext _db;
    public CodeGenerator(QuanLyTTBTContext db) { _db = db; }

    private static string Build(string prefix, int number, int digits) =>
        prefix + number.ToString(new string('0', digits));

    public async Task<string> NextNguoiDungAsync(CancellationToken ct = default)
    {
        var max = await _db.NGUOIDUNG
            .Where(x => x.MaNguoiDung.StartsWith("ND"))
            .Select(x => x.MaNguoiDung.Substring(2))
            .ToListAsync(ct);
        var next = (max.Select(s => int.TryParse(s, out var n) ? n : 0).DefaultIfEmpty(0).Max()) + 1;
        return Build("ND", next, 6);
    }

    public async Task<string> NextTreAsync(CancellationToken ct = default)
    {
        var list = await _db.TRE.Select(x => x.MaTre).ToListAsync(ct);
        var next = list.Select(s => s.Length > 3 && int.TryParse(s.Substring(3), out var n) ? n : 0)
                       .DefaultIfEmpty(0).Max() + 1;
        return Build("TRE", next, 5);
    }

    public async Task<string> NextYeuCauGuiTreAsync(CancellationToken ct = default)
    {
        var list = await _db.YEUCAUGUITRE.Select(x => x.MaYeuCauGuiTre).ToListAsync(ct);
        var next = list.Select(s => s.Length > 4 && int.TryParse(s.Substring(4), out var n) ? n : 0)
                       .DefaultIfEmpty(0).Max() + 1;
        return Build("YCGT", next, 4);
    }

    public async Task<string> NextYeuCauNhanNuoiAsync(CancellationToken ct = default)
    {
        var list = await _db.YEUCAUNHANNUOI.Select(x => x.MaYeuCauNhan).ToListAsync(ct);
        var next = list.Select(s => s.Length > 4 && int.TryParse(s.Substring(4), out var n) ? n : 0)
                       .DefaultIfEmpty(0).Max() + 1;
        return Build("YCNN", next, 4);
    }

    public async Task<string> NextHoSoTiepNhanAsync(CancellationToken ct = default)
    {
        var list = await _db.HOSOTIEPNHANTRE.Select(x => x.MaHSTiepNhan).ToListAsync(ct);
        var next = list.Select(s => s.Length > 4 && int.TryParse(s.Substring(4), out var n) ? n : 0)
                       .DefaultIfEmpty(0).Max() + 1;
        return Build("HSTN", next, 4);
    }

    public async Task<string> NextHoSoNhanNuoiAsync(CancellationToken ct = default)
    {
        var list = await _db.HOSONHANNUOI.Select(x => x.MaHSNhanNuoi).ToListAsync(ct);
        var next = list.Select(s => s.Length > 4 && int.TryParse(s.Substring(4), out var n) ? n : 0)
                       .DefaultIfEmpty(0).Max() + 1;
        return Build("HSNN", next, 4);
    }

    public async Task<string> NextThongTinTreTamAsync(CancellationToken ct = default)
    {
        var list = await _db.THONGTINTRETAM.Select(x => x.MaThongTin).ToListAsync(ct);
        var next = list.Select(s => s.Length > 4 && int.TryParse(s.Substring(4), out var n) ? n : 0)
                       .DefaultIfEmpty(0).Max() + 1;
        return Build("TTTT", next, 4);
    }

    public async Task<string> NextGiayToAsync(CancellationToken ct = default)
    {
        var list = await _db.GIAYTOPHAPLY.Select(x => x.MaGiayTo).ToListAsync(ct);
        var next = list.Select(s => s.Length > 2 && int.TryParse(s.Substring(2), out var n) ? n : 0)
                       .DefaultIfEmpty(0).Max() + 1;
        return Build("GT", next, 6);
    }

    public async Task<string> NextTheoDoiSucKhoeAsync(CancellationToken ct = default)
    {
        var list = await _db.THEODOISUCKHOE.Select(x => x.MaTheoDoi).ToListAsync(ct);
        var next = list.Select(s => s.Length > 4 && int.TryParse(s.Substring(4), out var n) ? n : 0)
                       .DefaultIfEmpty(0).Max() + 1;
        return Build("TDSK", next, 4);
    }

    public async Task<string> NextLichSuTiemChungAsync(CancellationToken ct = default)
    {
        var list = await _db.LICHSUTIEMCHUNG.Select(x => x.MaLSTiemChung).ToListAsync(ct);
        var next = list.Select(s => s.Length > 4 && int.TryParse(s.Substring(4), out var n) ? n : 0)
                       .DefaultIfEmpty(0).Max() + 1;
        return Build("LSTC", next, 4);
    }
}
