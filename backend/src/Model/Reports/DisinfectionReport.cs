using System.ComponentModel.DataAnnotations.Schema;

namespace PeruControl.Model.Reports;

public class DisinfectionReport : BaseModel
{
    [Column(TypeName = "jsonb")]
    public required ContentSection ContentSection { get; set; }
}
