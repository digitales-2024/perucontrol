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

    // areas_tratadas
    [Required]
    public string TreatedAreas { get; set; } = string.Empty;

    //
    // Diagnóstico
    //

    // insectos
    [Required]
    public string Insects { get; set; } = string.Empty;

    // roedores
    [Required]
    public string Rodents { get; set; } = string.Empty;

    // Consumo de Roedores
    public string RodentConsumptionPartial { get; set; } = string.Empty;
    public string RodentConsumptionTotal { get; set; } = string.Empty;
    public string RodentConsumptionDeteriorated { get; set; } = string.Empty;
    public string RodentConsumptionNone { get; set; } = string.Empty;

    // otras
    [Required]
    public string OtherPlagues { get; set; } = string.Empty;

    //
    // Método utilizado
    //

    /// Aspercion
    [Required]
    public bool AspersionManual { get; set; } = false;

    [Required]
    public bool AspercionMotor { get; set; } = false;

    /// Nebulización
    [Required]
    public bool NebulizacionFrio { get; set; } = false;

    [Required]
    public bool NebulizacionCaliente { get; set; } = false;

    /// Colocación de cebos
    [Required]
    public string ColocacionCebosCebaderos { get; set; } = string.Empty;

    [Required]
    public string NumeroCeboTotal { get; set; } = string.Empty;

    [Required]
    public string NumeroCeboRepuestos { get; set; } = string.Empty;

    // Planchas pegantes
    [Required]
    public string NroPlanchasPegantes { get; set; } = string.Empty;

    // Jaulas Tomahawk
    [Required]
    public string NroJaulasTomahawk { get; set; } = string.Empty;

    //
    // Productos utilizados, cantidad y concentración
    //

    // insecticida
    [Required]
    public string Insecticide { get; set; } = string.Empty;

    // insecticida2
    [Required]
    public string Insecticide2 { get; set; } = string.Empty;

    // insecticida_cantidad
    [Required]
    public string InsecticideAmount { get; set; } = string.Empty;

    // insecticida_cantidad_2
    [Required]
    public string InsecticideAmount2 { get; set; } = string.Empty;

    //

    // rodenticida
    [Required]
    public string Rodenticide { get; set; } = string.Empty;

    // rodenticida_cantidad
    [Required]
    public string RodenticideAmount { get; set; } = string.Empty;

    //

    // desinfectante
    [Required]
    public string Desinfectant { get; set; } = string.Empty;

    // desinfectante_cantidad
    [Required]
    public string DesinfectantAmount { get; set; } = string.Empty;

    //

    // otros_productos
    [Required]
    public string OtherProducts { get; set; } = string.Empty;

    // producto_otros_cantidad
    [Required]
    public string OtherProductsAmount { get; set; } = string.Empty;

    //
    // Grado de infestación
    //

    public InfestationDegree? DegreeInsectInfectivity { get; set; }

    public InfestationDegree? DegreeRodentInfectivity { get; set; }

    //
    // Personal que intervino en los trabajos
    //

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

    //
    // Orden, limpieza, infraestructura y elementos innecesarios
    //
    [Required]
    public string Observations { get; set; } = string.Empty;

    [Required]
    public string Recommendations { get; set; } = string.Empty;

    [Required]
    public OperationSheetStatus Status { get; set; } = OperationSheetStatus.Created;
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum OperationSheetStatus
{
    /// The operation sheet has been only created
    Created,

    /// The operation sheet has started to be edited
    Started,

    /// The operation sheet is completed
    Completed,
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum InfestationDegree
{
    High,
    Moderate,
    Low,
    Negligible,
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RodentConsumption
{
    Partial,
    Total,
    Deteriorated,
    NoConsumption,
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum Aspersion
{
    Manual,
    Motor,
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum Nebulizacion
{
    Frio,
    Caliente,
}

public static class RodentConsumptionConverter
{
    public static (string, string, string, string) ToCheckbox(
        this RodentConsumption rodentConsumption
    )
    {
        return rodentConsumption switch
        {
            RodentConsumption.Partial => ("x", "", "", ""),
            RodentConsumption.Total => ("", "x", "", ""),
            RodentConsumption.Deteriorated => ("", "", "x", ""),
            RodentConsumption.NoConsumption => ("", "", "", "x"),
            _ => throw new ArgumentOutOfRangeException(
                nameof(rodentConsumption),
                rodentConsumption,
                null
            ),
        };
    }
}

public static class InfestationDegreeExtension
{
    public static (string, string, string, string) ToCheckbox(
        this InfestationDegree rodentConsumption
    )
    {
        return rodentConsumption switch
        {
            InfestationDegree.High => ("x", "", "", ""),
            InfestationDegree.Moderate => ("", "x", "", ""),
            InfestationDegree.Low => ("", "", "x", ""),
            InfestationDegree.Negligible => ("", "", "", "x"),
            _ => throw new ArgumentOutOfRangeException(
                nameof(rodentConsumption),
                rodentConsumption,
                null
            ),
        };
    }
}

public static class AspersionExtension
{
    public static (string, string) ToCheckbox(this Aspersion Aspersion)
    {
        return Aspersion switch
        {
            Aspersion.Manual => ("x", ""),
            Aspersion.Motor => ("", "x"),
            _ => throw new ArgumentOutOfRangeException(nameof(Aspersion), Aspersion, null),
        };
    }
}

public static class NebulizacionExtension
{
    public static (string, string) ToCheckbox(this Nebulizacion Nebulizacion)
    {
        return Nebulizacion switch
        {
            Nebulizacion.Frio => ("x", ""),
            Nebulizacion.Caliente => ("", "x"),
            _ => throw new ArgumentOutOfRangeException(nameof(Nebulizacion), Nebulizacion, null),
        };
    }
}
