using Microsoft.EntityFrameworkCore;
using QLTTBTXH.API.Models.Entities;

namespace QLTTBTXH.API.Data;

public class QuanLyTTBTContext : DbContext
{
    public QuanLyTTBTContext(DbContextOptions<QuanLyTTBTContext> options) : base(options) { }

    public DbSet<TinhTP> TINH_TP => Set<TinhTP>();
    public DbSet<PhuongXa> PHUONG_XA => Set<PhuongXa>();
    public DbSet<VaiTro> VAITRO => Set<VaiTro>();
    public DbSet<QuyenHan> QUYENHAN => Set<QuyenHan>();
    public DbSet<QuyenHanVaiTro> QUYENHAN_VAITRO => Set<QuyenHanVaiTro>();
    public DbSet<NguoiDung> NGUOIDUNG => Set<NguoiDung>();
    public DbSet<NguoiDungVaiTro> NGUOIDUNG_VAITRO => Set<NguoiDungVaiTro>();
    public DbSet<LoaiNguoiGuiTre> LOAINGUOIGUITRE => Set<LoaiNguoiGuiTre>();
    public DbSet<Vacxin> VACXIN => Set<Vacxin>();
    public DbSet<Tre> TRE => Set<Tre>();
    public DbSet<LichSuTiemChung> LICHSUTIEMCHUNG => Set<LichSuTiemChung>();
    public DbSet<TheoDoiSucKhoe> THEODOISUCKHOE => Set<TheoDoiSucKhoe>();
    public DbSet<YeuCauNhanNuoi> YEUCAUNHANNUOI => Set<YeuCauNhanNuoi>();
    public DbSet<YeuCauGuiTre> YEUCAUGUITRE => Set<YeuCauGuiTre>();
    public DbSet<GiayToPhapLy> GIAYTOPHAPLY => Set<GiayToPhapLy>();
    public DbSet<ThongTinTreTam> THONGTINTRETAM => Set<ThongTinTreTam>();
    public DbSet<HoSoNhanNuoi> HOSONHANNUOI => Set<HoSoNhanNuoi>();
    public DbSet<HoSoTiepNhanTre> HOSOTIEPNHANTRE => Set<HoSoTiepNhanTre>();
    public DbSet<LichHenGapMat> LICHHENGAPMAT => Set<LichHenGapMat>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        // Composite keys for many-to-many join tables
        b.Entity<QuyenHanVaiTro>()
            .HasKey(x => new { x.MaQuyen, x.MaVaiTro });

        b.Entity<NguoiDungVaiTro>()
            .HasKey(x => new { x.MaNguoiDung, x.MaVaiTro });

        // Unique indexes
        b.Entity<NguoiDung>().HasIndex(x => x.CCCD).IsUnique();
        b.Entity<NguoiDung>().HasIndex(x => x.Email).IsUnique();
        b.Entity<HoSoNhanNuoi>().HasIndex(x => x.MaYeuCauNhan).IsUnique();
        b.Entity<HoSoTiepNhanTre>().HasIndex(x => x.MaYeuCauGuiTre).IsUnique();
        b.Entity<ThongTinTreTam>().HasIndex(x => x.MaYeuCauGuiTre).IsUnique();

        // One-to-one ThongTinTreTam <-> YeuCauGuiTre
        b.Entity<YeuCauGuiTre>()
            .HasOne(x => x.ThongTinTreTam)
            .WithOne(x => x.YeuCauGuiTre)
            .HasForeignKey<ThongTinTreTam>(x => x.MaYeuCauGuiTre);

        // Disable cascade on multi-FK paths
        foreach (var fk in b.Model.GetEntityTypes().SelectMany(t => t.GetForeignKeys()))
            fk.DeleteBehavior = DeleteBehavior.Restrict;
    }
}
