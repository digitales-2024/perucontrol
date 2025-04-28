using System.Net;
using System.Net.Http.Json;
using PeruControl.Model;
using Tests.E2E.Api;
using PeruControl.Controllers;

namespace Tests.E2E.Api;

[TestClass]
public class QuotationTest
{
    private static readonly string ApiUrl = Environment.GetEnvironmentVariable("API_URL") ?? throw new InvalidOperationException("BASE_URL envvar is not set. It is needed to run the tests.");

    // Reusable helper to create a quotation and return the created Quotation object
    public static async Task<Quotation> CreateQuotationAsync()
    {
        var client = await ClientTest.CreateClientAsync();
        var services = await ServiceTest.GetAllServicesAsync();
        var service = services.First();

        var quotationService = new QuotationServiceCreateDTO
        {
            Amount = 1,
            NameDescription = service.Name,
            Price = 100m,
            Accesories = "N/A"
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
            TermsAndConditions = ["Pago contra entrega", "Garantía 1 año"]
        };

        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var response = await httpClient.PostAsJsonAsync($"{ApiUrl}/api/quotation", quotationDto);

        if (response.StatusCode != HttpStatusCode.Created)
        {
            var errorMsg = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Expected 201 Created but got {(int)response.StatusCode}: {response.StatusCode}. Response: {errorMsg}");
        }

        var createdQuotation = await response.Content.ReadFromJsonAsync<Quotation>() ?? throw new InvalidOperationException("Created quotation should not be null");
        return createdQuotation;
    }

    [TestMethod]
    public async Task CreateQuotation_ShouldReturnCreated()
    {
        var createdQuotation = await CreateQuotationAsync();
        Assert.IsNotNull(createdQuotation, "Created quotation should not be null");
        Assert.IsNotNull(createdQuotation.Client, "Quotation client should not be null");
        Assert.IsFalse(createdQuotation.Client.Id == Guid.Empty, "Quotation client Id should not be empty");
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
        var newFrequency = createdQuotation.Frequency == QuotationFrequency.Bimonthly
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
            ExpirationDate = newExpirationDate
        };

        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        // Act: patch the quotation
        var patchResponse = await httpClient.PatchAsJsonAsync($"{ApiUrl}/api/quotation/{quotationId}", patchDto);

        // Assert
        Assert.AreEqual(HttpStatusCode.OK, patchResponse.StatusCode, $"Patch failed: {await patchResponse.Content.ReadAsStringAsync()}");

        var updatedQuotation = await patchResponse.Content.ReadFromJsonAsync<Quotation>();
        Assert.IsNotNull(updatedQuotation);

        Assert.AreEqual(newOthers, updatedQuotation.Others);
        Assert.AreEqual(newAvailability, updatedQuotation.Availability);
        Assert.AreEqual(newPaymentMethod, updatedQuotation.PaymentMethod);
        Assert.AreEqual(newServiceAddress, updatedQuotation.ServiceAddress);
        Assert.AreEqual(newHasTaxes, updatedQuotation.HasTaxes);
        Assert.AreEqual(newFrequency, updatedQuotation.Frequency);
        Assert.AreEqual(newCreationDate.ToUniversalTime(), updatedQuotation.CreationDate.ToUniversalTime());
        Assert.AreEqual(newExpirationDate.ToUniversalTime(), updatedQuotation.ExpirationDate.ToUniversalTime());
    }
}