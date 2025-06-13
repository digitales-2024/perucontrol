using System.ComponentModel.DataAnnotations;

namespace PeruControl.Infrastructure.Model;

public class TermsAndConditions : BaseModel
{
    [MinLength(1)]
    [MaxLength(50)]
    public required string Name { get; set; }

    [MinLength(1)]
    [MaxLength(255)]
    public required string Content { get; set; }
}

public class TermsAndConditionsCreateDTO : IMapToEntity<TermsAndConditions>
{
    [MinLength(1)]
    [MaxLength(50)]
    public required string Name { get; set; }

    [MinLength(1)]
    [MaxLength(255)]
    public required string Content { get; set; }

    public TermsAndConditions MapToEntity()
    {
        return new TermsAndConditions { Name = Name, Content = Content };
    }
}

public class TermsAndConditionsPatchDTO : IEntityPatcher<TermsAndConditions>
{
    [MinLength(1)]
    [MaxLength(50)]
    public string? Name { get; set; }

    [MinLength(1)]
    [MaxLength(255)]
    public string? Content { get; set; }

    public void ApplyPatch(TermsAndConditions entity)
    {
        if (Name != null)
        {
            entity.Name = Name;
        }
        if (Content != null)
        {
            entity.Content = Content;
        }
    }
}
