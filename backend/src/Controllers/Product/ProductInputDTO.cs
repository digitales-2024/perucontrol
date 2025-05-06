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

    [MinLength(1)]
    public required IList<string> Solvents { get; set; }
}
