using System.Text.Json.Serialization;

namespace PeruControl.Model;

public class ProjectOperationSheet : BaseModel
{
    [JsonIgnore]
    public virtual Project Project { get; set; } = null!;

    // fecha_op
    public required DateTime OperationDate { get; set; }

    // hora_ingreso
    public required TimeSpan EnterTime { get; set; }

    // hora_salida
    public required TimeSpan LeaveTime { get; set; }

    // condición_sanitaria
    public required string SanitaryCondition { get; set; }

    // areas_tratadas
    public required string TreatedAreas { get; set; }

    // insectos
    public required string Insects { get; set; }

    // roedores
    public required string Rodents { get; set; }

    // otras
    public required string OtherPlagues { get; set; }

    // insecticida
    public required string Insecticide { get; set; }

    // insecticida2
    public required string Insecticide2 { get; set; }

    // rodenticida
    public required string Rodenticide { get; set; }

    // desinfectante
    public required string Desinfectant { get; set; }

    // otros_productos
    public required string OtherProducts { get; set; }

    // insecticida_cantidad
    public required string InsecticideAmount { get; set; }

    // insecticida_cantidad_2
    public required string InsecticideAmount2 { get; set; }

    // rodenticida_cantidad
    public required string RodenticideAmount { get; set; }

    // desinfectante_cantidad
    public required string DesinfectantAmount { get; set; }

    // producto_otros_cantidad
    public required string OtherProductsAmount { get; set; }

    // monitoreo_desratizacion_1
    public required string RatExtermination1 { get; set; }

    // monitoreo_desratizacion_2
    public required string RatExtermination2 { get; set; }

    // monitoreo_desratizacion_3
    public required string RatExtermination3 { get; set; }

    // monitoreo_desratizacion_4
    public required string RatExtermination4 { get; set; }

    // personal_1
    public required string Staff1 { get; set; }

    // personal_2
    public required string Staff2 { get; set; }

    // personal_3
    public required string Staff3 { get; set; }

    // personal_4
    public required string Staff4 { get; set; }

    public bool AspersionManual { get; set; } = false;
    public bool AspercionMotor { get; set; } = false;
    public bool NebulizacionFrio { get; set; } = false;
    public bool NebulizacionCaliente { get; set; } = false;
    public bool NebulizacionCebosTotal { get; set; } = false;
    public bool ColocacionCebosCebaderos { get; set; } = false;
    public bool ColocacionCebosRepuestos { get; set; } = false;

    public DegressInfestation DegreeInsectInfectivity { get; set; } = DegressInfestation.Negligible;

    public DegressInfestation DegreeRodentInfectivity { get; set; } = DegressInfestation.Negligible;

    public string Observations { get; set; } = string.Empty;

    public string Recommendations { get; set; } = string.Empty;
}

public class ProjectOperationSheetCreateDTO : IMapToEntity<ProjectOperationSheet>
{
    public required Guid ProjectId { get; set; }

    public DateTime? OperationDate { get; set; }

    public TimeSpan? EnterTime { get; set; }

    public TimeSpan? LeaveTime { get; set; }

    public string? SanitaryCondition { get; set; }

    public string? TreatedAreas { get; set; }

    public string? Insects { get; set; }

    public string? Rodents { get; set; }

    public string? OtherPlagues { get; set; }

    public string? Insecticide { get; set; }

    public string? Insecticide2 { get; set; }

    public string? Rodenticide { get; set; }

    public string? Desinfectant { get; set; }

    public string? OtherProducts { get; set; }

    public string? InsecticideAmount { get; set; }

    public string? InsecticideAmount2 { get; set; }

    public string? RodenticideAmount { get; set; }

    public string? DesinfectantAmount { get; set; }

    public string? OtherProductsAmount { get; set; }

    public string? RatExtermination1 { get; set; }

    public string? RatExtermination2 { get; set; }

    public string? RatExtermination3 { get; set; }

    public string? RatExtermination4 { get; set; }

    public string? Staff1 { get; set; }

    public string? Staff2 { get; set; }

    public string? Staff3 { get; set; }

    public string? Staff4 { get; set; }

    public bool? AspersionManual { get; set; } = false;
    public bool? AspercionMotor { get; set; } = false;
    public bool? NebulizacionFrio { get; set; } = false;
    public bool? NebulizacionCaliente { get; set; } = false;
    public bool? NebulizacionCebosTotal { get; set; } = false;
    public bool? ColocacionCebosCebaderos { get; set; } = false;
    public bool? ColocacionCebosRepuestos { get; set; } = false;

    public DegressInfestation? DegreeInsectInfectivity { get; set; } = DegressInfestation.Negligible;

    public DegressInfestation? DegreeRodentInfectivity { get; set; } = DegressInfestation.Negligible;

    public string? Observations { get; set; } = string.Empty;

    public string? Recommendations { get; set; } = string.Empty;

    public ProjectOperationSheet MapToEntity()
    {
        return new ProjectOperationSheet
        {
            OperationDate = OperationDate ?? DateTime.Now,
            EnterTime = EnterTime ?? TimeSpan.Zero,
            LeaveTime = LeaveTime ?? TimeSpan.Zero,
            SanitaryCondition = SanitaryCondition ?? string.Empty,
            TreatedAreas = TreatedAreas ?? string.Empty,
            Insects = Insects ?? string.Empty,
            Rodents = Rodents ?? string.Empty,
            OtherPlagues = OtherPlagues ?? string.Empty,
            Insecticide = Insecticide ?? string.Empty,
            Insecticide2 = Insecticide2 ?? string.Empty,
            Rodenticide = Rodenticide ?? string.Empty,
            Desinfectant = Desinfectant ?? string.Empty,
            OtherProducts = OtherProducts ?? string.Empty,
            InsecticideAmount = InsecticideAmount ?? string.Empty,
            InsecticideAmount2 = InsecticideAmount2 ?? string.Empty,
            RodenticideAmount = RodenticideAmount ?? string.Empty,
            DesinfectantAmount = DesinfectantAmount ?? string.Empty,
            OtherProductsAmount = OtherProductsAmount ?? string.Empty,
            RatExtermination1 = RatExtermination1 ?? string.Empty,
            RatExtermination2 = RatExtermination2 ?? string.Empty,
            RatExtermination3 = RatExtermination3 ?? string.Empty,
            RatExtermination4 = RatExtermination4 ?? string.Empty,
            Staff1 = Staff1 ?? string.Empty,
            Staff2 = Staff2 ?? string.Empty,
            Staff3 = Staff3 ?? string.Empty,
            Staff4 = Staff4 ?? string.Empty,
            AspersionManual = AspersionManual ?? false,
            AspercionMotor = AspercionMotor ?? false,
            NebulizacionFrio = NebulizacionFrio ?? false,
            NebulizacionCaliente = NebulizacionCaliente ?? false,
            NebulizacionCebosTotal = NebulizacionCebosTotal ?? false,
            ColocacionCebosCebaderos = ColocacionCebosCebaderos ?? false,
            ColocacionCebosRepuestos = ColocacionCebosRepuestos ?? false,
            DegreeInsectInfectivity = DegreeInsectInfectivity ?? DegressInfestation.Negligible,
            DegreeRodentInfectivity = DegreeRodentInfectivity ?? DegressInfestation.Negligible,
            Observations = Observations ?? string.Empty,
            Recommendations = Recommendations ?? string.Empty,
        };
    }
}

public class ProjectOperationSheetPatchDTO: IEntityPatcher<ProjectOperationSheet>
{
    public Guid? ProjectId { get; set; }

    public DateTime? OperationDate { get; set; }

    public TimeSpan? EnterTime { get; set; }

    public TimeSpan? LeaveTime { get; set; }

    public string? SanitaryCondition { get; set; }

    public string? TreatedAreas { get; set; }

    public string? Insects { get; set; }

    public string? Rodents { get; set; }

    public string? OtherPlagues { get; set; }

    public string? Insecticide { get; set; }

    public string? Insecticide2 { get; set; }

    public string? Rodenticide { get; set; }

    public string? Desinfectant { get; set; }

    public string? OtherProducts { get; set; }

    public string? InsecticideAmount { get; set; }

    public string? InsecticideAmount2 { get; set; }

    public string? RodenticideAmount { get; set; }

    public string? DesinfectantAmount { get; set; }

    public string? OtherProductsAmount { get; set; }

    public string? RatExtermination1 { get; set; }

    public string? RatExtermination2 { get; set; }

    public string? RatExtermination3 { get; set; }

    public string? RatExtermination4 { get; set; }

    public string? Staff1 { get; set; }

    public string? Staff2 { get; set; }

    public string? Staff3 { get; set; }

    public string? Staff4 { get; set; }

    public bool? AspersionManual { get; set; } = false;
    public bool? AspercionMotor { get; set; } = false;
    public bool? NebulizacionFrio { get; set; } = false;
    public bool? NebulizacionCaliente { get; set; } = false;
    public bool? NebulizacionCebosTotal { get; set; } = false;
    public bool? ColocacionCebosCebaderos { get; set; } = false;
    public bool? ColocacionCebosRepuestos { get; set; } = false;

    public DegressInfestation? DegreeInsectInfectivity { get; set; } = DegressInfestation.Negligible;

    public DegressInfestation? DegreeRodentInfectivity { get; set; } = DegressInfestation.Negligible;

    public string? Observations { get; set; } = string.Empty;

    public string? Recommendations { get; set; } = string.Empty;

    public void ApplyPatch(ProjectOperationSheet entity)
    {
        if (OperationDate != null)
            entity.OperationDate = (DateTime)OperationDate;
        if (EnterTime != null)
            entity.EnterTime = (TimeSpan)EnterTime;
        if (LeaveTime != null)
            entity.LeaveTime = (TimeSpan)LeaveTime;
        if (SanitaryCondition != null)
            entity.SanitaryCondition = SanitaryCondition;
        if (TreatedAreas != null)
            entity.TreatedAreas = TreatedAreas;
        if (Insects != null)
            entity.Insects = Insects;
        if (Rodents != null)
            entity.Rodents = Rodents;
        if (OtherPlagues != null)
            entity.OtherPlagues = OtherPlagues;
        if (Insecticide != null)
            entity.Insecticide = Insecticide;
        if (Insecticide2 != null)
            entity.Insecticide2 = Insecticide2;
        if (Rodenticide != null)
            entity.Rodenticide = Rodenticide;
        if (Desinfectant != null)
            entity.Desinfectant = Desinfectant;
        if (OtherProducts != null)
            entity.OtherProducts = OtherProducts;
        if (InsecticideAmount != null)
            entity.InsecticideAmount = InsecticideAmount;
        if (InsecticideAmount2 != null)
            entity.InsecticideAmount2 = InsecticideAmount2;
        if (RodenticideAmount != null)
            entity.RodenticideAmount = RodenticideAmount;
        if (DesinfectantAmount != null)
            entity.DesinfectantAmount = DesinfectantAmount;
        if (OtherProductsAmount != null)
            entity.OtherProductsAmount = OtherProductsAmount;
        if (RatExtermination1 != null)
            entity.RatExtermination1 = RatExtermination1;
        if (RatExtermination2 != null)
            entity.RatExtermination2 = RatExtermination2;
        if (RatExtermination3 != null)
            entity.RatExtermination3 = RatExtermination3;
        if (RatExtermination4 != null)
            entity.RatExtermination4 = RatExtermination4;
        if (Staff1 != null)
            entity.Staff1 = Staff1;
        if (Staff2 != null)
            entity.Staff2 = Staff2;
        if (Staff3
            != null)
            entity.Staff3 = Staff3;
        if (Staff4 != null)
            entity.Staff4 = Staff4;
        if (AspersionManual != null)
            entity.AspersionManual = (bool)AspersionManual;
        if (AspercionMotor != null)
            entity.AspercionMotor = (bool)AspercionMotor;
        if (NebulizacionFrio != null)
            entity.NebulizacionFrio = (bool)NebulizacionFrio;
        if (NebulizacionCaliente != null)
            entity.NebulizacionCaliente = (bool)NebulizacionCaliente;
        if (NebulizacionCebosTotal != null)
            entity.NebulizacionCebosTotal = (bool)NebulizacionCebosTotal;
        if (ColocacionCebosCebaderos != null)
            entity.ColocacionCebosCebaderos = (bool)ColocacionCebosCebaderos;
        if (ColocacionCebosRepuestos != null)
            entity.ColocacionCebosRepuestos = (bool)ColocacionCebosRepuestos;
        if (DegreeInsectInfectivity != null)
            entity.DegreeInsectInfectivity = (DegressInfestation)DegreeInsectInfectivity;
        if (DegreeRodentInfectivity != null)
            entity.DegreeRodentInfectivity = (DegressInfestation)DegreeRodentInfectivity;
        if (Observations != null)
            entity.Observations = Observations;
        if (Recommendations != null)
            entity.Recommendations = Recommendations;
    }
}
