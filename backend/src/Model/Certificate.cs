using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace PeruControl.Model;

public class Certificate : BaseModel
{
    [JsonIgnore]
    public ProjectAppointment ProjectAppointment { get; set; } = null!;

    [Required]
    public Guid ProjectAppointmentId { get; set; }

    public DateTime? ExpirationDate { get; set; } = null;
}
