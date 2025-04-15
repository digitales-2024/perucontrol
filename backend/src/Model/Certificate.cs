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

public class CertificateGet: PeruControl.Model.BaseModel
{
    public ProjectAppointment ProjectAppointment { get; set;} = null!;
    public Guid ProjectAppointmentId { get; set; }
    public DateTime ExpirationDate { get; set; }
    public virtual Project Project { get; set; } = null!;
    public virtual Client Client { get; set;} = null!;
    public virtual ICollection<Service> Services { get; set; } = new HashSet<Service>();
}

public static class ServicesConverter
{
    public static (string fumigacion, string desinsectacion, string desratizacion, string desinfeccion, string tanquesElevados, string tanquesCisternas)
    ToCheckbox(this ICollection<Service> services)
    {
        bool Contains(string keyword) =>
            services.Any(s => s.Name.Contains(keyword, StringComparison.OrdinalIgnoreCase));

        return (
            Contains("fumigación") ? "X" : "",
            Contains("desinsectación") ? "X" : "",
            Contains("desratización") ? "X" : "",
            Contains("desinfección") ? "X" : "",
            Contains("tanque elevado") ? "X" : "",
            Contains("cisterna") ? "X" : ""
        );
    }
}
