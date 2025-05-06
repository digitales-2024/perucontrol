namespace PeruControl.Model;

public class TreatmentArea : BaseModel
{
    //
    // Plain properties
    //
    public required string AreaName { get; set; }
    public string? ObservedVector { get; set; }
    public string? InfestationLevel { get; set; }

    // "Desinsectacion", "Desinfeccion", etc
    public string? PerformedService { get; set; }

    // "Pulverizado", "Nebulizado en Frio", etc
    public string? AppliedTechnique { get; set; }

    //
    // Relationships
    //
    public IList<TreatmentProduct> TreatmentProducts { get; set; } = new List<TreatmentProduct>();
    public ProjectAppointment ProjectAppointment { get; set; } = null!;
}
