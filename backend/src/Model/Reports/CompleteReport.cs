using System.ComponentModel.DataAnnotations.Schema;

namespace PeruControl.Model.Reports;

public class CompleteReport : BaseModel
{
    public required DateTime SigningDate { get; set; }

    [Column(TypeName = "jsonb")]
    public required ContentSection ContentSection5 { get; set; }

    [Column(TypeName = "jsonb")]
    public required ContentSection ContentSection6 { get; set; }

    [Column(TypeName = "jsonb")]
    public required ContentSection ContentSection7 { get; set; }

    [Column(TypeName = "jsonb")]
    public required ContentSection ContentSection8 { get; set; }

    [Column(TypeName = "jsonb")]
    public required ContentSection ContentSection9 { get; set; }
}
