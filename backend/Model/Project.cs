using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PeruControl.Model;

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
    public required uint SpacesCount { get; set; }

    public required uint OrderNumber { get; set; }

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

    [Range(1, uint.MaxValue, ErrorMessage = "Debe ingresar al menos 1 espacio")]
    public required uint OrderNumber { get; set; }

    public Project MapToEntity()
    {
        return new Project
        {
            Address = Address,
            Area = Area,
            SpacesCount = SpacesCount,
            OrderNumber = OrderNumber,
        };
    }
}

public class ProjectPatchDTO : IEntityPatcher<Project>
{
    public void ApplyPatch(Project entity)
    {
        throw new NotImplementedException();
    }
}
