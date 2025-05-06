using System.Net;
using System.Net.Http.Json;
using PeruControl.Controllers.Product;

namespace Tests.E2E.Api;

[TestClass]
public class ProductTest
{
    private static readonly string ApiUrl = Environment.GetEnvironmentVariable("API_URL") ?? throw new InvalidOperationException("API_URL envvar is not set. It is needed to run the tests.");

    // Helper to create a product and return the input DTO for later verification
    public static async Task<ProductCreateInputDTO> CreateProductAsync()
    {
        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var productDto = new ProductCreateInputDTO
        {
            Name = $"Test Product {Guid.NewGuid():N}",
            ActiveIngredient = "Test Active Ingredient",
            Solvents = new List<string>
            {
                "100ml x 10 litros de agua",
                "200ml x 20 litros de agua"
            }
        };

        var response = await httpClient.PostAsJsonAsync($"{ApiUrl}/api/product", productDto);
        response.EnsureSuccessStatusCode();

        return productDto;
    }

    [TestMethod]
    public async Task CreateProduct_ThenGetAll_ShouldContainCreatedProduct()
    {
        var createdProductDto = await CreateProductAsync();

        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var getResponse = await httpClient.GetAsync($"{ApiUrl}/api/product");
        getResponse.EnsureSuccessStatusCode();

        var products = await getResponse.Content.ReadFromJsonAsync<List<ProductGetAllOutputDTO>>();
        Assert.IsNotNull(products, "Products list should not be null");

        var found = products.FirstOrDefault(p => p.Name == createdProductDto.Name);
        Assert.IsNotNull(found, "Created product should be found in GET all");

        Assert.AreEqual(createdProductDto.ActiveIngredient, found.ActiveIngredient, "Active ingredient should match");
        CollectionAssert.AreEquivalent(
            createdProductDto.Solvents.ToList(),
            found.ProductAmountSolvents.Select(s => s.AmountAndSolvent).ToList(),
            "Solvents should match"
        );
    }

    [TestMethod]
    public async Task CreateProduct_ShouldReturnOk()
    {
        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var productDto = new ProductCreateInputDTO
        {
            Name = $"Test Product {Guid.NewGuid():N}",
            ActiveIngredient = "Another Ingredient",
            Solvents = new List<string> { "50ml x 5 litros de agua" }
        };

        var response = await httpClient.PostAsJsonAsync($"{ApiUrl}/api/product", productDto);
        Assert.AreEqual(HttpStatusCode.OK, response.StatusCode, $"Expected OK, got {response.StatusCode}");
    }
}