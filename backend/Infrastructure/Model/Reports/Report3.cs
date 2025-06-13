using System.ComponentModel.DataAnnotations.Schema;

namespace PeruControl.Infrastructure.Model.Reports;

/// <summary>
/// Informe Desinfeccion Desinsectacion
/// </summary>
public class Report3 : BaseModel
{
    public DateTime? SigningDate { get; set; }

    [Column(TypeName = "jsonb")]
    public List<ContentSection> Content { get; set; } = [];
}
