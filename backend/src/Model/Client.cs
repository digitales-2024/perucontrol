using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace PeruControl.Model;

[Index(nameof(TypeDocumentValue), IsUnique = true)]
public class Client : BaseModel
{
    [MinLength(0)]
    [MaxLength(3)]
    public required string TypeDocument { get; set; }

    [MinLength(8)]
    [MaxLength(11)]
    public required string TypeDocumentValue { get; set; }

    [MinLength(0)]
    [MaxLength(150)]
    public string? RazonSocial { get; set; }

    [MinLength(0)]
    [MaxLength(250)]
    public required string BusinessType { get; set; }

    [MinLength(1)]
    [MaxLength(100)]
    public required string Name { get; set; }

    [MinLength(1, ErrorMessage = "La dirección debe tener al menos 1 caracter")]
    [MaxLength(250, ErrorMessage = "La dirección debe tener como máximo 100 caracteres")]
    public required string FiscalAddress { get; set; }

    [MinLength(3)]
    [MaxLength(50)]
    public required string Email { get; set; }

    public required ICollection<ClientLocation> ClientLocations { get; set; } =
        new List<ClientLocation>();

    [MinLength(6)]
    [MaxLength(24)]
    public required string PhoneNumber { get; set; }

    [MinLength(0)]
    [MaxLength(100)]
    public string? ContactName { get; set; }

    // Reference properties
    [JsonIgnore]
    public virtual IList<Quotation> ClientToQuotations { get; set; } = new List<Quotation>();
}

public class ClientCreateDTO : IMapToEntity<Client>
{
    [MinLength(0)]
    [MaxLength(3)]
    public required string TypeDocument { get; set; }

    [MinLength(8, ErrorMessage = "El documento debe tener al menos 8 caracteres")]
    [MaxLength(11, ErrorMessage = "El documento debe tener como máximo 11 caracteres")]
    public required string TypeDocumentValue { get; set; }

    [MinLength(0)]
    [MaxLength(150, ErrorMessage = "La razón social debe tener como máximo 150 caracteres")]
    public string? RazonSocial { get; set; }

    [MinLength(0)]
    [MaxLength(250, ErrorMessage = "El tipo de negocio debe tener como máximo 250 caracteres")]
    public required string BusinessType { get; set; }

    [MinLength(1, ErrorMessage = "El nombre no puede estar vacio")]
    [MaxLength(100, ErrorMessage = "El nombre debe tener como máximo 100 caracteres")]
    public required string Name { get; set; }

    [MinLength(1)]
    [MaxLength(250, ErrorMessage = "La dirección debe tener como máximo 100 caracteres")]
    public required string FiscalAddress { get; set; }

    [MinLength(3)]
    [MaxLength(50, ErrorMessage = "El email debe tener como máximo 50 caracteres")]
    public required string Email { get; set; }

    public required ICollection<ClientLocationDTO> ClientLocations { get; set; }

    [MinLength(6, ErrorMessage = "El número de teléfono debe tener al menos 6 caracteres")]
    [MaxLength(24, ErrorMessage = "El número de teléfono debe tener como máximo 24 caracteres")]
    public required string PhoneNumber { get; set; }

    [MinLength(0)]
    [MaxLength(100, ErrorMessage = "El nombre contacto debe tener como máximo 100 caracteres")]
    public string? ContactName { get; set; }

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
            ContactName = ContactName,
            ClientLocations = ClientLocations.Select(c => c.MapToEntity()).ToList(),
        };
    }
}

public class ClientPatchDTO : IEntityPatcher<Client>
{
    [MinLength(0)]
    [MaxLength(150)]
    public string? RazonSocial { get; set; }

    [MinLength(0)]
    [MaxLength(250)]
    public string? BusinessType { get; set; }

    [MinLength(1)]
    [MaxLength(100)]
    public string? Name { get; set; }

    [MinLength(1)]
    [MaxLength(250)]
    public string? FiscalAddress { get; set; }

    [MinLength(3)]
    [MaxLength(50)]
    public string? Email { get; set; }

    [MinLength(6)]
    [MaxLength(24)]
    public string? PhoneNumber { get; set; }

    [MinLength(0)]
    [MaxLength(100)]
    public string? ContactName { get; set; }

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
        if (ContactName != null)
            entity.ContactName = ContactName;
    }
}
