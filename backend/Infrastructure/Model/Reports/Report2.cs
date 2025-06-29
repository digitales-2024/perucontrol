using System.ComponentModel.DataAnnotations.Schema;

namespace PeruControl.Infrastructure.Model.Reports;

public class Report2 : BaseModel
{
    public DateTime? SigningDate { get; set; }

    [Column(TypeName = "jsonb")]
    public List<ContentSection> Content { get; set; } = [];
}
