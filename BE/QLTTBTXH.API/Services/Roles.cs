namespace QLTTBTXH.API.Services;

/// <summary>Role codes (VAITRO.MaVaiTro) used in [Authorize(Roles = ...)].</summary>
public static class Roles
{
    public const string ADMIN = "ADMI";
    public const string TIEP_NHAN = "QLNT";   // Cán bộ quản lý tiếp nhận trẻ
    public const string NHAN_NUOI = "QLNN";   // Cán bộ quản lý nhận nuôi
    public const string NGUOI_GUI = "NGGT";   // Người gửi trẻ
    public const string NGUOI_NHAN = "NGNN";  // Người nhận nuôi trẻ
    public const string TRUONG_PHONG = "TPQL"; // Trưởng phòng quản lý

    /// <summary>Map role code → FE route key (admin / staff-reception / staff-adoption / sender / adopter / manager).</summary>
    public static string ToFeKey(string roleCode) => roleCode switch
    {
        ADMIN => "admin",
        TIEP_NHAN => "staff-reception",
        NHAN_NUOI => "staff-adoption",
        NGUOI_GUI => "sender",
        NGUOI_NHAN => "adopter",
        TRUONG_PHONG => "manager",
        _ => "guest"
    };
}
