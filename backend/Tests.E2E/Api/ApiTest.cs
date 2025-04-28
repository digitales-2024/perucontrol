using System.Net;
using System.Net.Http.Json;

namespace Tests.E2E.Api;

[TestClass]
public sealed class ApiTest1
{
    public readonly string ApiUrl = Environment.GetEnvironmentVariable("API_URL") ?? throw new InvalidOperationException("BASE_URL envvar is not set. It is needed to run the tests.");
    public static readonly string ReportsDirectory = Environment.GetEnvironmentVariable("REPORT_DIR") ?? "reports";

    [TestMethod]
    public async Task TestLogin()
    {
        using var httpClient = new HttpClient();

        var loginRequest = new
        {
            Email = "admin@admin.com",
            Password = "Acide2025/1"
        };

        var response = await httpClient.PostAsJsonAsync($"{ApiUrl}/api/auth/login", loginRequest);

        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode, "Login should return 200 OK");

        var loginResponse = await response.Content.ReadFromJsonAsync<LoginResponse>();
        Assert.IsNotNull(loginResponse, "Login response should not be null");
        Assert.IsFalse(string.IsNullOrEmpty(loginResponse!.AccessToken), "AccessToken should not be empty");
        Assert.IsFalse(string.IsNullOrEmpty(loginResponse.RefreshToken), "RefreshToken should not be empty");
        Assert.IsTrue(loginResponse.AccessExpiresIn > 0, "AccessExpiresIn should be positive");
        Assert.IsTrue(loginResponse.RefreshExpiresIn > 0, "RefreshExpiresIn should be positive");
    }
}

    public class LoginResponse
    {
        public required string AccessToken { get; set; }
        public required string RefreshToken { get; set; }
        public int AccessExpiresIn { get; set; }
        public int RefreshExpiresIn { get; set; }
    }