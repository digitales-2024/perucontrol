using PeruControl.Model;

namespace PeruControl.Controllers;

public class QuotationGetDTO : PeruControl.Model.BaseModel
{
    public virtual ClientGetDTO Client { get; set; } = null!;
    public virtual ServiceGetDTO Service { get; set; } = null!;
    public required string Description { get; set; }
    public required QuotationStatus Status { get; set; } = QuotationStatus.Pending;
    public required uint Area { get; set; }
    public required uint SpacesCount { get; set; }
    public required bool HasTaxes { get; set; }
    public required string TermsAndConditions { get; set; }
}

public class ClientGetDTO : PeruControl.Model.BaseModel
{
    public required string TypeDocument { get; set; }
    public required string TypeDocumentValue { get; set; }
    public string? RazonSocial { get; set; }
    public required string BusinessType { get; set; }
    public required string Name { get; set; }
    public required string FiscalAddress { get; set; }
    public required string Email { get; set; }
    public required string PhoneNumber { get; set; }
    public required ICollection<ClientLocation> ClientLocations { get; set; } =
        new List<ClientLocation>();
}

public class ServiceGetDTO : PeruControl.Model.BaseModel
{
    public required string Name { get; set; }
}

public class QuotationSummary
{
    public virtual Client Client { get; set; } = null!;

    public virtual ICollection<Service> Services { get; set; } = new HashSet<Service>();

    public required uint Area { get; set; }

    public uint? SpacesCount { get; set; }
}
