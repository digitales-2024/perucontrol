using System.Net;
using System.Net.Http.Json;
using PeruControl.Controllers; // For ProjectCreateDTO, ProjectStatus, AppointmentCreateDTOThroughProject
using PeruControl.Infrastructure.Model;

namespace Tests.E2E.Api;

[TestClass]
public class ProjectTest
{
    private static readonly string ApiUrl =
        Environment.GetEnvironmentVariable("API_URL")
        ?? throw new InvalidOperationException(
            "API_URL envvar is not set. It is needed to run the tests."
        );

    [TestMethod]
    public async Task CreateProject_ShouldReturnCreated()
    {
        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        // 1. Create a Client
        var client = await ClientTest.CreateClientAsync();
        Assert.IsNotNull(client, "Client should be created");

        // 2. Get an existing Service
        var services = await ServiceTest.GetAllServicesAsync(); // Using ServiceTest as shown in QuotationTest.cs
        Assert.IsNotNull(services, "Service list should not be null");
        Assert.IsTrue(services.Count != 0, "Should have at least one service configured for tests");
        var service = services.First();
        Assert.IsNotNull(service, "Service should be fetched");

        var projectDto = new ProjectCreateDTO
        {
            ClientId = client.Id,
            Address = "Test Project Address 123",
            Area = 100,
            SpacesCount = 5,
            Price = 1500.75m,
            Services = new List<Guid> { service.Id },
            AppointmentCreateDTOs = new List<AppointmentCreateDTOThroughProject>
            {
                new()
                {
                    DueDate = DateTime.UtcNow.AddDays(7),
                    Services = new List<Guid> { service.Id },
                },
            },
            Ambients = ["Living Room", "Kitchen"],
        };

        var response = await httpClient.PostAsJsonAsync($"{ApiUrl}/api/project", projectDto);

        if (response.StatusCode != HttpStatusCode.Created)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            Assert.Fail(
                $"Failed to create project. Status: {response.StatusCode}. Content: {errorContent}"
            );
        }
        Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
    }
}
