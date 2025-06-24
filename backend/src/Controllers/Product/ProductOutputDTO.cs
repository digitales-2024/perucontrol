namespace PeruControl.Controllers.Product;

public class ProductAmountSolventOutputDTO
{
    public required Guid Id { get; set; }
    public required string AmountAndSolvent { get; set; }
}

public class ProductGetAllOutputDTO
{
    public required Guid Id { get; set; }
    public required string Name { get; set; }
    public required string ActiveIngredient { get; set; }
    public required bool IsActive { get; set; }
    public required IList<ProductAmountSolventOutputDTO> ProductAmountSolvents { get; set; }

    public static ProductGetAllOutputDTO FromProduct(Infrastructure.Model.Product p) =>
        new()
        {
            Id = p.Id,
            Name = p.Name,
            IsActive = p.IsActive,
            ActiveIngredient = p.ActiveIngredient,
            ProductAmountSolvents = p
                .ProductAmountSolvents.Select(solvent => new ProductAmountSolventOutputDTO
                {
                    Id = solvent.Id,
                    AmountAndSolvent = solvent.AmountAndSolvent,
                })
                .ToList(),
        };
}
