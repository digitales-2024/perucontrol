namespace PeruControl.Controllers.TreatmentArea;

public class TreatmentAreaInDTO
{
    public Guid Id { get; init; }
    public string? ObservedVector { get; init; }
    public string? InfestationLevel { get; init; }
    public string? PerformedService { get; init; }
    public string? AppliedTechnique { get; init; }
    public required IList<Guid> TreatmentProductIds { get; init; }
}
