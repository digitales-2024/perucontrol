namespace PeruControl.Model;

public class TreatmentArea : BaseModel
{
    //
    // Plain properties
    //
    public required string AreaName { get; set; }
    public required string ObservedVector { get; set; }
    public required string InfestationLevel { get; set; }

    // "Desinsectacion", "Desinfeccion", etc
    public required string PerformedService { get; set; }

    // "Pulverizado", "Nebulizado en Frio", etc
    public required string AppliedTechnique { get; set; }

    //
    // Relationships
    //
    public Product Product { get; set; } = null!;
}
