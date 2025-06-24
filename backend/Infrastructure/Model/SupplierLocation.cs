using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PeruControl.Infrastructure.Model;

public class SupplierLocation : BaseModel
{
    [JsonIgnore]
    public virtual Supplier Supplier { get; set; } = null!;

    public required string Address { get; set; }
}

public class SupplierLocationDTO : IMapToEntity<SupplierLocation>
{
    public Guid? Id { get; set; }
    public required string Address { get; set; }

    public SupplierLocation MapToEntity()
    {
        return new SupplierLocation { Address = Address ?? string.Empty };
    }
}