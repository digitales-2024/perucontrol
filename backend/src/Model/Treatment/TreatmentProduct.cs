namespace PeruControl.Model;

public class TreatmentProduct : BaseModel
{
    //
    // Plain properties
    //
    public required string ProductName { get; set; }
    public required string ActiveIngredient { get; set; }
    public required string AmountAndSolvent { get; set; }
    public required string EquipmentUsed { get; set; }
    // "Pulverizado", "Nebulizado en Frio", etc. To be used in the first table
    public required string AppliedTechnique { get; set; }
    // "Desinsectacion", "Desinfeccion", etc. To be used in the first table
    public required string AppliedService { get; set; }
    public TimeOnly? AppliedTime { get; set; }

    //
    // Relationships
    //
}
