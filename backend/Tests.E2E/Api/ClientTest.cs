using System.Net;
using System.Net.Http.Json;
using PeruControl.Model;

namespace Tests.E2E.Api;

[TestClass]
public class ClientTest
{
    private static readonly string ApiUrl = Environment.GetEnvironmentVariable("API_URL") ?? throw new InvalidOperationException("BASE_URL envvar is not set. It is needed to run the tests.");

    // Helper method to create a client and return the created Client object (with Id)
    public static async Task<Client> CreateClientAsync()
    {
        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var clientDto = new ClientCreateDTO
        {
            TypeDocument = "RUC",
            TypeDocumentValue = Guid.NewGuid().ToString("N")[..11],
            RazonSocial = "Test Company S.A.C.",
            BusinessType = "Servicios",
            Name = "Test Company",
            FiscalAddress = "Av. Test 123",
            Email = $"test{Guid.NewGuid():N}@mail.com",
            PhoneNumber = "999999999",
            ContactName = "Test Contact",
            ClientLocations =
            [
                new() { Address = "Sucursal 1" }
            ]
        };

        var response = await httpClient.PostAsJsonAsync($"{ApiUrl}/api/client", clientDto);
        response.EnsureSuccessStatusCode();

        var createdClient = await response.Content.ReadFromJsonAsync<Client>() ?? throw new InvalidOperationException("Created client should not be null");
        return createdClient;
    }

    [TestMethod]
    public async Task CreateClient_ShouldReturnCreated()
    {
        var createdClient = await CreateClientAsync();

        Assert.IsNotNull(createdClient, "Created client should not be null");
        Assert.IsFalse(createdClient.Id == Guid.Empty, "Client Id should not be empty");
        Assert.AreEqual("Test Company", createdClient.Name, "Client name should match");
    }
}