using System.ComponentModel.DataAnnotations;

namespace PeruControl.Model;

public class Client : BaseModel
{
    [MinLength(0)]
    [MaxLength(100)]
    public required string RazonSocial { get; set; }

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

    public ICollection<ClientLocation> ClientLocations { get; } = new List<ClientLocation>();

    [MinLength(6)]
    [MaxLength(24)]
    public required string PhoneNumber { get; set; }
}

public class ClientPatchDTO
{
    [MinLength(0)]
    [MaxLength(100)]
    public required string? RazonSocial { get; set; }

    [MinLength(0)]
    [MaxLength(100)]
    public required string? BusinessType { get; set; }

    [MinLength(1)]
    [MaxLength(100)]
    public required string? Name { get; set; }

    [MinLength(1)]
    [MaxLength(100)]
    public required string? FiscalAddress { get; set; }

    [MinLength(3)]
    [MaxLength(50)]
    public required string? Email { get; set; }

    // TODO: service addresses

    [MinLength(6)]
    [MaxLength(24)]
    public required string? PhoneNumber { get; set; }
}
