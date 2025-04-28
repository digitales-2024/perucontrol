using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PeruControl.Model;

public class ClientLocation : BaseModel
{
    [JsonIgnore]
    public virtual Client Client { get; set; } = null!;

    public required string Address { get; set; }
}

public class ClientLocationDTO : IMapToEntity<ClientLocation>
{
    public string? Address { get; set; }

    public ClientLocation MapToEntity()
    {
        return new ClientLocation { Address = Address ?? string.Empty };
    }
}
