using System.ComponentModel.DataAnnotations;

namespace PeruControl.Model;

public class Supply : BaseModel
{
    [MinLength(2)]
    [MaxLength(20)]
    public required string Name { get; set; }

    [MinLength(2)]
    [MaxLength(20)]
    public required string Unit { get; set; }
}

public class SupplyCreateDTO : IMapToEntity<Supply>
{
    [MinLength(2)]
    [MaxLength(20)]
    public required string Name { get; set; }

    [MinLength(1)]
    [MaxLength(20)]
    public required string Unit { get; set; }

    public Supply MapToEntity()
    {
        return new Supply { Name = Name, Unit = Unit };
    }
}

public class SupplyPatchDTO : IEntityPatcher<Supply>
{
    [MinLength(2)]
    [MaxLength(20)]
    public required string Unit { get; set; }

    public void ApplyPatch(Supply entity)
    {
        if (Unit != null)
        {
            entity.Unit = Unit;
        }
    }
}
