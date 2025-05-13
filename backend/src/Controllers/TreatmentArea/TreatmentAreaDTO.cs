namespace PeruControl.Controllers.TreatmentArea;

public class TreatmentAreaGetDTO
{
    public required Guid Id { get; init; }
    public required string AreaName { get; init; }
    public string? ObservedVector { get; init; }
    public string? InfestationLevel { get; init; }
    public string? PerformedService { get; init; }
    public string? AppliedTechnique { get; init; }

    /// <summary>
    /// List of ProductTreatment IDs used in the treatment area.
    /// </summary>
    public required IEnumerable<Guid> ProductsList { get; init; }

    public static TreatmentAreaGetDTO FromEntity(Model.TreatmentArea area)
    {
        return new TreatmentAreaGetDTO
        {
            Id = area.Id,
            AreaName = area.AreaName,
            ObservedVector = area.ObservedVector,
            InfestationLevel = area.InfestationLevel,
            PerformedService = area.PerformedService,
            AppliedTechnique = area.AppliedTechnique,
            ProductsList = area.TreatmentProducts.Select(x => x.Id),
        };
    }
}
