using System.ComponentModel;
using System.Text.Json.Serialization;

namespace PeruControl.Model;

public class QuotationService : BaseModel
{
    [JsonIgnore]
    public Quotation Quotation { get; set; } = null!;

    [Description("Amount of items")]
    public required string Amount { get; set; }

    [Description("Name and description of the service")]
    public required string NameDescription { get; set; }

    [Description("Price of this service")]
    public decimal? Price { get; set; }

    [Description("Accesories to use for this service")]
    public string? Accesories { get; set; }
}
