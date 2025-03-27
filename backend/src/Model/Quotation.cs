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

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum QuotationFrequency
{
    Bimonthly,
    Quarterly,
    Semiannual,
}

public static class QuotationFrequencyExtensions
{
    public static string ToSpanishString(this QuotationFrequency status)
    {
        return status switch
        {
            QuotationFrequency.Bimonthly => "BIMENSUALES",
            QuotationFrequency.Quarterly => "TRIMESTRALES",
            QuotationFrequency.Semiannual => "SEMESTRALES",
            _ => throw new ArgumentOutOfRangeException(nameof(status), status, null),
        };
    }
}

public class Quotation : BaseModel
{
    [Required]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int QuotationNumber { get; set; }

    public Client Client { get; set; } = null!;

    public ICollection<Service> Services { get; set; } = new HashSet<Service>();

    public required QuotationStatus Status { get; set; } = QuotationStatus.Pending;

    public required QuotationFrequency Frequency { get; set; } = QuotationFrequency.Bimonthly;

    [Range(1, uint.MaxValue, ErrorMessage = "El área debe ser al menos 1")]
    public required uint Area { get; set; }

    [Range(1, uint.MaxValue, ErrorMessage = "Debe ingresar al menos 1 espacio")]
    public required uint SpacesCount { get; set; }

    public required bool HasTaxes { get; set; }

    public required DateTime CreationDate { get; set; }

    public required DateTime ExpirationDate { get; set; }

    [Column(TypeName = "TEXT")]
    public required string TermsAndConditions { get; set; }
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
