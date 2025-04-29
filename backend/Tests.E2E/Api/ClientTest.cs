using System.Linq;
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

    [TestMethod]
    public async Task PatchClient_ShouldUpdateSimpleFields()
    {
        var createdClient = await CreateClientAsync();
        Assert.IsNotNull(createdClient);

        var clientId = createdClient.Id;
        var patchDto = new
        {
            Name = "Updated Name",
            FiscalAddress = "Updated Address",
            Email = "updated@mail.com",
            PhoneNumber = "888888888"
            // No ClientLocations
        };

        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var patchResponse = await httpClient.PatchAsJsonAsync($"{ApiUrl}/update/{clientId}", patchDto);
        Assert.AreEqual(HttpStatusCode.NoContent, patchResponse.StatusCode, $"Patch failed: {await patchResponse.Content.ReadAsStringAsync()}");

        // Fetch updated client
        var getResponse = await httpClient.GetAsync($"{ApiUrl}/api/client/{clientId}");
        getResponse.EnsureSuccessStatusCode();
        var updatedClient = await getResponse.Content.ReadFromJsonAsync<Client>();
        Assert.IsNotNull(updatedClient);
        Assert.AreEqual("Updated Name", updatedClient.Name);
        Assert.AreEqual("Updated Address", updatedClient.FiscalAddress);
        Assert.AreEqual("updated@mail.com", updatedClient.Email);
        Assert.AreEqual("888888888", updatedClient.PhoneNumber);
    }

    [TestMethod]
    public async Task PatchClientLocations_ShouldAddLocation()
    {
        var createdClient = await CreateClientAsync();
        Assert.IsNotNull(createdClient);

        var clientId = createdClient.Id;
        ClientLocationDTO newLocation = new() { Address = "Sucursal Nueva" };

        var patchDto = new ClientPatchDTO
        {
            ClientLocations = createdClient.ClientLocations
                .Select(l => new ClientLocationDTO { Id = l.Id, Address = l.Address })
                .Concat([newLocation])
                .ToList()
        };

        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var patchResponse = await httpClient.PatchAsJsonAsync($"{ApiUrl}/update/{clientId}", patchDto);
        Assert.AreEqual(HttpStatusCode.NoContent, patchResponse.StatusCode, $"Patch failed: {await patchResponse.Content.ReadAsStringAsync()}");

        // Fetch updated client
        var getResponse = await httpClient.GetAsync($"{ApiUrl}/api/client/{clientId}");
        getResponse.EnsureSuccessStatusCode();
        var updatedClient = await getResponse.Content.ReadFromJsonAsync<Client>();
        Assert.IsNotNull(updatedClient);
        Assert.AreEqual(createdClient.ClientLocations.Count + 1, updatedClient.ClientLocations.Count);
        Assert.IsTrue(updatedClient.ClientLocations.Any(l => l.Address == "Sucursal Nueva"));
    }

    [TestMethod]
    public async Task PatchClientLocations_ShouldEditLocation()
    {
        var createdClient = await CreateClientAsync();
        Assert.IsNotNull(createdClient);

        var clientId = createdClient.Id;
        var originalLocation = createdClient.ClientLocations.First();
        var editedLocation = new { Id = originalLocation.Id, Address = "Sucursal Editada" };

        var patchDto = new
        {
            ClientLocations = createdClient.ClientLocations
                .Select(l => l.Id == originalLocation.Id
                    ? editedLocation
                    : new { Id = l.Id, Address = l.Address })
                .ToList()
        };

        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var patchResponse = await httpClient.PatchAsJsonAsync($"{ApiUrl}/update/{clientId}", patchDto);
        Assert.AreEqual(HttpStatusCode.NoContent, patchResponse.StatusCode, $"Patch failed: {await patchResponse.Content.ReadAsStringAsync()}");

        // Fetch updated client
        var getResponse = await httpClient.GetAsync($"{ApiUrl}/api/client/{clientId}");
        getResponse.EnsureSuccessStatusCode();
        var updatedClient = await getResponse.Content.ReadFromJsonAsync<Client>();
        Assert.IsNotNull(updatedClient);
        Assert.IsTrue(updatedClient.ClientLocations.Any(l => l.Address == "Sucursal Editada"));
    }

    [TestMethod]
    public async Task PatchClientLocations_ShouldRemoveLocation()
    {
        var createdClient = await CreateClientAsync();
        Assert.IsNotNull(createdClient);

        var clientId = createdClient.Id;
        var originalLocations = createdClient.ClientLocations.ToList();
        Assert.IsTrue(originalLocations.Count > 0, "Should have at least one location to remove");

        var patchDto = new
        {
            ClientLocations = originalLocations
                .Skip(1) // Remove the first location
                .Select(l => new { Id = l.Id, Address = l.Address })
                .ToList()
        };

        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var patchResponse = await httpClient.PatchAsJsonAsync($"{ApiUrl}/update/{clientId}", patchDto);
        Assert.AreEqual(HttpStatusCode.NoContent, patchResponse.StatusCode, $"Patch failed: {await patchResponse.Content.ReadAsStringAsync()}");

        // Fetch updated client
        var getResponse = await httpClient.GetAsync($"{ApiUrl}/api/client/{clientId}");
        getResponse.EnsureSuccessStatusCode();
        var updatedClient = await getResponse.Content.ReadFromJsonAsync<Client>();
        Assert.IsNotNull(updatedClient);
        Assert.AreEqual(originalLocations.Count - 1, updatedClient.ClientLocations.Count);
        Assert.IsFalse(updatedClient.ClientLocations.Any(l => l.Id == originalLocations[0].Id));
    }

    [TestMethod]
    public async Task PatchClientLocations_ShouldAddEditRemoveLocations()
    {
        var createdClient = await CreateClientAsync();
        Assert.IsNotNull(createdClient);

        var clientId = createdClient.Id;
        var originalLocations = createdClient.ClientLocations.ToList();
        Assert.IsTrue(originalLocations.Count > 0, "Should have at least one location");

        // Remove the first, edit the second (if exists), add a new one
        var locationsToKeep = originalLocations.Skip(1).ToList();

        var editedLocation = locationsToKeep.Count > 0
            ? new { Id = locationsToKeep[0].Id, Address = "Sucursal Modificada" }
            : null;

        var newLocation = new { Address = "Sucursal Nueva Combinada" };

        var patchLocations = new List<object>();
        if (editedLocation != null)
            patchLocations.Add(editedLocation);
        patchLocations.Add(newLocation);

        var patchDto = new
        {
            ClientLocations = patchLocations
        };

        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var patchResponse = await httpClient.PatchAsJsonAsync($"{ApiUrl}/update/{clientId}", patchDto);
        Assert.AreEqual(HttpStatusCode.NoContent, patchResponse.StatusCode, $"Patch failed: {await patchResponse.Content.ReadAsStringAsync()}");

        // Fetch updated client
        var getResponse = await httpClient.GetAsync($"{ApiUrl}/api/client/{clientId}");
        getResponse.EnsureSuccessStatusCode();
        var updatedClient = await getResponse.Content.ReadFromJsonAsync<Client>();
        Assert.IsNotNull(updatedClient);

        var expectedCount = (editedLocation != null ? 1 : 0) + 1;
        Assert.AreEqual(expectedCount, updatedClient.ClientLocations.Count);

        if (editedLocation != null)
            Assert.IsTrue(updatedClient.ClientLocations.Any(l => l.Address == "Sucursal Modificada"));
        Assert.IsTrue(updatedClient.ClientLocations.Any(l => l.Address == "Sucursal Nueva Combinada"));
    }
}