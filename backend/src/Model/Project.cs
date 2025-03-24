using System.Text.Json.Serialization;

namespace PeruControl.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ProjectStatus
{
    Pending,
    Approved,
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

    [JsonIgnore]
    public ICollection<Service> Services { get; set; } = new HashSet<Service>();

    [JsonIgnore]
    public Quotation? Quotation { get; set; } = null!;

    public required string Address { get; set; }

    public required uint Area { get; set; }

    public required ProjectStatus Status { get; set; } = ProjectStatus.Pending;

    public required uint SpacesCount { get; set; }

    // Schedule: a list of Appointments
    public ICollection<ProjectAppointment> Appointments { get; set; } =
        new HashSet<ProjectAppointment>();

    // Reference properties
    [JsonIgnore]
    public ICollection<Certificate> Certificates { get; set; } = new HashSet<Certificate>();
}
