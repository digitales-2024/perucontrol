using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using PeruControl.Model;

namespace PeruControl.Controllers;

public class QuotationGetDTO : PeruControl.Model.BaseModel
{
    public int QuotationNumber { get; set; }
    public virtual ClientGetDTO Client { get; set; } = null!;
    public virtual ICollection<Service> Services { get; set; } = new HashSet<Service>();
    public required QuotationFrequency Frequency { get; set; } = QuotationFrequency.Bimonthly;
    public required QuotationStatus Status { get; set; } = QuotationStatus.Pending;
    public required uint Area { get; set; }
    public required uint SpacesCount { get; set; }
    public required bool HasTaxes { get; set; }
    public required DateTime CreationDate { get; set; }
    public required DateTime ExpirationDate { get; set; }
    public required string ServiceAddress { get; set; }
    public required string PaymentMethod { get; set; }
    public required string Others { get; set; }
    public required string ServiceListText { get; set; }
    public required string ServiceDescription { get; set; }
    public required string ServiceDetail { get; set; }
    public required decimal Price { get; set; }
    public required string RequiredAvailability { get; set; }
    public required string ServiceTime { get; set; }
    public required string CustomField6 { get; set; }
    public required string TreatedAreas { get; set; }
    public required string Deliverables { get; set; }
    public string? CustomField10 { get; set; }
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

    [Required(ErrorMessage = "La dirección del servicio es obligatoria")]
    [StringLength(200, ErrorMessage = "La dirección no puede exceder 200 caracteres")]
    public required string ServiceAddress { get; set; }

    [Required(ErrorMessage = "El método de pago es obligatorio")]
    [StringLength(100, ErrorMessage = "El método de pago no puede exceder 100 caracteres")]
    public required string PaymentMethod { get; set; }

    [StringLength(500, ErrorMessage = "El campo no puede exceder 500 caracteres")]
    public required string Others { get; set; }

    [Required(ErrorMessage = "La lista de servicios es obligatoria")]
    [StringLength(1000, ErrorMessage = "La lista de servicios no puede exceder 1000 caracteres")]
    public required string ServiceListText { get; set; }

    [Required(ErrorMessage = "La descripción del servicio es obligatoria")]
    [StringLength(500, ErrorMessage = "La descripción no puede exceder 500 caracteres")]
    public required string ServiceDescription { get; set; }

    [Required(ErrorMessage = "El detalle del servicio es obligatorio")]
    [StringLength(1000, ErrorMessage = "El detalle no puede exceder 1000 caracteres")]
    public required string ServiceDetail { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    [Range(
        0,
        9999999.99,
        ErrorMessage = "El precio debe ser un valor positivo y no mayor a 9,999,999.99"
    )]
    public required decimal Price { get; set; }

    [Required(ErrorMessage = "La disponibilidad requerida es obligatoria")]
    [StringLength(200, ErrorMessage = "La disponibilidad no puede exceder 200 caracteres")]
    public required string RequiredAvailability { get; set; }

    [Required(ErrorMessage = "El tiempo de servicio es obligatorio")]
    [StringLength(100, ErrorMessage = "El tiempo de servicio no puede exceder 100 caracteres")]
    public required string ServiceTime { get; set; }

    [StringLength(255, ErrorMessage = "El campo no puede exceder 255 caracteres")]
    public required string CustomField6 { get; set; }

    [Required(ErrorMessage = "Las áreas tratadas son obligatorias")]
    [StringLength(500, ErrorMessage = "Las áreas tratadas no pueden exceder 500 caracteres")]
    public required string TreatedAreas { get; set; }

    [Required(ErrorMessage = "Los entregables son obligatorios")]
    [StringLength(500, ErrorMessage = "Los entregables no pueden exceder 500 caracteres")]
    public required string Deliverables { get; set; }

    [Column(TypeName = "TEXT")]
    public string? CustomField10 { get; set; }

    public Quotation MapToEntity()
    {
        return new Quotation
        {
            Status = QuotationStatus.Pending,
            Frequency = Frequency,
            Area = Area,
            SpacesCount = SpacesCount,
            HasTaxes = HasTaxes,
            CreationDate = CreationDate.ToUniversalTime(),
            ExpirationDate = ExpirationDate.ToUniversalTime(),
            ServiceAddress = ServiceAddress,
            PaymentMethod = PaymentMethod,
            Others = Others,
            ServiceListText = ServiceListText,
            ServiceDescription = ServiceDescription,
            ServiceDetail = ServiceDetail,
            Price = Price,
            RequiredAvailability = RequiredAvailability,
            ServiceTime = ServiceTime,
            CustomField6 = CustomField6,
            TreatedAreas = TreatedAreas,
            Deliverables = Deliverables,
            CustomField10 = CustomField10,
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

    public string? ServiceAddress { get; set; }
    public string? PaymentMethod { get; set; }
    public string? Others { get; set; }
    public string? ServiceListText { get; set; }
    public string? ServiceDescription { get; set; }
    public string? ServiceDetail { get; set; }
    public decimal? Price { get; set; }
    public string? RequiredAvailability { get; set; }
    public string? ServiceTime { get; set; }
    public string? CustomField6 { get; set; }
    public string? TreatedAreas { get; set; }
    public string? Deliverables { get; set; }
    public string? CustomField10 { get; set; }

    public void ApplyPatch(Quotation entity)
    {
        if (Area != null)
            entity.Area = (uint)Area;
        if (SpacesCount != null)
            entity.SpacesCount = (uint)SpacesCount;
        if (HasTaxes != null)
            entity.HasTaxes = (bool)HasTaxes;
        if (Frequency != null)
            entity.Frequency = Frequency.Value;
        if (CreationDate != null)
            entity.CreationDate = CreationDate.Value.ToUniversalTime();
        if (ExpirationDate != null)
            entity.ExpirationDate = ExpirationDate.Value.ToUniversalTime();
        if (ServiceAddress != null)
            entity.ServiceAddress = ServiceAddress;
        if (PaymentMethod != null)
            entity.PaymentMethod = PaymentMethod;
        if (Others != null)
            entity.Others = Others;
        if (ServiceListText != null)
            entity.ServiceListText = ServiceListText;
        if (ServiceDescription != null)
            entity.ServiceDescription = ServiceDescription;
        if (ServiceDetail != null)
            entity.ServiceDetail = ServiceDetail;
        if (Price != null)
            entity.Price = Price.Value;
        if (RequiredAvailability != null)
            entity.RequiredAvailability = RequiredAvailability;
        if (ServiceTime != null)
            entity.ServiceTime = ServiceTime;
        if (CustomField6 != null)
            entity.CustomField6 = CustomField6;
        if (TreatedAreas != null)
            entity.TreatedAreas = TreatedAreas;
        if (Deliverables != null)
            entity.Deliverables = Deliverables;
        if (CustomField10 != null)
            entity.CustomField10 = CustomField10;
    }
}

public class QuotationStatusPatchDTO
{
    public required QuotationStatus Status { get; set; }
}
