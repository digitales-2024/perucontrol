using System.Net;
using System.Net.Http.Json;
using PeruControl.Controllers.Product;

namespace Tests.E2E.Api;

[TestClass]
public class ProductTest
{
    private static readonly string ApiUrl =
        Environment.GetEnvironmentVariable("API_URL")
        ?? throw new InvalidOperationException(
            "API_URL envvar is not set. It is needed to run the tests."
        );

    // Helper to create a product and return the created DTO
    public static async Task<ProductGetAllOutputDTO> CreateProductAsync()
    {
        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var productDto = new ProductCreateInputDTO
        {
            Name = $"Test Product {Guid.NewGuid():N}",
            ActiveIngredient = "Test Active Ingredient",
            Solvents = new List<string>
            {
                "100ml x 10 litros de agua",
                "200ml x 20 litros de agua",
            },
        };

        var createResponse = await httpClient.PostAsJsonAsync($"{ApiUrl}/api/product", productDto);
        createResponse.EnsureSuccessStatusCode();

        // Now, fetch all products to find the one we just created
        // This is inefficient, but necessary if the POST doesn't return the created object
        // Ideally, the POST would return a Location header or the created object itself.
        var getResponse = await httpClient.GetAsync($"{ApiUrl}/api/product");
        getResponse.EnsureSuccessStatusCode();
        var products = await getResponse.Content.ReadFromJsonAsync<List<ProductGetAllOutputDTO>>();
        Assert.IsNotNull(products);

        var createdProduct = products.FirstOrDefault(p => p.Name == productDto.Name);
        Assert.IsNotNull(createdProduct, "Could not find the newly created product by name.");

        // Verify basic details before returning
        Assert.AreEqual(productDto.ActiveIngredient, createdProduct.ActiveIngredient);
        CollectionAssert.AreEquivalent(
            productDto.Solvents.ToList(),
            createdProduct.ProductAmountSolvents.Select(s => s.AmountAndSolvent).ToList()
        );

        return createdProduct;
    }

    [TestMethod]
    public async Task CreateProduct_ThenGetAll_ShouldContainCreatedProduct()
    {
        // Create the product using the helper which now returns the full DTO
        var createdProduct = await CreateProductAsync();

        // The verification is now mostly done within CreateProductAsync itself.
        // We just need to assert that the creation process didn't fail (implicit via Assert in helper).
        Assert.IsNotNull(
            createdProduct,
            "CreateProductAsync should return a non-null product DTO."
        );
        Assert.IsTrue(
            createdProduct.ProductAmountSolvents.Count >= 2,
            "Created product should have at least 2 solvents initially."
        );
    }

    [TestMethod]
    public async Task CreateProduct_ShouldReturnOk()
    {
        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var productDto = new ProductCreateInputDTO
        {
            Name = $"Test Product {Guid.NewGuid():N}",
            ActiveIngredient = "Another Ingredient",
            Solvents = new List<string> { "50ml x 5 litros de agua" },
        };

        var response = await httpClient.PostAsJsonAsync($"{ApiUrl}/api/product", productDto);
        Assert.AreEqual(
            HttpStatusCode.OK,
            response.StatusCode,
            $"Expected OK, got {response.StatusCode}"
        );
    }

    [TestMethod]
    public async Task PatchProduct_ShouldUpdateCorrectly()
    {
        // 1. Create a product first
        var initialProduct = await CreateProductAsync();
        Assert.IsNotNull(initialProduct.ProductAmountSolvents);
        Assert.IsTrue(
            initialProduct.ProductAmountSolvents.Count >= 2,
            "Need at least two solvents to test update and delete"
        );

        var solventToUpdate = initialProduct.ProductAmountSolvents[0];
        var solventToDelete = initialProduct.ProductAmountSolvents[1]; // This ID won't be sent back

        // 2. Prepare PATCH data
        var updatedName = $"Updated Product Name {Guid.NewGuid():N}";
        var updatedIngredient = "Updated Active Ingredient";
        var updatedSolventAmount = "UPDATED 500ml x 50 litros";
        var newSolventAmount = "NEW 10ml x 1 litro";

        var patchDto = new ProductUpdateInputDTO
        {
            Name = updatedName,
            ActiveIngredient = updatedIngredient,
            Solvents = new List<ProductAmountSolventUpdateDTO>
            {
                // Update existing solvent
                new() { Id = solventToUpdate.Id, AmountAndSolvent = updatedSolventAmount },
                // Add new solvent (no Id)
                new() { AmountAndSolvent = newSolventAmount },
                // Omit solventToDelete.Id - this implies deletion
            },
        };

        // 3. Send PATCH request
        var accessToken = await AuthTest.GetAccessTokenAsync();
        using var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var patchResponse = await httpClient.PatchAsJsonAsync(
            $"{ApiUrl}/api/product/{initialProduct.Id}",
            patchDto
        );

        // 4. Assert PATCH response
        Assert.AreEqual(
            HttpStatusCode.OK,
            patchResponse.StatusCode,
            $"PATCH request failed with status {patchResponse.StatusCode}. Response: {await patchResponse.Content.ReadAsStringAsync()}"
        );

        // 5. Verify changes with a GET request
        var getResponse = await httpClient.GetAsync($"{ApiUrl}/api/product"); // Get all again
        getResponse.EnsureSuccessStatusCode();
        var allProducts = await getResponse.Content.ReadFromJsonAsync<
            List<ProductGetAllOutputDTO>
        >();
        Assert.IsNotNull(allProducts);

        var updatedProduct = allProducts.FirstOrDefault(p => p.Id == initialProduct.Id);
        Assert.IsNotNull(updatedProduct, "Could not find the updated product by ID.");

        // Assert basic fields updated
        Assert.AreEqual(updatedName, updatedProduct.Name, "Product name was not updated.");
        Assert.AreEqual(
            updatedIngredient,
            updatedProduct.ActiveIngredient,
            "Product active ingredient was not updated."
        );

        // Assert solvents updated, added, and deleted
        Assert.IsNotNull(updatedProduct.ProductAmountSolvents, "Solvents list should not be null.");
        Assert.AreEqual(
            2,
            updatedProduct.ProductAmountSolvents.Count,
            "Expected 2 solvents after PATCH (1 update, 1 add, 1 delete)."
        );

        // Check updated solvent
        var foundUpdatedSolvent = updatedProduct.ProductAmountSolvents.FirstOrDefault(s =>
            s.Id == solventToUpdate.Id
        );
        Assert.IsNotNull(foundUpdatedSolvent, "The updated solvent was not found.");
        Assert.AreEqual(
            updatedSolventAmount,
            foundUpdatedSolvent.AmountAndSolvent,
            "The solvent amount was not updated correctly."
        );

        // Check added solvent
        var foundAddedSolvent = updatedProduct.ProductAmountSolvents.FirstOrDefault(s =>
            s.AmountAndSolvent == newSolventAmount
        );
        Assert.IsNotNull(foundAddedSolvent, "The newly added solvent was not found.");
        Assert.AreNotEqual(
            Guid.Empty,
            foundAddedSolvent.Id,
            "The newly added solvent should have a non-empty ID."
        );
        Assert.AreNotEqual(
            solventToUpdate.Id,
            foundAddedSolvent.Id,
            "The newly added solvent should have a different ID than the updated one."
        );

        // Check deleted solvent (ensure it's NOT present)
        var foundDeletedSolvent = updatedProduct.ProductAmountSolvents.FirstOrDefault(s =>
            s.Id == solventToDelete.Id
        );
        Assert.IsNull(foundDeletedSolvent, "The deleted solvent should not be present.");
    }
}
