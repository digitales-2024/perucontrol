using System.ComponentModel.DataAnnotations;

namespace PeruControl.Controllers.Product;

public class ProductCreateInputDTO
{
    [MinLength(1)]
    [MaxLength(100)]
    public required string Name { get; set; }

    [MinLength(1)]
    [MaxLength(100)]
    public required string ActiveIngredient { get; set; }

    public required IList<string> Solvents { get; set; }
}

public class ProductAmountSolventUpdateDTO
{
    public Guid? Id { get; set; }

    [MinLength(1)]
    [MaxLength(200)] // Assuming a reasonable max length
    public required string AmountAndSolvent { get; set; }
}

public class ProductUpdateInputDTO
{
    [MinLength(1)]
    [MaxLength(100)]
    public string? Name { get; set; }

    [MinLength(1)]
    [MaxLength(100)]
    public string? ActiveIngredient { get; set; }

    public IList<ProductAmountSolventUpdateDTO>? Solvents { get; set; }
}
