using System.ComponentModel.DataAnnotations.Schema;

namespace PeruControl.Model.Reports;

/// <summary>
/// Informe Sostenimiento Desratización
/// </summary>
public class Report4 : BaseModel
{
    public DateTime? SigningDate { get; set; }

    [Column(TypeName = "jsonb")]
    public List<ContentSection> Content { get; set; } = [];
}
