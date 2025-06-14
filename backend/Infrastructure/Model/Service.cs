using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PeruControl.Infrastructure.Model;

public class Service : BaseModel
{
    [MinLength(2)]
    [MaxLength(20)]
    public required string Name { get; set; }

    // Reference properties
    [JsonIgnore]
    public virtual ICollection<Quotation> Quotation { get; set; } = new HashSet<Quotation>();

    [JsonIgnore]
    public virtual ICollection<ProjectAppointment> Appointments { get; set; } =
        new HashSet<ProjectAppointment>();

    [JsonIgnore]
    public virtual ICollection<Project> Projects { get; set; } = new HashSet<Project>();
}

public class ServiceCreateDTO : IMapToEntity<Service>
{
    [MinLength(2)]
    [MaxLength(20)]
    public required string Name { get; set; }

    public Service MapToEntity()
    {
        return new Service { Name = Name };
    }
}

public class ServicePatchDTO : IEntityPatcher<Service>
{
    [MinLength(2)]
    [MaxLength(20)]
    public string? Name { get; set; }

    public void ApplyPatch(Service entity)
    {
        if (Name != null)
        {
            entity.Name = Name;
        }
    }
}
