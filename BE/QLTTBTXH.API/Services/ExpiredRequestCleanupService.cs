using Microsoft.EntityFrameworkCore;
using QLTTBTXH.API.Data;

namespace QLTTBTXH.API.Services;

public class ExpiredRequestCleanupService : BackgroundService
{
    private static readonly TimeSpan RunInterval = TimeSpan.FromHours(24);
    private static readonly int ExpiryDays = 7;

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ExpiredRequestCleanupService> _logger;

    public ExpiredRequestCleanupService(IServiceScopeFactory scopeFactory, ILogger<ExpiredRequestCleanupService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Chờ app khởi động xong
        await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CleanupAsync(stoppingToken);
            }
            catch (OperationCanceledException) { break; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi dọn dẹp đơn hết hạn");
            }

            await Task.Delay(RunInterval, stoppingToken);
        }
    }

    private async Task CleanupAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<QuanLyTTBTContext>();

        var cutoff = DateTime.Today.AddDays(-ExpiryDays);
        int total = 0;

        // ── 1. Yêu cầu nhận nuôi đang chờ ──────────────────────────────
        var adoptionPendingStatuses = new[] { "Chờ duyệt", "Đang xử lý", "Chờ xét duyệt" };

        var adoptionIds = await db.YEUCAUNHANNUOI
            .Where(y => adoptionPendingStatuses.Contains(y.TrangThai) && y.NgayTao < cutoff)
            .Select(y => y.MaYeuCauNhan)
            .ToListAsync(ct);

        if (adoptionIds.Count > 0)
        {
            // Xóa theo thứ tự: cháu → con → cha (do DeleteBehavior.Restrict)
            var meetingIds = await db.LICHHENGAPMATNHANNUOI
                .Where(l => adoptionIds.Contains(l.MaYeuCauNhan))
                .Select(l => l.MaLichGap)
                .ToListAsync(ct);

            if (meetingIds.Count > 0)
            {
                await db.CHITIETGAPMAT
                    .Where(c => meetingIds.Contains(c.MaLichGap))
                    .ExecuteDeleteAsync(ct);

                await db.LICHHENGAPMATNHANNUOI
                    .Where(l => meetingIds.Contains(l.MaLichGap))
                    .ExecuteDeleteAsync(ct);
            }

            await db.HOSONHANNUOI
                .Where(h => adoptionIds.Contains(h.MaYeuCauNhan))
                .ExecuteDeleteAsync(ct);

            await db.GIAYTOPHAPLY
                .Where(g => g.MaYeuCauNhan != null && adoptionIds.Contains(g.MaYeuCauNhan!))
                .ExecuteDeleteAsync(ct);

            int deleted = await db.YEUCAUNHANNUOI
                .Where(y => adoptionIds.Contains(y.MaYeuCauNhan))
                .ExecuteDeleteAsync(ct);

            total += deleted;
            _logger.LogInformation("Đã xóa {Count} yêu cầu nhận nuôi hết hạn (>{Days} ngày)", deleted, ExpiryDays);
        }

        // ── 2. Yêu cầu gửi trẻ đang chờ ────────────────────────────────
        var receptionPendingStatuses = new[] { "Chờ xử lý", "Chờ duyệt" };

        var receptionIds = await db.YEUCAUGUITRE
            .Where(y => receptionPendingStatuses.Contains(y.TrangThaiYC) && y.NgayTao < cutoff)
            .Select(y => y.MaYeuCauGuiTre)
            .ToListAsync(ct);

        if (receptionIds.Count > 0)
        {
            await db.HOSOTIEPNHANTRE
                .Where(h => receptionIds.Contains(h.MaYeuCauGuiTre))
                .ExecuteDeleteAsync(ct);

            await db.THONGTINTRETAM
                .Where(t => receptionIds.Contains(t.MaYeuCauGuiTre))
                .ExecuteDeleteAsync(ct);

            await db.GIAYTOPHAPLY
                .Where(g => g.MaYeuCauGuiTre != null && receptionIds.Contains(g.MaYeuCauGuiTre!))
                .ExecuteDeleteAsync(ct);

            int deleted = await db.YEUCAUGUITRE
                .Where(y => receptionIds.Contains(y.MaYeuCauGuiTre))
                .ExecuteDeleteAsync(ct);

            total += deleted;
            _logger.LogInformation("Đã xóa {Count} yêu cầu gửi trẻ hết hạn (>{Days} ngày)", deleted, ExpiryDays);
        }

        // ── 3. Hồ sơ nhận nuôi đang chờ duyệt ──────────────────────────
        // (những hồ sơ còn lại sau bước 1, tức là YCNN chưa bị xóa nhưng hồ sơ vẫn tồn đọng)
        var profilePendingStatuses = new[] { "Đang lập", "Chờ duyệt" };

        int deletedProfiles = await db.HOSONHANNUOI
            .Where(h => profilePendingStatuses.Contains(h.TrangThai) && h.NgayLap < cutoff)
            .ExecuteDeleteAsync(ct);

        total += deletedProfiles;
        if (deletedProfiles > 0)
            _logger.LogInformation("Đã xóa {Count} hồ sơ nhận nuôi hết hạn (>{Days} ngày)", deletedProfiles, ExpiryDays);

        if (total > 0)
            _logger.LogInformation("[Cleanup] Tổng đơn đã xóa: {Total}", total);
        else
            _logger.LogDebug("[Cleanup] Không có đơn hết hạn cần xóa");
    }
}
