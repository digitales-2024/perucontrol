using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PeruControl.Infrastructure.Model;

[Index(nameof(RucNumber), IsUnique = true)]
public class Supplier : BaseModel
{
    [Required]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int SupplierNumber { get; set; }

    [MinLength(11)]
    [MaxLength(11)]
    [Required(ErrorMessage = "RUC number is required")]
    public required string RucNumber { get; set; }

    [MinLength(0)]
    [MaxLength(150)]
    public string? BusinessName { get; set; }

    [MinLength(0)]
    [MaxLength(250)]
    public string? BusinessType { get; set; }

    [MinLength(1)]
    [MaxLength(100)]
    public required string Name { get; set; }

    [MinLength(1, ErrorMessage = "Address must have at least 1 character")]
    [MaxLength(250, ErrorMessage = "Address must have a maximum of 250 characters")]
    public required string FiscalAddress { get; set; }

    [MinLength(3)]
    [MaxLength(50)]
    public required string Email { get; set; }

    public required ICollection<SupplierLocation> SupplierLocations { get; set; } =
        new List<SupplierLocation>();

    [MinLength(6)]
    [MaxLength(24)]
    public required string PhoneNumber { get; set; }

    [MinLength(0)]
    [MaxLength(100)]
    public string? ContactName { get; set; }
}

public class SupplierCreateDTO : IMapToEntity<Supplier>
{
    [MinLength(11, ErrorMessage = "RUC number must have 11 characters")]
    [MaxLength(11, ErrorMessage = "RUC number must have 11 characters")]
    [Required(ErrorMessage = "RUC number is required")]
    public required string RucNumber { get; set; }

    [MinLength(0)]
    [MaxLength(150, ErrorMessage = "Business name must have a maximum of 150 characters")]
    public string? BusinessName { get; set; }

    [MinLength(0)]
    [MaxLength(250, ErrorMessage = "Business type must have a maximum of 250 characters")]
    public string? BusinessType { get; set; }

    [MinLength(1, ErrorMessage = "Name cannot be empty")]
    [MaxLength(100, ErrorMessage = "Name must have a maximum of 100 characters")]
    public required string Name { get; set; }

    [MinLength(1)]
    [MaxLength(250, ErrorMessage = "Address must have a maximum of 250 characters")]
    public required string FiscalAddress { get; set; }

    [MinLength(3)]
    [MaxLength(50, ErrorMessage = "Email must have a maximum of 50 characters")]
    public required string Email { get; set; }

    public ICollection<SupplierLocationDTO>? SupplierLocations { get; set; }

    [MinLength(6, ErrorMessage = "Phone number must have at least 6 characters")]
    [MaxLength(24, ErrorMessage = "Phone number must have a maximum of 24 characters")]
    public required string PhoneNumber { get; set; }

    [MinLength(0)]
    [MaxLength(100, ErrorMessage = "Contact name must have a maximum of 100 characters")]
    public string? ContactName { get; set; }

    public Supplier MapToEntity()
    {
        return new Supplier
        {
            RucNumber = RucNumber,
            BusinessName = BusinessName,
            BusinessType = BusinessType,
            Name = Name,
            FiscalAddress = FiscalAddress,
            Email = Email,
            PhoneNumber = PhoneNumber,
            ContactName = ContactName,
            SupplierLocations =
                SupplierLocations != null && SupplierLocations.Any()
                    ? SupplierLocations
                        .Where(c => !string.IsNullOrWhiteSpace(c.Address))
                        .Select(c => c.MapToEntity())
                        .ToList()
                    : new List<SupplierLocation>(),
        };
    }
}

public class SupplierPatchDTO : IEntityPatcher<Supplier>
{
    [MinLength(0)]
    [MaxLength(150)]
    public string? BusinessName { get; set; }

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

    public ICollection<SupplierLocationDTO>? SupplierLocations { get; set; }

    public void ApplyPatch(Supplier entity)
    {
        if (BusinessName != null)
            entity.BusinessName = BusinessName;
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