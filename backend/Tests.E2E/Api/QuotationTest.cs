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
}