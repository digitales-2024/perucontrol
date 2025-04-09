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
    Fortnightly,
    Monthly,
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
            QuotationFrequency.Monthly => "MENSUALES",
            QuotationFrequency.Fortnightly => "QUINCENALES",
            _ => throw new ArgumentOutOfRangeException(nameof(status), status, null),
        };
    }
}

public class Quotation : BaseModel
{
    [Required]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int QuotationNumber { get; set; }

    [Required(ErrorMessage = "El cliente es obligatorio")]
    public Client Client { get; set; } = null!;

    public ICollection<Service> Services { get; set; } = new HashSet<Service>();

    [Required(ErrorMessage = "El estado de la cotización es obligatorio")]
    public required QuotationStatus Status { get; set; } = QuotationStatus.Pending;

    [Required(ErrorMessage = "La frecuencia es obligatoria")]
    public required QuotationFrequency Frequency { get; set; } = QuotationFrequency.Bimonthly;

    [Range(1, uint.MaxValue, ErrorMessage = "El área debe ser al menos 1")]
    public required uint Area { get; set; }

    [Range(1, uint.MaxValue, ErrorMessage = "Debe ingresar al menos 1 espacio")]
    public required uint SpacesCount { get; set; }

    public required bool HasTaxes { get; set; }

    [Required(ErrorMessage = "La fecha de creación es obligatoria")]
    [DataType(DataType.Date)]
    public required DateTime CreationDate { get; set; }

    [Required(ErrorMessage = "La fecha de expiración es obligatoria")]
    [DataType(DataType.Date)]
    [CustomValidation(typeof(Quotation), nameof(ValidateExpirationDate))]
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

    // [Required(ErrorMessage = "Los terminos y condiciones son obligatorios")]
    // [StringLength(600, ErrorMessage = "Los terminos y condiciones no pueden exceder")]
    // public required string Terms { get; set; }

    [Column(TypeName = "TEXT")]
    public string? CustomField10 { get; set; }

    // Custom validation method
    public static ValidationResult? ValidateExpirationDate(
        DateTime expirationDate,
        ValidationContext context
    )
    {
        var instance = (Quotation)context.ObjectInstance;

        if (expirationDate <= instance.CreationDate)
        {
            return new ValidationResult(
                "La fecha de expiración debe ser posterior a la fecha de creación"
            );
        }

        return ValidationResult.Success;
    }
}
