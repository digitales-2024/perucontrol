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
    [Required]
    public required TimeSpan EnterTime { get; set; }

    // hora_salida
    [Required]
    public required TimeSpan LeaveTime { get; set; }

    // condición_sanitaria
    [Required]
    public string SanitaryCondition { get; set; } = string.Empty;

    // areas_tratadas
    [Required]
    public string TreatedAreas { get; set; } = string.Empty;

    // insectos
    [Required]
    public string Insects { get; set; } = string.Empty;

    // roedores
    [Required]
    public string Rodents { get; set; } = string.Empty;

    // otras
    [Required]
    public string OtherPlagues { get; set; } = string.Empty;

    // insecticida
    [Required]
    public string Insecticide { get; set; } = string.Empty;

    // insecticida2
    [Required]
    public string Insecticide2 { get; set; } = string.Empty;

    // rodenticida
    [Required]
    public string Rodenticide { get; set; } = string.Empty;

    // desinfectante
    [Required]
    public string Desinfectant { get; set; } = string.Empty;

    // otros_productos
    [Required]
    public string OtherProducts { get; set; } = string.Empty;

    // insecticida_cantidad
    [Required]
    public string InsecticideAmount { get; set; } = string.Empty;

    // insecticida_cantidad_2
    [Required]
    public string InsecticideAmount2 { get; set; } = string.Empty;

    // rodenticida_cantidad
    [Required]
    public string RodenticideAmount { get; set; } = string.Empty;

    // desinfectante_cantidad
    [Required]
    public string DesinfectantAmount { get; set; } = string.Empty;

    // producto_otros_cantidad
    [Required]
    public string OtherProductsAmount { get; set; } = string.Empty;

    // monitoreo_desratizacion_1
    [Required]
    public string RatExtermination1 { get; set; } = string.Empty;

    // monitoreo_desratizacion_2
    [Required]
    public string RatExtermination2 { get; set; } = string.Empty;

    // monitoreo_desratizacion_3
    [Required]
    public string RatExtermination3 { get; set; } = string.Empty;

    // monitoreo_desratizacion_4
    [Required]
    public string RatExtermination4 { get; set; } = string.Empty;

    // personal_1
    [Required]
    public string Staff1 { get; set; } = string.Empty;

    // personal_2
    [Required]
    public string Staff2 { get; set; } = string.Empty;

    // personal_3
    [Required]
    public string Staff3 { get; set; } = string.Empty;

    // personal_4
    [Required]
    public string Staff4 { get; set; } = string.Empty;

    [Required]
    public bool AspersionManual { get; set; } = false;

    [Required]
    public bool AspercionMotor { get; set; } = false;

    [Required]
    public bool NebulizacionFrio { get; set; } = false;

    [Required]
    public bool NebulizacionCaliente { get; set; } = false;

    [Required]
    public bool NebulizacionCebosTotal { get; set; } = false;

    [Required]
    public bool ColocacionCebosCebaderos { get; set; } = false;

    [Required]
    public string NumeroCeboTotal { get; set; } = string.Empty;

    [Required]
    public string NumeroCeboRepuestos { get; set; } = string.Empty;

    [Required]
    public InfestationDegree DegreeInsectInfectivity { get; set; } = InfestationDegree.Negligible;

    [Required]
    public InfestationDegree DegreeRodentInfectivity { get; set; } = InfestationDegree.Negligible;

    [Required]
    public string Observations { get; set; } = string.Empty;

    [Required]
    public string Recommendations { get; set; } = string.Empty;
}
