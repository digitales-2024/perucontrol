namespace PeruControl.Infrastructure.Model;

public class Product : BaseModel
{
    public required string Name { get; set; }
    public required string ActiveIngredient { get; set; }

    // Relations
    public required IList<ProductAmountSolvent> ProductAmountSolvents { get; set; }

    // Inherited relations
}

public class ProductAmountSolvent : BaseModel
{
    // E.g. "240ml x 16 litros de agua"
    public required string AmountAndSolvent { get; set; }

    public Product Product { get; set; } = null!;
}
