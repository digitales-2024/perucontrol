namespace PeruControl.Model;

public class TreatmentProduct : BaseModel
{
    //
    // Plain properties
    //
    public required Product Product { get; set; }
    public required ProductAmountSolvent ProductConcentration { get; set; }
    public required string EquipmentUsed { get; set; }

    // "Pulverizado", "Nebulizado en Frio", etc. To be used in the first table
    public required string AppliedTechnique { get; set; }

    // "Desinsectacion", "Desinfeccion", etc. To be used in the first table
    public required string AppliedService { get; set; }
    public required string AppliedTime { get; set; }

    //
    // Relationships
    //
}
