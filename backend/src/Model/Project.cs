using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PeruControl.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ProjectStatus
{
    Pending,
    Approved,
    Rejected,
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum InfestationDegree
{
    High,
    Moderate,
    Low,
    Negligible,
}

public class Project : BaseModel
{
    [JsonIgnore]
    public Client Client { get; set; } = null!;

    [JsonIgnore]
    public ICollection<Service> Services { get; set; } = new HashSet<Service>();

    [JsonIgnore]
    public Quotation? Quotation { get; set; } = null!;

    public required string Address { get; set; }

    public required uint Area { get; set; }

    public required ProjectStatus Status { get; set; } = ProjectStatus.Pending;

    public required uint SpacesCount { get; set; }

    // Schedule: a list of Appointments
    public ICollection<ProjectAppointment> Appointments { get; set; } =
        new HashSet<ProjectAppointment>();

    // Reference properties
    [JsonIgnore]
    public ICollection<Certificate> Certificates { get; set; } = new HashSet<Certificate>();
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

    public Project MapToEntity()
    {
        return new Project
        {
            Address = Address,
            Area = Area,
            Status = ProjectStatus.Pending,
            SpacesCount = SpacesCount,
        };
    }
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

    public void ApplyPatch(Project entity)
    {
        if (Address != null)
            entity.Address = Address;
        if (Area != null)
            entity.Area = Area.Value;
        if (SpacesCount != null)
            entity.SpacesCount = SpacesCount.Value;
    }
}

public class ProjectSummary : BaseModel
{
    public virtual Client Client { get; set; } = null!;

    public virtual ICollection<Service> Services { get; set; } = new HashSet<Service>();

    public virtual Quotation? Quotation { get; set; } = null!;

    public required string Address { get; set; }

    public required uint Area { get; set; }

    public required ProjectStatus Status { get; set; } = ProjectStatus.Pending;

    public required uint SpacesCount { get; set; }

    public required int OrderNumber { get; set; }
}

public class ProjectStatusPatchDTO
{
    public ProjectStatus Status { get; set; }
}
