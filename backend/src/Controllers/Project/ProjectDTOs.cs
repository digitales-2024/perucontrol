using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using PeruControl.Model;

namespace PeruControl.Controllers;

public class ProjectOperationSheetExport
{
    // fecha_op
    public string OperationDate { get; set; } = string.Empty;

    // hora_ingreso
    public string EnterTime { get; set; } = string.Empty;

    // hora_salida
    public string LeaveTime { get; set; } = string.Empty;

    // condicion_sanitaria
    public string SanitaryCondition { get; set; } = string.Empty;

    // areas_tratadas
    public string TreatedAreas { get; set; } = string.Empty;

    // insectos
    public string Insects { get; set; } = string.Empty;

    // roedores
    public string Rodents { get; set; } = string.Empty;

    // otros
    public string OtherPlagues { get; set; } = string.Empty;

    // insecticida
    public string Insecticide { get; set; } = string.Empty;

    // insecticida2
    public string Insecticide2 { get; set; } = string.Empty;

    // rodenticida
    public string Rodenticide { get; set; } = string.Empty;

    // desinfectante
    public string Desinfectant { get; set; } = string.Empty;

    // producto_otros
    public string OtherProducts { get; set; } = string.Empty;

    // insecticida_cantidad
    public string InsecticideAmount { get; set; } = string.Empty;

    // insecticida_cantidad_2
    public string InsecticideAmount2 { get; set; } = string.Empty;

    // rodenticida_cantidad
    public string RodenticideAmount { get; set; } = string.Empty;

    // desinfectante_cantidad
    public string DesinfectantAmount { get; set; } = string.Empty;

    // producto_otros_cantidad
    public string OtherProductsAmount { get; set; } = string.Empty;

    // monitoreo_desratizacion_1
    public string RatExtermination1 { get; set; } = string.Empty;

    // monitoreo_desratizacion_2
    public string RatExtermination2 { get; set; } = string.Empty;

    // monitoreo_desratizacion_3
    public string RatExtermination3 { get; set; } = string.Empty;

    // monitoreo_desratizacion_4
    public string RatExtermination4 { get; set; } = string.Empty;

    // personal_1
    public string Staff1 { get; set; } = string.Empty;

    // personal_2
    public string Staff2 { get; set; } = string.Empty;

    // personal_3
    public string Staff3 { get; set; } = string.Empty;

    // personal_4
    public string Staff4 { get; set; } = string.Empty;

    public bool aspersionManual { get; set; } = false;

    public bool aspersionMotor { get; set; } = false;

    public bool nebulizacionFrio { get; set; } = false;

    public bool nebulizacionCaliente { get; set; } = false;

    public bool nebulizacionCebosTotal { get; set; } = false;

    public string colocacionCebosCebaderos { get; set; } = string.Empty;

    public string NumeroCeboTotal { get; set; } = string.Empty;

    public string NumeroCeboRepuestos { get; set; } = string.Empty;

    public InfestationDegree degreeInsectInfectivity { get; set; } = InfestationDegree.Negligible;
    public InfestationDegree degreeRodentInfectivity { get; set; } = InfestationDegree.Negligible;

    public string observations { get; set; } = string.Empty;

    public string recommendations { get; set; } = string.Empty;
}

public class ProjectCreateDTO : IMapToEntity<Project>
{
    public required Guid ClientId { get; set; }
    public Guid? QuotationId { get; set; }

    [Description("Array of Service IDs")]
    public required IList<Guid> Services { get; set; } = null!;

    [MinLength(1, ErrorMessage = "Debe ingresar una dirección")]
    [MaxLength(100, ErrorMessage = "La dirección no puede tener más de 100 caracteres")]
    public required string Address { get; set; }

    [Range(1, uint.MaxValue, ErrorMessage = "El área debe ser al menos 1")]
    public required uint Area { get; set; }

    [Range(1, uint.MaxValue, ErrorMessage = "Debe ingresar al menos 1 espacio")]
    public required uint SpacesCount { get; set; }

    /// Representante de la empresa
    public string? CompanyRepresentative { get; set; }

    [Range(
        0,
        9999999.99,
        ErrorMessage = "El precio debe ser un valor positivo y no mayor a 9,999,999.99"
    )]
    public required decimal Price { get; set; }

    [MinLength(1, ErrorMessage = "Debe haber al menos 1 fecha")]
    public required IList<AppointmentCreateDTOThroughProject> AppointmentCreateDTOs { get; set; } =
        null!;

    public string[] Ambients { get; set; } = Array.Empty<string>();

    public Project MapToEntity()
    {
        return new Project
        {
            Address = Address,
            Area = Area,
            Ambients = Ambients,
            Status = ProjectStatus.Pending,
            Price = Price,
            SpacesCount = SpacesCount,
        };
    }
}

public class AppointmentCreateDTOThroughProject
{
    public required DateTime DueDate { get; set; }

    [Description("Array of Service IDs")]
    [MinLength(1, ErrorMessage = "La fecha debe tener al menos 1 servicio")]
    public required IList<Guid> Services { get; set; } = null!;
}

public class ProjectPatchDTO : IEntityPatcher<Project>
{
    public Guid? ClientId { get; set; }
    public Guid? QuotationId { get; set; }

    [Description("Array of Service IDs")]
    public IList<Guid>? Services { get; set; } = null!;

    [MinLength(1, ErrorMessage = "Debe ingresar una dirección")]
    [MaxLength(100, ErrorMessage = "La dirección no puede tener más de 100 caracteres")]
    public string? Address { get; set; }

    [Range(1, uint.MaxValue, ErrorMessage = "El área debe ser al menos 1")]
    public uint? Area { get; set; }

    [Range(1, uint.MaxValue, ErrorMessage = "Debe ingresar al menos 1 espacio")]
    public uint? SpacesCount { get; set; }

    [Range(
        0,
        9999999.99,
        ErrorMessage = "El precio debe ser un valor positivo y no mayor a 9,999,999.99"
    )]
    public decimal? Price { get; set; }

    public string[]? Ambients { get; set; } = Array.Empty<string>();

    public void ApplyPatch(Project entity)
    {
        if (Address != null)
            entity.Address = Address;
        if (Area != null)
            entity.Area = Area.Value;
        if (SpacesCount != null)
            entity.SpacesCount = SpacesCount.Value;
        if (Price != null)
            entity.Price = Price.Value;
        if (Ambients != null)
            entity.Ambients = Ambients;
    }
}

public class ProjectSummary : BaseModel
{
    public required Client Client { get; set; } = null!;

    public required ICollection<Service> Services { get; set; } = new HashSet<Service>();

    public Quotation? Quotation { get; set; } = null!;

    public required int ProjectNumber { get; set; }

    public required string Address { get; set; }

    public required uint Area { get; set; }

    public required ProjectStatus Status { get; set; } = ProjectStatus.Pending;

    public required uint SpacesCount { get; set; }

    public required decimal Price { get; set; }
    public required string[] Ambients { get; set; } = [];

    public required IList<DateTime> Appointments { get; set; } = null!;
}

public class ProjectSummarySingle : BaseModel
{
    public required Client Client { get; set; } = null!;

    public required ICollection<Service> Services { get; set; } = new HashSet<Service>();

    public Quotation? Quotation { get; set; } = null!;

    public required int ProjectNumber { get; set; }

    public required string Address { get; set; }

    public required uint Area { get; set; }

    public required ProjectStatus Status { get; set; } = ProjectStatus.Pending;

    public required uint SpacesCount { get; set; }

    public required decimal Price { get; set; }

    public required string[] Ambients { get; set; } = [];

    public required ICollection<ProjectAppointmentDTO> Appointments { get; set; }
}

public class ProjectSummarySingle2 : BaseModel
{
    public required Client Client { get; set; } = null!;

    public required ICollection<Service> Services { get; set; } = new HashSet<Service>();

    public Quotation? Quotation { get; set; } = null!;

    public required int ProjectNumber { get; set; }

    public required string Address { get; set; }

    public required uint Area { get; set; }

    public required ProjectStatus Status { get; set; } = ProjectStatus.Pending;

    public required uint SpacesCount { get; set; }

    public required decimal Price { get; set; }

    public required IList<DateTime> Appointments { get; set; } = null!;
}

public class ProjectAppointmentDTO : BaseModel
{
    public int? CertificateNumber { get; set; } = null;
    public required DateTime DueDate { get; set; }
    public DateTime? ActualDate { get; set; }
    public int? AppointmentNumber { get; set; } = null;
    public bool? Cancelled { get; set; } = false;
    public TimeSpan? EnterTime { get; set; }
    public TimeSpan? LeaveTime { get; set; }
    public required ICollection<Guid> ServicesIds { get; set; }
    public required ProjectOperationSheet ProjectOperationSheet { get; set; }
}

public class ProjectStatusPatchDTO
{
    public ProjectStatus Status { get; set; }
}
