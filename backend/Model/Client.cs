using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PeruControl.Model;

public class Client : BaseModel
{
    [MinLength(0)]
    [MaxLength(3)]
    public required string TypeDocument { get; set; }

    [MinLength(8)]
    [MaxLength(11)]
    public required string TypeDocumentValue { get; set; }

    [MinLength(0)]
    [MaxLength(100)]
    public string? RazonSocial { get; set; }

    [MinLength(0)]
    [MaxLength(100)]
    public required string BusinessType { get; set; }

    [MinLength(1)]
    [MaxLength(100)]
    public required string Name { get; set; }

    [MinLength(1)]
    [MaxLength(100)]
    public required string FiscalAddress { get; set; }

    [MinLength(3)]
    [MaxLength(50)]
    public required string Email { get; set; }

    public required ICollection<ClientLocation> ClientLocations { get; set; } =
        new List<ClientLocation>();

    [MinLength(6)]
    [MaxLength(24)]
    public required string PhoneNumber { get; set; }

    // Reference properties
    [JsonIgnore]
    public virtual IList<Quotation> ClientToQuotations { get; set; } = new List<Quotation>();
}

public class ClientCreateDTO : IMapToEntity<Client>
{
    [MinLength(0)]
    [MaxLength(3)]
    public required string TypeDocument { get; set; }

    [MinLength(8)]
    [MaxLength(11)]
    public required string TypeDocumentValue { get; set; }

    [MinLength(0)]
    [MaxLength(100)]
    public string? RazonSocial { get; set; }

    [MinLength(0)]
    [MaxLength(100)]
    public required string BusinessType { get; set; }

    [MinLength(1)]
    [MaxLength(100)]
    public required string Name { get; set; }

    [MinLength(1)]
    [MaxLength(100)]
    public required string FiscalAddress { get; set; }

    [MinLength(3)]
    [MaxLength(50)]
    public required string Email { get; set; }

    public required ICollection<ClientLocationDTO> ClientLocations { get; set; }

    [MinLength(6)]
    [MaxLength(24)]
    public required string PhoneNumber { get; set; }

    public Client MapToEntity()
    {
        return new Client
        {
            TypeDocument = TypeDocument,
            TypeDocumentValue = TypeDocumentValue,
            RazonSocial = RazonSocial,
            BusinessType = BusinessType,
            Name = Name,
            FiscalAddress = FiscalAddress,
            Email = Email,
            PhoneNumber = PhoneNumber,
            ClientLocations = ClientLocations.Select(c => c.MapToEntity()).ToList(),
        };
    }
}

public class ClientPatchDTO : IEntityPatcher<Client>
{
    [MinLength(0)]
    [MaxLength(100)]
    public string? RazonSocial { get; set; }

    [MinLength(0)]
    [MaxLength(100)]
    public string? BusinessType { get; set; }

    [MinLength(1)]
    [MaxLength(100)]
    public string? Name { get; set; }

    [MinLength(1)]
    [MaxLength(100)]
    public string? FiscalAddress { get; set; }

    [MinLength(3)]
    [MaxLength(50)]
    public string? Email { get; set; }

    [MinLength(6)]
    [MaxLength(24)]
    public string? PhoneNumber { get; set; }

    public void ApplyPatch(Client entity)
    {
        if (RazonSocial != null)
            entity.RazonSocial = RazonSocial;
        if (BusinessType != null)
            entity.BusinessType = BusinessType;
        if (Name != null)
            entity.Name = Name;
        if (FiscalAddress != null)
            entity.FiscalAddress = FiscalAddress;
        if (Email != null)
            entity.Email = Email;
        if (PhoneNumber != null)
            entity.PhoneNumber = PhoneNumber;
    }
}
