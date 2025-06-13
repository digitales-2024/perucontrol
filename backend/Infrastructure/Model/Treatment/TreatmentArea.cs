using System.Text.Json.Serialization;

namespace PeruControl.Infrastructure.Model;

public class TreatmentArea : BaseModel
{
    //
    // Plain properties
    //
    public required string AreaName { get; init; }
    public string? ObservedVector { get; set; }
    public string? InfestationLevel { get; set; }

    // "Desinsectacion", "Desinfeccion", etc
    public string? PerformedService { get; set; }

    // "Pulverizado", "Nebulizado en Frio", etc
    public string? AppliedTechnique { get; set; }

    //
    // Relationships
    //
    [JsonIgnore]
    public IList<TreatmentProduct> TreatmentProducts { get; set; } = [];

    [JsonIgnore]
    public ProjectAppointment ProjectAppointment { get; set; } = null!;
}
