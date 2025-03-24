using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PeruControl.Model;

/// Just stores a number that is used to order appointments across projects.
public class ProjectOrderNumber
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public required int ProjectOrderNumberId { get; set; }

    public required int ProjectOrderNumberValue { get; set; }
}
