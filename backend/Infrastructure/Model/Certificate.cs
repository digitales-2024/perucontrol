using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PeruControl.Infrastructure.Model;

public class Certificate : BaseModel
{
    [JsonIgnore]
    public ProjectAppointment ProjectAppointment { get; set; } = null!;

    [Required]
    public Guid ProjectAppointmentId { get; set; }

    public DateTime? ExpirationDate { get; set; } = null;
}

public class CertificateGet : PeruControl.Infrastructure.Model.BaseModel
{
    public ProjectAppointment ProjectAppointment { get; set; } = null!;
    public Guid ProjectAppointmentId { get; set; }
    public DateTime ExpirationDate { get; set; }
    public virtual Project Project { get; set; } = null!;
    public virtual Client Client { get; set; } = null!;
    public virtual ICollection<Service> Services { get; set; } = new HashSet<Service>();
}
