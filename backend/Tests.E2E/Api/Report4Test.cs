using System.Net;
using System.Net.Http.Json;
using PeruControl.Controllers;
using PeruControl.Controllers.Reports; // For Report4DTO, UpdateReport4DTO
using PeruControl.Model.Reports; // For ContentSection, TextArea

namespace Tests.E2E.Api;

[TestClass]
public class Report4Test
{
    private static readonly string ApiUrl =
        Environment.GetEnvironmentVariable("API_URL")
        ?? throw new InvalidOperationException(
            "API_URL envvar is not set. It is needed to run the tests."
        );

    private async Task<(
        Guid projectId,
        Guid firstAppointmentId
    )> CreateProjectAndGetFirstAppointmentIdAsync(HttpClient httpClient)
    {
        var client = await ClientTest.CreateClientAsync();
        Assert.IsNotNull(client, "Client should be created for the test.");

        var services = await ServiceTest.GetAllServicesAsync();
        Assert.IsNotNull(services, "Service list should not be null for the test.");
        Assert.IsTrue(
            services.Count != 0,
            "Should have at least one service configured for tests."
        );
        var service = services.First();

        var uniqueAddress = $"Test Project Address {Guid.NewGuid()}";
        var projectDto = new ProjectCreateDTO
        {
            ClientId = client.Id,
            Address = uniqueAddress,
            Area = 200,
            SpacesCount = 3,
            Price = 2500.00m,
            Services = new List<Guid> { service.Id },
            AppointmentCreateDTOs = new List<AppointmentCreateDTOThroughProject>
            {
                new()
                {
                    DueDate = DateTime.UtcNow.AddDays(10),
                    Services = new List<Guid> { service.Id },
                },
            },
            Ambients = ["Office", "Warehouse"],
        };

        var projectResponse = await httpClient.PostAsJsonAsync($"{ApiUrl}/api/project", projectDto);
        if (projectResponse.StatusCode != HttpStatusCode.Created)
        {
            var errorContent = await projectResponse.Content.ReadAsStringAsync();
            Assert.Fail(
                $"Failed to create project for report test. Status: {projectResponse.StatusCode}. Content: {errorContent}"
            );
        }
        Assert.AreEqual(
            HttpStatusCode.Created,
            projectResponse.StatusCode,
            "Project creation failed."
        );

        var getAllProjectsResponse = await httpClient.GetAsync($"{ApiUrl}/api/project");
        getAllProjectsResponse.EnsureSuccessStatusCode();
        var allProjects = await getAllProjectsResponse.Content.ReadFromJsonAsync<
            List<ProjectSummary>
        >();
        Assert.IsNotNull(allProjects, "Could not fetch all projects.");

        var createdProjectSummary = allProjects.FirstOrDefault(p => p.Address == uniqueAddress);
        Assert.IsNotNull(
            createdProjectSummary,
            $"Could not find the created project with address '{uniqueAddress}'."
        );

        var getProjectByIdResponse = await httpClient.GetAsync(
            $"{ApiUrl}/api/project/{createdProjectSummary.Id}/v2"
        );
        getProjectByIdResponse.EnsureSuccessStatusCode();
        var createdProjectDetails =
            await getProjectByIdResponse.Content.ReadFromJsonAsync<ProjectSummarySingle>();
        Assert.IsNotNull(createdProjectDetails, "Could not fetch created project details.");
        Assert.IsNotNull(
            createdProjectDetails.Appointments,
            "Project details should have appointments."
        );
        Assert.IsTrue(
            createdProjectDetails.Appointments.Any(),
            "Project should have at least one appointment."
        );

        var firstAppointment = createdProjectDetails.Appointments.First();
        return (createdProjectDetails.Id, firstAppointment.Id);
    }

    [TestMethod]
    public async Task GetReport4_ShouldReturnDefaultReport_ForNewAppointmentAsync()
    {
        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var (_, firstAppointmentId) = await CreateProjectAndGetFirstAppointmentIdAsync(httpClient);

        var reportResponse = await httpClient.GetAsync(
            $"{ApiUrl}/api/Appointment/{firstAppointmentId}/RatExterminationSubst"
        );

        if (reportResponse.StatusCode != HttpStatusCode.OK)
        {
            var errorContent = await reportResponse.Content.ReadAsStringAsync();
            Assert.Fail(
                $"Failed to get Report4. Status: {reportResponse.StatusCode}. Content: {errorContent}"
            );
        }
        Assert.AreEqual(HttpStatusCode.OK, reportResponse.StatusCode);

        var reportDto = await reportResponse.Content.ReadFromJsonAsync<Report4DTO>();
        Assert.IsNotNull(reportDto, "Report4DTO should not be null.");
        Assert.AreNotEqual(Guid.Empty, reportDto.Id, "Report4 Id should not be empty.");
        Assert.IsNull(reportDto.SigningDate, "SigningDate should be null for a new Report4.");
        Assert.IsNotNull(reportDto.Content, "Content should not be null for a new Report4.");
        Assert.IsFalse(reportDto.Content.Any(), "Content should be empty for a new Report4.");
    }

    [TestMethod]
    public async Task UpdateReport4_ShouldUpdateFieldsAsync()
    {
        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var (_, firstAppointmentId) = await CreateProjectAndGetFirstAppointmentIdAsync(httpClient);

        var testContentString = "This is the updated Report4 text area content.";
        var updateDto = new UpdateReport4DTO
        {
            SigningDate = DateTime.UtcNow.Date,
            Content = new List<ContentSection> { new TextArea { Content = testContentString } },
        };

        var patchResponse = await httpClient.PatchAsJsonAsync(
            $"{ApiUrl}/api/Appointment/{firstAppointmentId}/RatExterminationSubst",
            updateDto
        );

        if (patchResponse.StatusCode != HttpStatusCode.NoContent)
        {
            var errorContent = await patchResponse.Content.ReadAsStringAsync();
            Assert.Fail(
                $"Failed to update Report4. Status: {patchResponse.StatusCode}. Content: {errorContent}"
            );
        }
        Assert.AreEqual(HttpStatusCode.NoContent, patchResponse.StatusCode);

        var getResponse = await httpClient.GetAsync(
            $"{ApiUrl}/api/Appointment/{firstAppointmentId}/RatExterminationSubst"
        );

        if (getResponse.StatusCode != HttpStatusCode.OK)
        {
            var errorContent = await getResponse.Content.ReadAsStringAsync();
            Assert.Fail(
                $"Failed to get Report4 after update. Status: {getResponse.StatusCode}. Content: {errorContent}"
            );
        }
        Assert.AreEqual(HttpStatusCode.OK, getResponse.StatusCode);

        var updatedReportDto = await getResponse.Content.ReadFromJsonAsync<Report4DTO>();
        Assert.IsNotNull(updatedReportDto, "Updated Report4DTO should not be null.");

        Assert.IsNotNull(
            updatedReportDto.SigningDate,
            "Updated SigningDate should not be null for Report4."
        );
        Assert.AreEqual(
            updateDto.SigningDate.Value.Date,
            updatedReportDto.SigningDate.Value.Date,
            "SigningDate for Report4 was not updated correctly."
        );
        Assert.IsNotNull(
            updatedReportDto.Content,
            "Updated Content list should not be null for Report4."
        );
        Assert.IsTrue(
            updatedReportDto.Content.Any(),
            "Updated Content list should not be empty for Report4."
        );

        var firstSection = updatedReportDto.Content.First();
        Assert.IsInstanceOfType(
            firstSection,
            typeof(TextArea),
            "First content section for Report4 should be a TextArea."
        );
        var textAreaSection = (TextArea)firstSection;
        Assert.AreEqual(
            testContentString,
            textAreaSection.Content,
            "TextArea content for Report4 was not updated correctly."
        );
    }
}
