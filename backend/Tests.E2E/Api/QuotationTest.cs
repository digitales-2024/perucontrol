using System.Net;
using System.Net.Http.Json;
using PeruControl.Controllers;
using PeruControl.Infrastructure.Model;

namespace Tests.E2E.Api;

[TestClass]
public class QuotationTest
{
    private static readonly string ApiUrl =
        Environment.GetEnvironmentVariable("API_URL")
        ?? throw new InvalidOperationException(
            "BASE_URL envvar is not set. It is needed to run the tests."
        );

    // Reusable helper to create a quotation and return the created Quotation object
    public static async Task<Quotation> CreateQuotationAsync()
    {
        var client = await ClientTest.CreateClientAsync();
        var services = await ServiceTest.GetAllServicesAsync();
        var service = services.First();

        var quotationService = new QuotationServiceCreateDTO
        {
            Amount = "1",
            NameDescription = service.Name,
            Price = 100m,
            Accesories = "N/A",
        };

        var quotationDto = new QuotationCreateDTO
        {
            ClientId = client.Id,
            ServiceIds = [service.Id],
            Frequency = QuotationFrequency.Bimonthly,
            HasTaxes = true,
            CreationDate = DateTime.UtcNow,
            ExpirationDate = DateTime.UtcNow.AddDays(30),
            ServiceAddress = client.FiscalAddress,
            PaymentMethod = "Contado",
            Others = "Ninguno",
            Availability = "Inmediata",
            QuotationServices = [quotationService],
            TermsAndConditions = ["Pago contra entrega", "Garantía 1 año"],
        };

        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var response = await httpClient.PostAsJsonAsync($"{ApiUrl}/api/quotation", quotationDto);

        if (response.StatusCode != HttpStatusCode.Created)
        {
            var errorMsg = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException(
                $"Expected 201 Created but got {(int)response.StatusCode}: {response.StatusCode}. Response: {errorMsg}"
            );
        }

        var createdQuotation =
            await response.Content.ReadFromJsonAsync<Quotation>()
            ?? throw new InvalidOperationException("Created quotation should not be null");
        return createdQuotation;
    }

    [TestMethod]
    public async Task CreateQuotation_ShouldReturnCreated()
    {
        var createdQuotation = await CreateQuotationAsync();
        Assert.IsNotNull(createdQuotation, "Created quotation should not be null");
        Assert.IsNotNull(createdQuotation.Client, "Quotation client should not be null");
        Assert.IsFalse(
            createdQuotation.Client.Id == Guid.Empty,
            "Quotation client Id should not be empty"
        );
    }

    [TestMethod]
    public async Task PatchQuotation_ShouldUpdateSimpleFields()
    {
        // Arrange: create a quotation
        var createdQuotation = await CreateQuotationAsync();
        Assert.IsNotNull(createdQuotation);

        var quotationId = createdQuotation.Id;
        var newOthers = "Nuevo valor de otros";
        var newAvailability = "Disponible en 2 días";
        var newPaymentMethod = "Transferencia";
        var newServiceAddress = "Nueva dirección de servicio";
        var newHasTaxes = !createdQuotation.HasTaxes;
        var newFrequency =
            createdQuotation.Frequency == QuotationFrequency.Bimonthly
                ? QuotationFrequency.Monthly
                : QuotationFrequency.Bimonthly;
        var newCreationDate = createdQuotation.CreationDate.AddDays(-1);
        var newExpirationDate = createdQuotation.ExpirationDate.AddDays(10);

        var patchDto = new
        {
            Others = newOthers,
            Availability = newAvailability,
            PaymentMethod = newPaymentMethod,
            ServiceAddress = newServiceAddress,
            HasTaxes = newHasTaxes,
            Frequency = newFrequency,
            CreationDate = newCreationDate,
            ExpirationDate = newExpirationDate,
        };

        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        // Act: patch the quotation
        var patchResponse = await httpClient.PatchAsJsonAsync(
            $"{ApiUrl}/api/quotation/{quotationId}",
            patchDto
        );

        // Assert
        Assert.AreEqual(
            HttpStatusCode.OK,
            patchResponse.StatusCode,
            $"Patch failed: {await patchResponse.Content.ReadAsStringAsync()}"
        );

        var updatedQuotation = await patchResponse.Content.ReadFromJsonAsync<Quotation>();
        Assert.IsNotNull(updatedQuotation);

        Assert.AreEqual(newOthers, updatedQuotation.Others);
        Assert.AreEqual(newAvailability, updatedQuotation.Availability);
        Assert.AreEqual(newPaymentMethod, updatedQuotation.PaymentMethod);
        Assert.AreEqual(newServiceAddress, updatedQuotation.ServiceAddress);
        Assert.AreEqual(newHasTaxes, updatedQuotation.HasTaxes);
        Assert.AreEqual(newFrequency, updatedQuotation.Frequency);
        Assert.AreEqual(
            newCreationDate.ToUniversalTime(),
            updatedQuotation.CreationDate.ToUniversalTime()
        );
        Assert.AreEqual(
            newExpirationDate.ToUniversalTime(),
            updatedQuotation.ExpirationDate.ToUniversalTime()
        );
    }

    [TestMethod]
    public async Task PatchQuotationServices_ShouldAddNewService()
    {
        var createdQuotation = await CreateQuotationAsync();
        Assert.IsNotNull(createdQuotation);

        var quotationId = createdQuotation.Id;
        var originalServices = createdQuotation.QuotationServices.ToList();
        var newService = new QuotationServicePatchDTO
        {
            Id = Guid.NewGuid(), // Assuming the backend ignores this for new items
            Amount = "2",
            NameDescription = "Servicio adicional",
            Price = 200m,
            Accesories = "Accesorio X",
        };

        var patchDto = new QuotationPatchDTO
        {
            QuotationServices = originalServices
                .Select(qs => new QuotationServicePatchDTO
                {
                    Id = qs.Id,
                    Amount = qs.Amount,
                    NameDescription = qs.NameDescription,
                    Price = qs.Price,
                    Accesories = qs.Accesories,
                })
                .Append(newService)
                .ToList(),
        };

        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var patchResponse = await httpClient.PatchAsJsonAsync(
            $"{ApiUrl}/api/quotation/{quotationId}",
            patchDto
        );
        Assert.AreEqual(
            HttpStatusCode.OK,
            patchResponse.StatusCode,
            $"Patch failed: {await patchResponse.Content.ReadAsStringAsync()}"
        );

        var updatedQuotation = await patchResponse.Content.ReadFromJsonAsync<Quotation>();
        Assert.IsNotNull(updatedQuotation);
        Assert.AreEqual(originalServices.Count + 1, updatedQuotation.QuotationServices.Count);
        Assert.IsTrue(
            updatedQuotation.QuotationServices.Any(qs => qs.NameDescription == "Servicio adicional")
        );
    }

    [TestMethod]
    public async Task PatchQuotationServices_ShouldRemoveService()
    {
        var createdQuotation = await CreateQuotationAsync();
        Assert.IsNotNull(createdQuotation);

        var quotationId = createdQuotation.Id;
        var originalServices = createdQuotation.QuotationServices.ToList();
        Assert.IsTrue(originalServices.Count > 0, "Should have at least one service to remove");

        var patchDto = new
        {
            QuotationServices = originalServices
                .Skip(1) // Remove the first service
                .Select(qs => new
                {
                    Id = qs.Id,
                    Amount = qs.Amount,
                    NameDescription = qs.NameDescription,
                    Price = qs.Price,
                    Accesories = qs.Accesories,
                })
                .ToList(),
        };

        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var patchResponse = await httpClient.PatchAsJsonAsync(
            $"{ApiUrl}/api/quotation/{quotationId}",
            patchDto
        );
        Assert.AreEqual(
            HttpStatusCode.OK,
            patchResponse.StatusCode,
            $"Patch failed: {await patchResponse.Content.ReadAsStringAsync()}"
        );

        var updatedQuotation = await patchResponse.Content.ReadFromJsonAsync<Quotation>();
        Assert.IsNotNull(updatedQuotation);
        Assert.AreEqual(originalServices.Count - 1, updatedQuotation.QuotationServices.Count);
        Assert.IsFalse(
            updatedQuotation.QuotationServices.Any(qs => qs.Id == originalServices[0].Id)
        );
    }

    [TestMethod]
    public async Task PatchQuotationServices_ShouldEditService()
    {
        var createdQuotation = await CreateQuotationAsync();
        Assert.IsNotNull(createdQuotation);

        var quotationId = createdQuotation.Id;
        var originalServices = createdQuotation.QuotationServices.ToList();
        Assert.IsTrue(originalServices.Count > 0, "Should have at least one service to edit");

        var editedService = new QuotationServicePatchDTO
        {
            Id = originalServices[0].Id,
            Amount = originalServices[0].Amount + 5,
            NameDescription = originalServices[0].NameDescription + " (editado)",
            Price = (originalServices[0].Price ?? 0) + 50,
            Accesories = "Accesorio editado",
        };

        var patchDto = new QuotationPatchDTO
        {
            QuotationServices = originalServices
                .Select(
                    (qs, idx) =>
                        idx == 0
                            ? editedService
                            : new QuotationServicePatchDTO
                            {
                                Id = qs.Id,
                                Amount = qs.Amount,
                                NameDescription = qs.NameDescription,
                                Price = qs.Price,
                                Accesories = qs.Accesories,
                            }
                )
                .ToList(),
        };

        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var patchResponse = await httpClient.PatchAsJsonAsync(
            $"{ApiUrl}/api/quotation/{quotationId}",
            patchDto
        );
        Assert.AreEqual(
            HttpStatusCode.OK,
            patchResponse.StatusCode,
            $"Patch failed: {await patchResponse.Content.ReadAsStringAsync()}"
        );

        var updatedQuotation = await patchResponse.Content.ReadFromJsonAsync<Quotation>();
        Assert.IsNotNull(updatedQuotation);

        var updatedService = updatedQuotation.QuotationServices.First(qs =>
            qs.Id == editedService.Id
        );
        Assert.AreEqual(editedService.Amount, updatedService.Amount);
        Assert.AreEqual(editedService.NameDescription, updatedService.NameDescription);
        Assert.AreEqual(editedService.Price, updatedService.Price);
        Assert.AreEqual(editedService.Accesories, updatedService.Accesories);
    }

    [TestMethod]
    public async Task PatchQuotationServices_ShouldAddEditRemoveServices()
    {
        var createdQuotation = await CreateQuotationAsync();
        Assert.IsNotNull(createdQuotation);

        var quotationId = createdQuotation.Id;
        var originalServices = createdQuotation.QuotationServices.ToList();
        Assert.IsTrue(originalServices.Count > 0, "Should have at least one service");

        // Remove the first, edit the second (if exists), add a new one
        var servicesToKeep = originalServices.Skip(1).ToList();

        var editedService =
            servicesToKeep.Count > 0
                ? new
                {
                    Id = servicesToKeep[0].Id,
                    Amount = servicesToKeep[0].Amount + 10,
                    NameDescription = servicesToKeep[0].NameDescription + " (modificado)",
                    Price = (servicesToKeep[0].Price ?? 0) + 100,
                    Accesories = "Accesorio modificado",
                }
                : null;

        var newService = new
        {
            Id = Guid.NewGuid(),
            Amount = "3",
            NameDescription = "Nuevo servicio combinado",
            Price = 300m,
            Accesories = "Accesorio nuevo",
        };

        var patchServices = new List<object>();
        if (editedService != null)
            patchServices.Add(editedService);
        patchServices.Add(newService);

        var patchDto = new { QuotationServices = patchServices };

        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var patchResponse = await httpClient.PatchAsJsonAsync(
            $"{ApiUrl}/api/quotation/{quotationId}",
            patchDto
        );
        Assert.AreEqual(
            HttpStatusCode.OK,
            patchResponse.StatusCode,
            $"Patch failed: {await patchResponse.Content.ReadAsStringAsync()}"
        );

        var updatedQuotation = await patchResponse.Content.ReadFromJsonAsync<Quotation>();
        Assert.IsNotNull(updatedQuotation);

        // Should have one less than original if there were at least 2, otherwise just the new one
        var expectedCount = (editedService != null ? 1 : 0) + 1;
        Assert.AreEqual(expectedCount, updatedQuotation.QuotationServices.Count);

        if (editedService != null)
        {
            var updatedService = updatedQuotation.QuotationServices.First(qs =>
                qs.Id == ((dynamic)editedService).Id
            );
            Assert.AreEqual(((dynamic)editedService).Amount, updatedService.Amount);
            Assert.AreEqual(
                ((dynamic)editedService).NameDescription,
                updatedService.NameDescription
            );
            Assert.AreEqual(((dynamic)editedService).Price, updatedService.Price);
            Assert.AreEqual(((dynamic)editedService).Accesories, updatedService.Accesories);
        }
        Assert.IsTrue(
            updatedQuotation.QuotationServices.Any(qs =>
                qs.NameDescription == "Nuevo servicio combinado"
            )
        );
    }
}
