using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PeruControl.Model;

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

    /// The date by which the appointment should be performed
    public required DateTime DueDate { get; set; }

    /// The actual date the appointment was performed
    public DateTime? ActualDate { get; set; }

    /// Services performed on this appointment
    [JsonIgnore]
    public ICollection<Service> Services { get; set; } = new HashSet<Service>();    

    [JsonIgnore]
    public Certificate Certificate { get; set; } = null!;
}
