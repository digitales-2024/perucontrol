using System.Net;
using System.Net.Http.Json;
using PeruControl.Controllers;
using PeruControl.Infrastructure.Model;
using PeruControl.Infrastructure.Model.Reports;

namespace Tests.E2E.Api;

[TestClass]
public class AppointmentTest
{
    private static readonly string ApiUrl =
        Environment.GetEnvironmentVariable("API_URL")
        ?? throw new InvalidOperationException(
            "API_URL envvar is not set. It is needed to run the tests."
        );

    [TestMethod]
    public async Task DuplicateFromPreviousAppointment_ShouldDuplicateAllData()
    {
        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        // 1. Create a Client
        var client = await ClientTest.CreateClientAsync();
        Assert.IsNotNull(client, "Client should be created");

        // 2. Get an existing Service
        var services = await ServiceTest.GetAllServicesAsync();
        Assert.IsNotNull(services, "Service list should not be null");
        Assert.IsTrue(services.Count > 0, "Should have at least one service configured for tests");
        var service = services.First();
        Assert.IsNotNull(service, "Service should be fetched");

        // 3. Create a Project with two appointments
        var projectDto = new ProjectCreateDTO
        {
            ClientId = client.Id,
            Address = "Test Project Address for Duplication",
            Area = 150,
            SpacesCount = 8,
            Price = 2500.50m,
            Services = new List<Guid> { service.Id },
            AppointmentCreateDTOs = new List<AppointmentCreateDTOThroughProject>
            {
                // First appointment (previous)
                new()
                {
                    DueDate = DateTime.UtcNow.AddDays(1),
                    Services = new List<Guid> { service.Id },
                },
                // Second appointment (target for duplication)
                new()
                {
                    DueDate = DateTime.UtcNow.AddDays(8),
                    Services = new List<Guid> { service.Id },
                },
            },
            Ambients = ["Office", "Warehouse", "Kitchen"],
        };

        var projectResponse = await httpClient.PostAsJsonAsync($"{ApiUrl}/api/project", projectDto);
        Assert.AreEqual(
            HttpStatusCode.Created,
            projectResponse.StatusCode,
            "Project should be created"
        );

        // 4. Get the created project to extract appointment IDs
        // First get all projects to find our created project
        var projectsResponse = await httpClient.GetAsync($"{ApiUrl}/api/project");
        Assert.AreEqual(HttpStatusCode.OK, projectsResponse.StatusCode);
        var projects = await projectsResponse.Content.ReadFromJsonAsync<List<ProjectSummary>>();
        Assert.IsNotNull(projects);

        var createdProjectSummary = projects.FirstOrDefault(p =>
            p.Address == "Test Project Address for Duplication"
        );
        Assert.IsNotNull(createdProjectSummary, "Created project should be found");

        // Now get the full project details with appointments
        var projectDetailResponse = await httpClient.GetAsync(
            $"{ApiUrl}/api/project/{createdProjectSummary.Id}"
        );
        Assert.AreEqual(HttpStatusCode.OK, projectDetailResponse.StatusCode);
        var createdProject =
            await projectDetailResponse.Content.ReadFromJsonAsync<ProjectSummarySingle>();
        Assert.IsNotNull(createdProject, "Project details should be retrieved");
        Assert.AreEqual(2, createdProject.Appointments.Count, "Project should have 2 appointments");

        var appointments = createdProject.Appointments.OrderBy(a => a.DueDate).ToList();
        var previousAppointment = appointments[0];
        var targetAppointment = appointments[1];

        // 5. Populate the first appointment with comprehensive test data
        await PopulateAppointmentWithTestData(httpClient, previousAppointment.Id, service.Id);

        // 6. Verify the first appointment has data before duplication
        var firstAppointmentData = await GetAppointmentData(httpClient, previousAppointment.Id);
        var firstRodentRegister = await GetRodentRegisterData(httpClient, previousAppointment.Id);
        var firstCertificate = await GetCertificateData(httpClient, previousAppointment.Id);

        Assert.IsNotNull(firstRodentRegister, "First appointment should have rodent register");
        Assert.IsNotNull(firstCertificate, "First appointment should have certificate");

        // 7. Verify the second appointment is empty before duplication
        var secondRodentRegisterBefore = await GetRodentRegisterData(
            httpClient,
            targetAppointment.Id
        );
        Assert.IsTrue(
            string.IsNullOrEmpty(secondRodentRegisterBefore?.Incidents),
            "Second appointment should have empty rodent register before duplication"
        );

        // 8. Call the duplication endpoint
        var duplicationResponse = await httpClient.PostAsync(
            $"{ApiUrl}/api/appointment/{targetAppointment.Id}/duplicate-from-previous",
            null
        );

        if (duplicationResponse.StatusCode != HttpStatusCode.OK)
        {
            var errorContent = await duplicationResponse.Content.ReadAsStringAsync();
            Assert.Fail(
                $"Duplication failed. Status: {duplicationResponse.StatusCode}. Content: {errorContent}"
            );
        }

        Assert.AreEqual(
            HttpStatusCode.OK,
            duplicationResponse.StatusCode,
            "Duplication should succeed"
        );

        // 9. Verify the duplication response message
        var duplicationResult = await duplicationResponse.Content.ReadFromJsonAsync<dynamic>();
        Assert.IsNotNull(duplicationResult, "Duplication result should not be null");

        // 10. Get the second appointment data after duplication
        var secondAppointmentDataAfter = await GetAppointmentData(httpClient, targetAppointment.Id);
        var operationSheetAfter = await GetOperationSheetData(httpClient, createdProject.Id);
        var secondRodentRegisterAfter = await GetRodentRegisterData(
            httpClient,
            targetAppointment.Id
        );
        var secondCertificateAfter = await GetCertificateData(httpClient, targetAppointment.Id);

        // 11. Validate that all data was properly duplicated
        ValidateDuplicatedData(
            firstAppointmentData,
            secondAppointmentDataAfter,
            operationSheetAfter,
            firstRodentRegister,
            secondRodentRegisterAfter,
            firstCertificate,
            secondCertificateAfter
        );
    }

    [TestMethod]
    public async Task DuplicateFromPreviousAppointment_WithNoPreviousAppointment_ShouldReturn404()
    {
        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        // 1. Create a Client
        var client = await ClientTest.CreateClientAsync();
        Assert.IsNotNull(client, "Client should be created");

        // 2. Get an existing Service
        var services = await ServiceTest.GetAllServicesAsync();
        Assert.IsNotNull(services, "Service list should not be null");
        Assert.IsTrue(services.Count > 0, "Should have at least one service configured for tests");
        var service = services.First();

        // 3. Create a Project with only one appointment
        var projectDto = new ProjectCreateDTO
        {
            ClientId = client.Id,
            Address = "Test Project Single Appointment",
            Area = 100,
            SpacesCount = 3,
            Price = 1000.00m,
            Services = new List<Guid> { service.Id },
            AppointmentCreateDTOs = new List<AppointmentCreateDTOThroughProject>
            {
                new()
                {
                    DueDate = DateTime.UtcNow.AddDays(5),
                    Services = new List<Guid> { service.Id },
                },
            },
            Ambients = ["Single Room"],
        };

        var projectResponse = await httpClient.PostAsJsonAsync($"{ApiUrl}/api/project", projectDto);
        Assert.AreEqual(HttpStatusCode.Created, projectResponse.StatusCode);

        // 4. Get the appointment ID
        var projectsResponse = await httpClient.GetAsync($"{ApiUrl}/api/project");
        var projects = await projectsResponse.Content.ReadFromJsonAsync<List<ProjectSummary>>();
        Assert.IsNotNull(projects);
        var createdProjectSummary = projects.FirstOrDefault(p =>
            p.Address == "Test Project Single Appointment"
        );
        Assert.IsNotNull(createdProjectSummary);

        // Get full project details
        var projectDetailResponse = await httpClient.GetAsync(
            $"{ApiUrl}/api/project/{createdProjectSummary.Id}"
        );
        Assert.AreEqual(HttpStatusCode.OK, projectDetailResponse.StatusCode);
        var createdProject =
            await projectDetailResponse.Content.ReadFromJsonAsync<ProjectSummarySingle>();
        Assert.IsNotNull(createdProject);
        Assert.AreEqual(1, createdProject.Appointments.Count, "Project should have 1 appointment");
        var appointment = createdProject.Appointments.First();

        // 5. Try to duplicate from previous (should fail)
        var duplicationResponse = await httpClient.PostAsync(
            $"{ApiUrl}/api/appointment/{appointment.Id}/duplicate-from-previous",
            null
        );

        Assert.AreEqual(
            HttpStatusCode.NotFound,
            duplicationResponse.StatusCode,
            "Should return 404 when no previous appointment exists"
        );
    }

    [TestMethod]
    public async Task DuplicateFromPreviousAppointment_WithInvalidAppointmentId_ShouldReturn404()
    {
        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var invalidId = Guid.NewGuid();

        var duplicationResponse = await httpClient.PostAsync(
            $"{ApiUrl}/api/appointment/{invalidId}/duplicate-from-previous",
            null
        );

        Assert.AreEqual(
            HttpStatusCode.NotFound,
            duplicationResponse.StatusCode,
            "Should return 404 for invalid appointment ID"
        );
    }

    private async Task PopulateAppointmentWithTestData(
        HttpClient httpClient,
        Guid appointmentId,
        Guid serviceId
    )
    {
        // Populate Operation Sheet
        var operationSheetData = new OperationSheetPatchDTO
        {
            TreatedAreas = "Test Kitchen, Test Bathroom, Test Living Room",
            Insects = "Test Cockroaches, Test Ants",
            Rodents = "Test Mice, Test Rats",
            OtherPlagues = "Test Spiders",
            AspersionManual = true,
            AspercionMotor = false,
            NebulizacionFrio = true,
            NebulizacionCaliente = false,
            ColocacionCebosCebaderos = "Test Bait Stations",
            NumeroCeboTotal = "25",
            NumeroCeboRepuestos = "5",
            NroPlanchasPegantes = "10",
            NroJaulasTomahawk = "3",
            Insecticide = "Test Insecticide Brand",
            InsecticideAmount = "500ml",
            Insecticide2 = "Test Insecticide 2",
            InsecticideAmount2 = "250ml",
            Rodenticide = "Test Rodenticide",
            RodenticideAmount = "1kg",
            Desinfectant = "Test Disinfectant",
            DesinfectantAmount = "2L",
            OtherProducts = "Test Other Products",
            OtherProductsAmount = "Various",
            DegreeInsectInfectivity = InfestationDegree.Moderate,
            DegreeRodentInfectivity = InfestationDegree.Low,
            Staff1 = "Test Staff 1",
            Staff2 = "Test Staff 2",
            Staff3 = "Test Staff 3",
            Staff4 = "Test Staff 4",
            Observations = "Test observations for the operation",
            Recommendations = "Test recommendations for future treatments",
        };

        var operationSheetResponse = await httpClient.PatchAsJsonAsync(
            $"{ApiUrl}/api/appointment/{appointmentId}/operation-sheet",
            operationSheetData
        );
        Assert.AreEqual(
            HttpStatusCode.OK,
            operationSheetResponse.StatusCode,
            "Operation sheet should be updated"
        );

        // Populate Rodent Register
        var rodentRegisterData = new RodentRegisterUpdateDTO
        {
            ServiceDate = DateTime.UtcNow.Date,
            Incidents = "Test incidents found during inspection",
            CorrectiveMeasures = "Test corrective measures implemented",
            RodentAreas = new List<RodentAreaUpdateDTO>
            {
                new()
                {
                    Name = "Test Kitchen Area",
                    CebaderoTrampa = 5,
                    Frequency = QuotationFrequency.Monthly,
                    RodentConsumption = RodentConsumption.Partial,
                    RodentResult = RodentResult.Active,
                    RodentMaterials = RodentMaterials.RodenticideOrBait,
                    ProductName = "Test Rodent Product",
                    ProductDose = "50g per station",
                },
                new()
                {
                    Name = "Test Storage Area",
                    CebaderoTrampa = 3,
                    Frequency = QuotationFrequency.Quarterly,
                    RodentConsumption = RodentConsumption.Total,
                    RodentResult = RodentResult.Inactive,
                    RodentMaterials = RodentMaterials.StickyTrap,
                    ProductName = "Test Sticky Trap",
                    ProductDose = "1 trap per 10m²",
                },
            },
        };

        var rodentRegisterResponse = await httpClient.PatchAsJsonAsync(
            $"{ApiUrl}/api/appointment/{appointmentId}/rodent",
            rodentRegisterData
        );
        Assert.AreEqual(
            HttpStatusCode.OK,
            rodentRegisterResponse.StatusCode,
            "Rodent register should be updated"
        );

        // Populate Certificate
        var certificateData = new AppointmentCertificatePatchDTO
        {
            ExpirationDate = DateTime.UtcNow.AddMonths(6),
        };

        var certificateResponse = await httpClient.PatchAsJsonAsync(
            $"{ApiUrl}/api/appointment/{appointmentId}/certificate",
            certificateData
        );
        Assert.AreEqual(
            HttpStatusCode.OK,
            certificateResponse.StatusCode,
            "Certificate should be updated"
        );
    }

    private async Task<AppointmentGetOutDTO> GetAppointmentData(
        HttpClient httpClient,
        Guid appointmentId
    )
    {
        var response = await httpClient.GetAsync($"{ApiUrl}/api/appointment/{appointmentId}");
        Assert.AreEqual(
            HttpStatusCode.OK,
            response.StatusCode,
            $"Should be able to get appointment {appointmentId}"
        );

        var appointmentData = await response.Content.ReadFromJsonAsync<AppointmentGetOutDTO>();
        Assert.IsNotNull(appointmentData, "Appointment data should not be null");

        return appointmentData;
    }

    private async Task<ProjectOperationSheet?> GetOperationSheetData(
        HttpClient httpClient,
        Guid projectId
    )
    {
        var response = await httpClient.GetAsync(
            $"{ApiUrl}/api/appointment/operation-sheet/by-project/{projectId}"
        );
        if (response.StatusCode == HttpStatusCode.NotFound)
            return null;

        Assert.AreEqual(
            HttpStatusCode.OK,
            response.StatusCode,
            $"Should be able to get operation sheet for project {projectId}"
        );

        var operationSheet = await response.Content.ReadFromJsonAsync<ProjectOperationSheet>();
        return operationSheet;
    }

    private async Task<RodentRegister?> GetRodentRegisterData(
        HttpClient httpClient,
        Guid appointmentId
    )
    {
        var response = await httpClient.GetAsync(
            $"{ApiUrl}/api/appointment/{appointmentId}/rodent"
        );
        if (response.StatusCode == HttpStatusCode.NotFound)
            return null;

        Assert.AreEqual(
            HttpStatusCode.OK,
            response.StatusCode,
            $"Should be able to get rodent register for appointment {appointmentId}"
        );

        var rodentRegister = await response.Content.ReadFromJsonAsync<RodentRegister>();
        return rodentRegister;
    }

    private async Task<Certificate?> GetCertificateData(HttpClient httpClient, Guid appointmentId)
    {
        var response = await httpClient.GetAsync(
            $"{ApiUrl}/api/appointment/{appointmentId}/certificate"
        );
        if (response.StatusCode == HttpStatusCode.NotFound)
            return null;

        Assert.AreEqual(
            HttpStatusCode.OK,
            response.StatusCode,
            $"Should be able to get certificate for appointment {appointmentId}"
        );

        var certificate = await response.Content.ReadFromJsonAsync<Certificate>();
        return certificate;
    }

    private void ValidateDuplicatedData(
        AppointmentGetOutDTO sourceAppointment,
        AppointmentGetOutDTO targetAppointment,
        ProjectOperationSheet? operationSheet,
        RodentRegister? sourceRodentRegister,
        RodentRegister? targetRodentRegister,
        Certificate? sourceCertificate,
        Certificate? targetCertificate
    )
    {
        // Validate Operation Sheet duplication (project-level, so we just check it has the expected data)
        Assert.IsNotNull(operationSheet, "Project should have operation sheet after duplication");

        Assert.AreEqual(
            "Test Kitchen, Test Bathroom, Test Living Room",
            operationSheet.TreatedAreas,
            "Treated areas should be duplicated"
        );
        Assert.AreEqual(
            "Test Cockroaches, Test Ants",
            operationSheet.Insects,
            "Insects should be duplicated"
        );
        Assert.AreEqual(
            "Test Mice, Test Rats",
            operationSheet.Rodents,
            "Rodents should be duplicated"
        );
        Assert.AreEqual(
            "Test Spiders",
            operationSheet.OtherPlagues,
            "Other plagues should be duplicated"
        );
        Assert.AreEqual(
            true,
            operationSheet.AspersionManual,
            "Aspersion manual setting should be duplicated"
        );
        Assert.AreEqual(
            true,
            operationSheet.NebulizacionFrio,
            "Nebulization frio setting should be duplicated"
        );
        Assert.AreEqual(
            "Test Insecticide Brand",
            operationSheet.Insecticide,
            "Insecticide should be duplicated"
        );
        Assert.AreEqual(
            "500ml",
            operationSheet.InsecticideAmount,
            "Insecticide amount should be duplicated"
        );
        Assert.AreEqual("Test Staff 1", operationSheet.Staff1, "Staff1 should be duplicated");
        Assert.AreEqual(
            "Test observations for the operation",
            operationSheet.Observations,
            "Observations should be duplicated"
        );
        Assert.AreEqual(
            "Test recommendations for future treatments",
            operationSheet.Recommendations,
            "Recommendations should be duplicated"
        );

        // Validate Rodent Register duplication
        Assert.IsNotNull(targetRodentRegister, "Target should have rodent register");
        Assert.IsNotNull(sourceRodentRegister, "Source should have rodent register");

        Assert.AreEqual(
            sourceRodentRegister.Incidents,
            targetRodentRegister.Incidents,
            "Incidents should be duplicated"
        );
        Assert.AreEqual(
            sourceRodentRegister.CorrectiveMeasures,
            targetRodentRegister.CorrectiveMeasures,
            "Corrective measures should be duplicated"
        );

        // Validate that service date is NOT updated (should remain as source date)
        Assert.AreEqual(
            sourceRodentRegister.ServiceDate.Date,
            targetRodentRegister.ServiceDate.Date,
            "Service date should remain as source date, not be updated to target's due date"
        );

        // Validate Rodent Areas duplication
        Assert.AreEqual(
            sourceRodentRegister.RodentAreas.Count(),
            targetRodentRegister.RodentAreas.Count(),
            "Number of rodent areas should match"
        );

        var sourceAreas = sourceRodentRegister.RodentAreas.OrderBy(a => a.Name).ToList();
        var targetAreas = targetRodentRegister.RodentAreas.OrderBy(a => a.Name).ToList();

        for (int i = 0; i < sourceAreas.Count; i++)
        {
            Assert.AreEqual(
                sourceAreas[i].Name,
                targetAreas[i].Name,
                $"Rodent area {i} name should be duplicated"
            );
            Assert.AreEqual(
                sourceAreas[i].CebaderoTrampa,
                targetAreas[i].CebaderoTrampa,
                $"Rodent area {i} cebadero trampa should be duplicated"
            );
            Assert.AreEqual(
                sourceAreas[i].Frequency,
                targetAreas[i].Frequency,
                $"Rodent area {i} frequency should be duplicated"
            );
            Assert.AreEqual(
                sourceAreas[i].RodentConsumption,
                targetAreas[i].RodentConsumption,
                $"Rodent area {i} consumption should be duplicated"
            );
            Assert.AreEqual(
                sourceAreas[i].RodentResult,
                targetAreas[i].RodentResult,
                $"Rodent area {i} result should be duplicated"
            );
            Assert.AreEqual(
                sourceAreas[i].RodentMaterials,
                targetAreas[i].RodentMaterials,
                $"Rodent area {i} materials should be duplicated"
            );
            Assert.AreEqual(
                sourceAreas[i].ProductName,
                targetAreas[i].ProductName,
                $"Rodent area {i} product name should be duplicated"
            );
            Assert.AreEqual(
                sourceAreas[i].ProductDose,
                targetAreas[i].ProductDose,
                $"Rodent area {i} product dose should be duplicated"
            );
        }

        // Validate Certificate duplication
        Assert.IsNotNull(targetCertificate, "Target should have certificate");
        Assert.IsNotNull(sourceCertificate, "Source should have certificate");

        Assert.AreEqual(
            sourceCertificate.ExpirationDate,
            targetCertificate.ExpirationDate,
            "Certificate expiration date should be duplicated"
        );

        // Validate Services duplication
        Assert.AreEqual(
            sourceAppointment.ServicesIds.Count(),
            targetAppointment.ServicesIds.Count(),
            "Number of services should match"
        );

        var sourceServiceIds = sourceAppointment.ServicesIds.OrderBy(id => id).ToList();
        var targetServiceIds = targetAppointment.ServicesIds.OrderBy(id => id).ToList();

        CollectionAssert.AreEqual(
            sourceServiceIds,
            targetServiceIds,
            "Service IDs should be duplicated"
        );
    }
}
