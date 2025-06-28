namespace PeruControl.Infrastructure.Model;

public class TreatmentProduct : BaseModel
{
    //
    // Plain properties
    //
    public required string ProductName { get; set; }
    public required string AmountAndSolvent { get; set; }
    public required string ActiveIngredient { get; set; }
    public string? EquipmentUsed { get; set; }

    // "Pulverizado", "Nebulizado en Frio", etc. To be used in the first table
    public string? AppliedTechnique { get; set; }

    // "Desinsectacion", "Desinfeccion", etc. To be used in the first table
    public string? AppliedService { get; set; }

    //
    // Relationships
    //
    public IList<TreatmentArea> TreatmentAreas { get; set; } = [];
    public ProjectAppointment ProjectAppointment { get; set; } = null!;
}
