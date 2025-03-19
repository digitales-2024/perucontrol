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
    public virtual Project Project { get; set; } = null!;

    public required string TreatedArea { get; set; }
    public required DateTime CreationDate { get; set; }
    public required DateTime ExpirationDate { get; set; }
}
