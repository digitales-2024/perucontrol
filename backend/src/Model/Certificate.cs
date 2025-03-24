using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace PeruControl.Model;

public class Certificate : BaseModel
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Required]
    public int ProjectNumber { get; set; }

    [JsonIgnore]
    public ProjectAppointment ProjectAppointment { get; set; } = null!;

    [Required]
    public Guid ProjectAppointmentId { get; set; }

    public required string TreatedArea { get; set; }
    public required DateTime CreationDate { get; set; }
    public required DateTime ExpirationDate { get; set; }
}
