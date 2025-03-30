using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using PeruControl.Model;

namespace PeruControl.Controllers;

public class QuotationGetDTO : PeruControl.Model.BaseModel
{
    public virtual ClientGetDTO Client { get; set; } = null!;
    public virtual ICollection<Service> Services { get; set; } = new HashSet<Service>();
    public required QuotationFrequency Frequency { get; set; } = QuotationFrequency.Bimonthly;
    public required QuotationStatus Status { get; set; } = QuotationStatus.Pending;
    public required uint Area { get; set; }
    public required uint SpacesCount { get; set; }
    public required bool HasTaxes { get; set; }
    public required string TermsAndConditions { get; set; }
    public required DateTime CreationDate { get; set; }
    public required DateTime ExpirationDate { get; set; }
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
    public required string ContactName { get; set; }
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

public class QuotationExportDto
{
    public required string Deliverables { get; set; }
}

public class QuotationCreateDTO : IMapToEntity<Quotation>
{
    public required Guid ClientId { get; set; }

    [MinLength(1)]
    public required ICollection<Guid> ServiceIds { get; set; }

    [Range(1, uint.MaxValue, ErrorMessage = "El área debe ser al menos 1")]
    public required uint Area { get; set; }

    [Range(1, uint.MaxValue, ErrorMessage = "Debe ingresar al menos 1 espacio")]
    public required uint SpacesCount { get; set; }

    public required QuotationFrequency Frequency { get; set; }

    public required bool HasTaxes { get; set; }
    public required string TermsAndConditions { get; set; }

    public required DateTime CreationDate { get; set; }

    public required DateTime ExpirationDate { get; set; }

    public Quotation MapToEntity()
    {
        return new Quotation
        {
            Status = QuotationStatus.Pending,
            Frequency = Frequency,
            Area = Area,
            SpacesCount = SpacesCount,
            HasTaxes = HasTaxes,
            TermsAndConditions = TermsAndConditions,
            CreationDate = CreationDate.ToUniversalTime(),
            ExpirationDate = ExpirationDate.ToUniversalTime(),
        };
    }
}

public class QuotationPatchDTO : IEntityPatcher<Quotation>
{
    public Guid? ClientId { get; set; }
    public ICollection<Guid>? ServiceIds { get; set; }
    public uint? Area { get; set; }
    public uint? SpacesCount { get; set; }
    public QuotationFrequency? Frequency { get; set; }
    public bool? HasTaxes { get; set; }

    [Column(TypeName = "TEXT")]
    public string? TermsAndConditions { get; set; }

    public DateTime? CreationDate { get; set; }

    public DateTime? ExpirationDate { get; set; }

    public void ApplyPatch(Quotation entity)
    {
        if (Area != null)
            entity.Area = (uint)Area;
        if (SpacesCount != null)
            entity.SpacesCount = (uint)SpacesCount;
        if (HasTaxes != null)
            entity.HasTaxes = (bool)HasTaxes;
        if (TermsAndConditions != null)
            entity.TermsAndConditions = TermsAndConditions;
        if (Frequency != null)
            entity.Frequency = Frequency.Value;
        if (CreationDate != null)
            entity.CreationDate = CreationDate.Value.ToUniversalTime();
        if (ExpirationDate != null)
            entity.ExpirationDate = ExpirationDate.Value.ToUniversalTime();
    }
}

public class QuotationStatusPatchDTO
{
    public required QuotationStatus Status { get; set; }
}
