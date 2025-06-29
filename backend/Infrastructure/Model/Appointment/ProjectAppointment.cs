using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PeruControl.Infrastructure.Model;

public class ProjectAppointment : BaseModel
{
    [Required]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int AppointmentNumber { get; set; }

    [JsonIgnore]
    public Project Project { get; set; } = null!;

    /// This value must keep relation with order numbers across many appointments, across many different projects.
    /// On initial creation, this value is null, and it must be set when the appointment
    /// is performed.
    /// This number is taken from the ProjectOrderNumber entity.
    public int? CertificateNumber { get; set; } = null;

    /// All the data linked to the appointment.
    [JsonIgnore]
    public ProjectOperationSheet ProjectOperationSheet { get; set; } = null!;

    /// All the data linked to the appointment.
    [JsonIgnore]
    public RodentRegister RodentRegister { get; set; } = null!;

    // hora_ingreso
    public TimeOnly? EnterTime { get; set; }

    // hora_salida
    public TimeOnly? LeaveTime { get; set; }

    /// The date by which the appointment should be performed
    public required DateTime DueDate { get; set; }

    /// The actual date the appointment was performed
    public DateTime? ActualDate { get; set; }

    /// Represents that the appointment was not performed
    public bool Cancelled { get; set; } = false;

    /// Representante de la empresa
    public string? CompanyRepresentative { get; set; } = null;

    /// Services performed on this appointment
    [JsonIgnore]
    public ICollection<Service> Services { get; set; } = new HashSet<Service>();

    [JsonIgnore]
    public Certificate Certificate { get; set; } = null!;

    // List of products used in the appointment
    [JsonIgnore]
    public IList<TreatmentProduct> TreatmentProducts { get; set; } = [];

    // List of treated areas
    [JsonIgnore]
    public IList<TreatmentArea> TreatmentAreas { get; set; } = [];

    // Identificador de mapa murino en R2
    public string? MurinoMapKey { get; set; }
    public string? MurinoMapUrl { get; set; }

    //
    // Reports
    //
    public Reports.CompleteReport CompleteReport { get; set; } = new();
    public Reports.Report1 Report1 { get; set; } = new();
    public Reports.Report2 Report2 { get; set; } = new();
    public Reports.Report3 Report3 { get; set; } = new();
    public Reports.Report4 Report4 { get; set; } = new();
}
