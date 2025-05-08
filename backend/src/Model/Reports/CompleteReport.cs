using System.ComponentModel.DataAnnotations.Schema;

namespace PeruControl.Model.Reports;

public class CompleteReport : BaseModel
{
    public DateTime? SigningDate { get; set; }

    [Column(TypeName = "jsonb")]
    public List<ContentSection> ContentSection5 { get; set; } = [];

    [Column(TypeName = "jsonb")]
    public List<ContentSection> ContentSection6 { get; set; } = [];

    [Column(TypeName = "jsonb")]
    public List<ContentSection> ContentSection7 { get; set; } = [];

    [Column(TypeName = "jsonb")]
    public List<ContentSection> ContentSection8 { get; set; } = [];

    [Column(TypeName = "jsonb")]
    public List<ContentSection> ContentSection9 { get; set; } = [];
}
