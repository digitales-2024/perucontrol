using System.ComponentModel;
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

    [StringLength(100, ErrorMessage = "El campo no puede exceder 100 caracteres")]
    public required string Others { get; set; }

    [StringLength(100, ErrorMessage = "El campo no puede exceder 100 caracteres")]
    public required string Availability { get; set; }

    // ======
    // List of services
    // ======

    [Required]
    [MinLength(1, ErrorMessage = "La lista de servicios es obligatoria")]
    public IList<QuotationService> QuotationServices { get; set; } = new List<QuotationService>();

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

    public static (
        string fortnightly,
        string monthly,
        string bimonthly,
        string quarterly,
        string semiannual
    ) GetFrequencyMarkers(this QuotationFrequency frequency)
    {
        string fortnightly = "",
            monthly = "",
            bimonthly = "",
            quarterly = "",
            semiannual = "";

        switch (frequency)
        {
            case QuotationFrequency.Fortnightly:
                fortnightly = "x";
                break;
            case QuotationFrequency.Monthly:
                monthly = "x";
                break;
            case QuotationFrequency.Bimonthly:
                bimonthly = "x";
                break;
            case QuotationFrequency.Quarterly:
                quarterly = "x";
                break;
            case QuotationFrequency.Semiannual:
                semiannual = "x";
                break;
        }

        return (fortnightly, monthly, bimonthly, quarterly, semiannual);
    }
}
