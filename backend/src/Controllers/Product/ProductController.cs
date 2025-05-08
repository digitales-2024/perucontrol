using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Model;

namespace PeruControl.Controllers.Product;

[ApiController]
[Route("/api/[controller]")]
[Authorize]
public class ProductController(DatabaseContext context, ProductService productService)
    : ControllerBase
{
    [EndpointSummary("Get all products & solvents")]
    [HttpGet]
    public async Task<ActionResult<IList<ProductGetAllOutputDTO>>> GetAllProducts()
    {
        var products = await context.Products.Include(p => p.ProductAmountSolvents).ToListAsync();

        var result = products.Select(p => ProductGetAllOutputDTO.FromProduct(p)).ToList();
        // var result = products.Select(p => ProductGetAllOutputDTO.FromProduct(p)).ToList();

        return Ok(result);
    }

    [EndpointSummary("Create a product with Solvents")]
    [HttpPost]
    public async Task<ActionResult> CreateProduct([FromBody] ProductCreateInputDTO dto)
    {
        await productService.CreateProduct(dto);
        return Ok();
    }
}
