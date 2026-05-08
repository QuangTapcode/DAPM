namespace QLTTBTXH.API.DTOs.Common;

/// <summary>Standard envelope returned by most endpoints (mirrors FE expectations).</summary>
public class ApiResponse<T>
{
    public bool Success { get; set; } = true;
    public string? Message { get; set; }
    public T? Data { get; set; }

    public static ApiResponse<T> Ok(T data, string? msg = null) =>
        new() { Success = true, Data = data, Message = msg };

    public static ApiResponse<T> Fail(string msg) =>
        new() { Success = false, Message = msg };
}

public class PagedResult<T>
{
    public IEnumerable<T> Items { get; set; } = Array.Empty<T>();
    public int Total { get; set; }
    public int Page { get; set; }
    public int Limit { get; set; }
    public int TotalPages { get; set; }
}

public class QueryParams
{
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 10;
    public string? Search { get; set; }
    public string? Status { get; set; }
    public string? SenderId { get; set; }
    public string? AdopterId { get; set; }
    public string? Role { get; set; }
}
