using System.ComponentModel.DataAnnotations.Schema;

namespace PeruControl.Model.Reports;

public class CompleteReport : BaseModel
{
    public DateTime? SigningDate { get; set; }

    [Column(TypeName = "jsonb")]
    public List<ContentSection> Content { get; set; } = [];
}
