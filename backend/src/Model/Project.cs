using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PeruControl.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ProjectStatus
{
    Pending,
    Approved,
    Rejected,
}

public class Project : BaseModel
{
    [JsonIgnore]
    public virtual Client Client { get; set; } = null!;

    [JsonIgnore]
    public virtual ICollection<Service> Services { get; set; } = new HashSet<Service>();

    [JsonIgnore]
    public virtual Quotation? Quotation { get; set; } = null!;

    public required string Address { get; set; }

    public required uint Area { get; set; }

    public required ProjectStatus Status { get; set; } = ProjectStatus.Pending;

    public required uint SpacesCount { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int OrderNumber { get; set; }

    // TODO: clarify supplies

    // TODO: schedule
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
        // Look at all these null checks. In C we'd just memcpy and be done with it
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

    // TODO: clarify supplies

    // TODO: schedule
}

public class ProjectStatusPatchDTO
{
    public ProjectStatus Status { get; set; }
}
