using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PeruControl.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum QuotationStatus
{
    Pending,
    Approved,
    Rejected,
}

public class Quotation : BaseModel
{
    public virtual Client Client { get; set; } = null!;

    public virtual ICollection<Service> Services { get; set; } = new HashSet<Service>();

    public required QuotationStatus Status { get; set; } = QuotationStatus.Pending;

    public required string Description { get; set; }

    [Range(1, uint.MaxValue, ErrorMessage = "El área debe ser al menos 1")]
    public required uint Area { get; set; }

    [Range(1, uint.MaxValue, ErrorMessage = "Debe ingresar al menos 1 espacio")]
    public required uint SpacesCount { get; set; }

    public required bool HasTaxes { get; set; }

    /// <summary>
    /// This is a COPY of the terms and conditions selected by the user,
    /// this way the T&C in the database can be safely edited,
    /// and used ones in the quotations wont be affected
    /// </summary>
    [Column(TypeName = "TEXT")]
    public required string TermsAndConditions { get; set; }
}

public class QuotationCreateDTO : IMapToEntity<Quotation>
{
    public required Guid ClientId { get; set; }

    [MinLength(1)]
    public required ICollection<Guid> ServiceIds { get; set; }

    public required string Description { get; set; }

    [Range(1, uint.MaxValue, ErrorMessage = "El área debe ser al menos 1")]
    public required uint Area { get; set; }

    [Range(1, uint.MaxValue, ErrorMessage = "Debe ingresar al menos 1 espacio")]
    public required uint SpacesCount { get; set; }
    public required bool HasTaxes { get; set; }
    public required string TermsAndConditions { get; set; }

    public Quotation MapToEntity()
    {
        return new Quotation
        {
            Description = Description,
            Status = QuotationStatus.Pending,
            Area = Area,
            SpacesCount = SpacesCount,
            HasTaxes = HasTaxes,
            TermsAndConditions = TermsAndConditions,
        };
    }
}

public class QuotationPatchDTO : IEntityPatcher<Quotation>
{
    public ICollection<Guid>? ServiceIds { get; set; }
    public string? Description { get; set; }
    public uint? Area { get; set; }
    public uint? SpacesCount { get; set; }
    public bool? HasTaxes { get; set; }

    public void ApplyPatch(Quotation entity)
    {
        if (Description != null) entity.Description = Description;
        if (Area != null) entity.Area = (uint)Area;
        if (SpacesCount != null) entity.SpacesCount = (uint)SpacesCount;
        if (HasTaxes != null) entity.HasTaxes = (bool)HasTaxes;
    }
}
