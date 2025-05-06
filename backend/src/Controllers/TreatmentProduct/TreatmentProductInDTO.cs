namespace PeruControl.Controllers;

public class TreatmentProductInDTO
{
    public Guid? Id { get; init; }
    public required Guid ProductId { get; init; }
    public required Guid ProductAmountSolventId { get; init; }
    public string? EquipmentUsed { get; init; }
    public string? AppliedTechnique { get; init; }
    public string? AppliedService { get; init; }
    public string? AppliedTime { get; init; }
}
