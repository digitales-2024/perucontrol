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

    [TestMethod]
    public async Task CreateQuotation_ShouldReturnCreated()
    {
        // Arrange: create a client and get all services
        var client = await ClientTest.CreateClientAsync();
        var services = await ServiceTest.GetAllServicesAsync();

        // Use the first service for the quotation
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

        // Act
        var response = await httpClient.PostAsJsonAsync($"{ApiUrl}/api/quotation", quotationDto);

        // If not created, get the error message and fail with it
        if (response.StatusCode != HttpStatusCode.Created)
        {
            var errorMsg = await response.Content.ReadAsStringAsync();
            Assert.Fail($"Expected 201 Created but got {(int)response.StatusCode}: {response.StatusCode}. Response: {errorMsg}");
        }

        // Assert
        var createdQuotation = await response.Content.ReadFromJsonAsync<Quotation>();
        Assert.IsNotNull(createdQuotation, "Created quotation should not be null");
        Assert.AreEqual(client.Id, createdQuotation!.Client.Id, "Quotation client should match");
    }
}