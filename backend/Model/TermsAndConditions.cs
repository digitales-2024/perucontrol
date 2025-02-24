using System.ComponentModel.DataAnnotations;

namespace PeruControl.Model;

public class TermsAndConditions : BaseModel
{
    [MinLength(1)]
    [MaxLength(50)]
    public required string Name { get; set; }

    [MinLength(1)]
    [MaxLength(255)]
    public required string Content { get; set; }
}

public class TermsAndConditionsPatchDTO
{
    [MinLength(1)]
    [MaxLength(50)]
    public string? Name { get; set; }

    [MinLength(1)]
    [MaxLength(255)]
    public string? Content { get; set; }
}
