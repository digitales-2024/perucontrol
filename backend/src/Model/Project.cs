using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PeruControl.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ProjectStatus
{
    Pending,
    Completed,
    Rejected,
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum InfestationDegree
{
    High,
    Moderate,
    Low,
    Negligible,
}

public class Project : BaseModel
{
    [JsonIgnore]
    public Client Client { get; set; } = null!;

    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ProjectNumber { get; set; }

    [JsonIgnore]
    public ICollection<Service> Services { get; set; } = new HashSet<Service>();

    [JsonIgnore]
    public Quotation? Quotation { get; set; } = null!;

    public required string Address { get; set; }

    public required uint Area { get; set; }

    public required ProjectStatus Status { get; set; } = ProjectStatus.Pending;

    public required uint SpacesCount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    [Range(
        0,
        9999999.99,
        ErrorMessage = "El precio debe ser un valor positivo y no mayor a 9,999,999.99"
    )]
    public required decimal Price { get; set; }

    // Schedule: a list of Appointments
    [JsonIgnore]
    public ICollection<ProjectAppointment> Appointments { get; set; } =
        new HashSet<ProjectAppointment>();
}
