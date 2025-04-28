using System.Net.Http.Json;

namespace Tests.E2E.Api;

public class AuthTest 
{
    public static readonly string ApiUrl = Environment.GetEnvironmentVariable("API_URL") ?? throw new InvalidOperationException("BASE_URL envvar is not set. It is needed to run the tests.");
    public static readonly string ReportsDirectory = Environment.GetEnvironmentVariable("REPORT_DIR") ?? "reports";

    public static async Task<string> GetAccessTokenAsync()
    {
        using var httpClient = new HttpClient();

        var loginRequest = new
        {
            Email = "admin@admin.com",
            Password = "Acide2025/1"
        };

        var response = await httpClient.PostAsJsonAsync($"{ApiUrl}/api/auth/login", loginRequest);
        response.EnsureSuccessStatusCode();

        var loginResponse = await response.Content.ReadFromJsonAsync<LoginResponse>();
        if (loginResponse == null || string.IsNullOrEmpty(loginResponse.AccessToken))
            throw new InvalidOperationException("Failed to retrieve access token.");

        return loginResponse.AccessToken;
    }
}

public class LoginResponse
{
    public required string AccessToken { get; set; }
    public required string RefreshToken { get; set; }
    public int AccessExpiresIn { get; set; }
    public int RefreshExpiresIn { get; set; }
}