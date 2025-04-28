using System.ComponentModel;
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
    public required IList<QuotationService> QuotationServices { get; set; }

    public string? Desinsectant { get; set; }
    public string? Derodent { get; set; }
    public string? Disinfectant { get; set; }

    public required IList<string> TermsAndConditions { get; set; }

    // public required string Terms { get; set; }
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

    public required QuotationFrequency Frequency { get; set; }

    public required bool HasTaxes { get; set; }

    public required DateTime CreationDate { get; set; }

    public required DateTime ExpirationDate { get; set; }

    [Required(ErrorMessage = "La dirección del servicio es obligatoria")]
    [StringLength(200, ErrorMessage = "La dirección no puede exceder 200 caracteres")]
    public required string ServiceAddress { get; set; }

    [Required(ErrorMessage = "El método de pago es obligatorio")]
    [StringLength(100, ErrorMessage = "El método de pago no puede exceder 100 caracteres")]
    public required string PaymentMethod { get; set; }

    [StringLength(100, ErrorMessage = "El campo no puede exceder 100 caracteres")]
    public required string Others { get; set; }

    [StringLength(100, ErrorMessage = "La Disponibilidad no puede exceder 100 caracteres")]
    public required string Availability { get; set; }

    // ======
    // List of services
    // ======

    [MinLength(1, ErrorMessage = "La lista de servicios es obligatoria")]
    public required IList<QuotationServiceCreateDTO> QuotationServices { get; set; }

    // ======
    // Products to use
    // ======

    [Description("Name and description of the Desinsectant to use")]
    public string? Desinsectant { get; set; }

    [Description("Name and description of the Rodenticide to use")]
    public string? Derodent { get; set; }

    [Description("Name and description of the Disinfectant to use")]
    public string? Disinfectant { get; set; }

    // ======
    // Terms and Conditions
    // ======

    [MinLength(1, ErrorMessage = "La lista de términos y condiciones es obligatoria")]
    [MaxLength(10, ErrorMessage = "Solo puede haber hasta 10 términos y condiciones")]
    public IList<string> TermsAndConditions { get; set; } = new List<string>();

    public Quotation MapToEntity() =>
        new()
        {
            Status = QuotationStatus.Pending,
            Frequency = Frequency,
            HasTaxes = HasTaxes,
            CreationDate = CreationDate.ToUniversalTime(),
            ExpirationDate = ExpirationDate.ToUniversalTime(),
            ServiceAddress = ServiceAddress,
            PaymentMethod = PaymentMethod,
            Others = Others,
            Availability = Availability,
            Desinsectant = Desinsectant,
            Derodent = Derodent,
            Disinfectant = Disinfectant,
        };
}

public class QuotationServiceCreateDTO
{
    [Description("Amount of items")]
    public required int Amount { get; set; }

    [Description("Name and description of the service")]
    public required string NameDescription { get; set; }

    [Description("Price of this service")]
    public decimal? Price { get; set; }

    [Description("Accesories to use for this service")]
    public string? Accesories { get; set; }
}

public class QuotationPatchDTO : IEntityPatcher<Quotation>
{
    public Guid? ClientId { get; set; }
    public ICollection<Guid>? ServiceIds { get; set; }
    public QuotationFrequency? Frequency { get; set; }
    public bool? HasTaxes { get; set; }

    public DateTime? CreationDate { get; set; }
    public DateTime? ExpirationDate { get; set; }

    public string? ServiceAddress { get; set; }
    public string? PaymentMethod { get; set; }
    public string? Others { get; set; }
    public string? Availability { get; set; }

    // requires diffing
    public IList<QuotationServicePatchDTO>? QuotationServices { get; set; }

    public void ApplyPatch(Quotation entity)
    {
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
        if (Availability != null)
            entity.Availability = Availability;
    }
}

public class QuotationServicePatchDTO
{
    public required Guid Id { get; set; }

    [Description("Amount of items")]
    public required int Amount { get; set; }

    [Description("Name and description of the service")]
    public required string NameDescription { get; set; }

    [Description("Price of this service")]
    public decimal? Price { get; set; }

    [Description("Accesories to use for this service")]
    public string? Accesories { get; set; }
}

public class QuotationStatusPatchDTO
{
    public required QuotationStatus Status { get; set; }
}
