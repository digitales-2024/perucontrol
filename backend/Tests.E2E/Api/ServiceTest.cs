using System.Net;
using System.Net.Http.Json;
using PeruControl.Model;

namespace Tests.E2E.Api;

[TestClass]
public class ServiceTest
{
    private static readonly string ApiUrl = Environment.GetEnvironmentVariable("API_URL") ?? throw new InvalidOperationException("BASE_URL envvar is not set. It is needed to run the tests.");

    // Reusable helper to get all services
    public static async Task<List<Service>> GetAllServicesAsync()
    {
        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var response = await httpClient.GetAsync($"{ApiUrl}/api/service");
        response.EnsureSuccessStatusCode();

        var services = await response.Content.ReadFromJsonAsync<List<Service>>();
        if (services == null)
            throw new InvalidOperationException("Services list should not be null");
        return services;
    }

    [TestMethod]
    public async Task GetAllServices_ShouldReturnSeededServices()
    {
        var services = await GetAllServicesAsync();
        Assert.AreEqual(5, services.Count, "There should be exactly 5 services");

        var expectedNames = new[]
        {
            "Fumigación",
            "Desinfección",
            "Desinsectación",
            "Desratización",
            "Limpieza de tanque"
        };

        foreach (var name in expectedNames)
        {
            Assert.IsTrue(services.Any(s => s.Name == name), $"Service '{name}' should exist");
        }
    }
}