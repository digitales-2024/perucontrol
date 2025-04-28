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
        var accessToken = await AuthTest.GetAccessTokenAsync();

        Assert.IsFalse(string.IsNullOrEmpty(accessToken), "AccessToken should not be empty");
    }
}
