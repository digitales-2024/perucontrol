using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PeruControl.Model;

public class ProjectOperationSheet : BaseModel
{
    [Required]
    public Guid ProjectAppointmentId { get; set; }

    [JsonIgnore]
    public ProjectAppointment ProjectAppointment { get; set; } = null!;

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

    public InfestationDegree DegreeInsectInfectivity { get; set; } = InfestationDegree.Negligible;

    public InfestationDegree DegreeRodentInfectivity { get; set; } = InfestationDegree.Negligible;

    public string Observations { get; set; } = string.Empty;

    public string Recommendations { get; set; } = string.Empty;
}
