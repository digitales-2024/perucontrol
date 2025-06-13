using PeruControl.Infrastructure.Model;

namespace PeruControl.Controllers;

public class OperationSheetCreateDTO : IMapToEntity<ProjectOperationSheet>
{
    public Guid ProjectAppointmentId { get; set; }
    public DateTime? OperationDate { get; set; }
    public string? TreatedAreas { get; set; }

    public string? Insects { get; set; }
    public string Rodents { get; set; } = string.Empty;
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

    public string? Staff1 { get; set; }
    public string? Staff2 { get; set; }
    public string? Staff3 { get; set; }
    public string? Staff4 { get; set; }
    public bool? AspersionManual { get; set; } = false;
    public bool? AspercionMotor { get; set; } = false;
    public bool? NebulizacionFrio { get; set; } = false;
    public bool? NebulizacionCaliente { get; set; } = false;
    public string? ColocacionCebosCebaderos { get; set; } = string.Empty;
    public string? NumeroCeboTotal { get; set; } = string.Empty;
    public string? NumeroCeboRepuestos { get; set; } = string.Empty;
    public string? NroPlanchasPegantes { get; set; } = string.Empty;
    public string? NroJaulasTomahawk { get; set; } = string.Empty;
    public InfestationDegree? DegreeInsectInfectivity { get; set; } = InfestationDegree.Negligible;
    public InfestationDegree? DegreeRodentInfectivity { get; set; } = InfestationDegree.Negligible;
    public string? Observations { get; set; } = string.Empty;
    public string? Recommendations { get; set; } = string.Empty;

    public ProjectOperationSheet MapToEntity()
    {
        return new ProjectOperationSheet
        {
            ProjectAppointmentId = ProjectAppointmentId,
            OperationDate = OperationDate?.ToUniversalTime() ?? DateTime.UtcNow,
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
            Staff1 = Staff1 ?? string.Empty,
            Staff2 = Staff2 ?? string.Empty,
            Staff3 = Staff3 ?? string.Empty,
            Staff4 = Staff4 ?? string.Empty,
            AspersionManual = AspersionManual ?? false,
            AspercionMotor = AspercionMotor ?? false,
            NebulizacionFrio = NebulizacionFrio ?? false,
            NebulizacionCaliente = NebulizacionCaliente ?? false,
            ColocacionCebosCebaderos = ColocacionCebosCebaderos ?? string.Empty,
            NumeroCeboTotal = NumeroCeboTotal ?? string.Empty,
            NumeroCeboRepuestos = NumeroCeboRepuestos ?? string.Empty,
            NroPlanchasPegantes = NroPlanchasPegantes ?? string.Empty,
            NroJaulasTomahawk = NroJaulasTomahawk ?? string.Empty,
            DegreeInsectInfectivity = DegreeInsectInfectivity ?? InfestationDegree.Negligible,
            DegreeRodentInfectivity = DegreeRodentInfectivity ?? InfestationDegree.Negligible,
            Observations = Observations ?? string.Empty,
            Recommendations = Recommendations ?? string.Empty,
        };
    }
}

public class OperationSheetPatchDTO : IEntityPatcher<ProjectOperationSheet>
{
    public Guid ProjectAppointmentId { get; set; }
    public DateTime? OperationDate { get; set; }
    public string? TreatedAreas { get; set; }
    public TimeOnly? EnterTime { get; set; }
    public TimeOnly? LeaveTime { get; set; }
    public string? Insects { get; set; }
    public string? Rodents { get; set; } = string.Empty;
    public string? OtherPlagues { get; set; }
    public string? RodentConsumptionPartial { get; set; } = string.Empty;
    public string? RodentConsumptionTotal { get; set; } = string.Empty;
    public string? RodentConsumptionDeteriorated { get; set; } = string.Empty;
    public string? RodentConsumptionNone { get; set; } = string.Empty;
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
    public string? Staff1 { get; set; }
    public string? Staff2 { get; set; }
    public string? Staff3 { get; set; }
    public string? Staff4 { get; set; }
    public bool? AspersionManual { get; set; } = false;
    public bool? AspercionMotor { get; set; } = false;
    public bool? NebulizacionFrio { get; set; } = false;
    public bool? NebulizacionCaliente { get; set; } = false;
    public string? ColocacionCebosCebaderos { get; set; } = string.Empty;
    public string? NumeroCeboTotal { get; set; } = string.Empty;
    public string? NumeroCeboRepuestos { get; set; } = string.Empty;
    public string? NroPlanchasPegantes { get; set; } = string.Empty;
    public string? NroJaulasTomahawk { get; set; } = string.Empty;
    public InfestationDegree? DegreeInsectInfectivity { get; set; } = InfestationDegree.Negligible;
    public InfestationDegree? DegreeRodentInfectivity { get; set; } = InfestationDegree.Negligible;
    public string? Observations { get; set; } = string.Empty;
    public string? Recommendations { get; set; } = string.Empty;

    public void ApplyPatch(ProjectOperationSheet entity)
    {
        if (OperationDate != null)
            entity.OperationDate = (DateTime)OperationDate;
        if (TreatedAreas != null)
            entity.TreatedAreas = TreatedAreas;
        if (Insects != null)
            entity.Insects = Insects;
        if (Rodents != null)
            entity.Rodents = Rodents;
        if (OtherPlagues != null)
            entity.OtherPlagues = OtherPlagues;
        if (RodentConsumptionPartial != null)
            entity.RodentConsumptionPartial = RodentConsumptionPartial;
        if (RodentConsumptionTotal != null)
            entity.RodentConsumptionTotal = RodentConsumptionTotal;
        if (RodentConsumptionDeteriorated != null)
            entity.RodentConsumptionDeteriorated = RodentConsumptionDeteriorated;
        if (RodentConsumptionNone != null)
            entity.RodentConsumptionNone = RodentConsumptionNone;
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
        if (Staff1 != null)
            entity.Staff1 = Staff1;
        if (Staff2 != null)
            entity.Staff2 = Staff2;
        if (Staff3 != null)
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
        if (ColocacionCebosCebaderos != null)
            entity.ColocacionCebosCebaderos = ColocacionCebosCebaderos;
        if (NumeroCeboTotal != null)
            entity.NumeroCeboTotal = NumeroCeboTotal;
        if (NumeroCeboRepuestos != null)
            entity.NumeroCeboRepuestos = NumeroCeboRepuestos;
        if (NroPlanchasPegantes != null)
            entity.NroPlanchasPegantes = NroPlanchasPegantes;
        if (NroJaulasTomahawk != null)
            entity.NroJaulasTomahawk = NroJaulasTomahawk;
        if (DegreeInsectInfectivity != null)
            entity.DegreeInsectInfectivity = (InfestationDegree)DegreeInsectInfectivity;
        if (DegreeRodentInfectivity != null)
            entity.DegreeRodentInfectivity = (InfestationDegree)DegreeRodentInfectivity;
        if (Observations != null)
            entity.Observations = Observations;
        if (Recommendations != null)
            entity.Recommendations = Recommendations;
    }
}

public class GetOperationSheetsForTableOutDto
{
    public required Guid ProjectId { get; set; }
    public required Guid OperationSheetId { get; set; }
    public required Guid AppointmentId { get; set; }
    public required int Number { get; set; }
    public required string ClientName { get; set; }
    public DateTime? ActualDate { get; set; } = null;
    public required string EnterLeaveTime { get; set; }
    public required OperationSheetStatus Status { get; set; }
}

public class GetOperationSheetsForCreationOutDto
{
    public required Guid ServiceId { get; set; }
    public required string ClientName { get; set; }
    public required int ServiceNumber { get; set; }
    public required IList<OperationSheetAvailable> AvailableSheets { get; set; }

    public class OperationSheetAvailable
    {
        public required Guid AppoinmentId { get; set; }
        public required Guid OperationSheetId { get; set; }
        public required DateTime DueDate { get; set; }
        public required OperationSheetStatus Status { get; set; }
    }
}
