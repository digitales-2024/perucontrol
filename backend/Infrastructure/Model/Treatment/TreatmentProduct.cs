namespace PeruControl.Infrastructure.Model;

public class TreatmentProduct : BaseModel
{
    //
    // Plain properties
    //
    public required Product Product { get; set; }
    public required ProductAmountSolvent ProductAmountSolvent { get; set; }
    public string? EquipmentUsed { get; set; }

    // "Pulverizado", "Nebulizado en Frio", etc. To be used in the first table
    public string? AppliedTechnique { get; set; }

    // "Desinsectacion", "Desinfeccion", etc. To be used in the first table
    public string? AppliedService { get; set; }
    public string? AppliedTime { get; set; }

    //
    // Relationships
    //
    public IList<TreatmentArea> TreatmentAreas { get; set; } = [];
    public ProjectAppointment ProjectAppointment { get; set; } = null!;
}
