using PeruControl.Infrastructure.Model;

namespace PeruControl.Controllers.Product;

public class ProductService(DatabaseContext context)
{
    public async Task CreateProduct(ProductCreateInputDTO dto)
    {
        var product = new Infrastructure.Model.Product
        {
            Name = dto.Name,
            ActiveIngredient = dto.ActiveIngredient,
            ProductAmountSolvents = dto
                .Solvents.Select(solvent => new ProductAmountSolvent { AmountAndSolvent = solvent })
                .ToList(),
        };

        await context.Products.AddAsync(product);
        await context.SaveChangesAsync();
    }
}
