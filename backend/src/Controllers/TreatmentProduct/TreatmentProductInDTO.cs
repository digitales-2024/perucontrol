namespace PeruControl.Controllers;

public class TreatmentProductInDTO
{
    public Guid? Id { get; init; }
    public required string ProductName { get; init; }
    public required string AmountAndSolvent { get; init; }
    public required string ActiveIngredient { get; init; }
    public string? EquipmentUsed { get; init; }
    public string? AppliedTechnique { get; init; }
    public string? AppliedService { get; init; }
}

public class ProductSimpleDTO
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public string Concentration { get; set; } = string.Empty;
}
