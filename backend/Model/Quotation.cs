using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PeruControl.Model;

public class Quotation : BaseModel
{
    public virtual Client Client { get; set; } = null!;

    /*public Service Service { get; set; } = null!;*/

    public required string Description { get; set; }

    [Range(1, uint.MaxValue, ErrorMessage = "El área debe ser al menos 1")]
    public required uint Area { get; set; }

    [Range(1, uint.MaxValue, ErrorMessage = "Debe ingresar al menos 1 espacio")]
    public required uint SpacesCount { get; set; }

    public required bool HasTaxes { get; set; }

    /// <summary>
    /// This is a COPY of the terms and conditions selected by the user,
    /// this way the T&C in the database can be safely edited,
    /// and used ones in the quotations wont be affected
    /// </summary>
    [Column(TypeName = "TEXT")]
    public required string TermsAndConditions { get; set; }
}

public class QuotationCreateDTO : IMapToEntity<Quotation>
{
    public required int ClientId { get; set; }
    public required string Description { get; set; }
    [Range(1, uint.MaxValue, ErrorMessage = "El área debe ser al menos 1")]
    public required uint Area { get; set; }
    [Range(1, uint.MaxValue, ErrorMessage = "Debe ingresar al menos 1 espacio")]
    public required uint SpacesCount { get; set; }
    public required bool HasTaxes { get; set; }
    public required string TermsAndConditions { get; set; }

    public Quotation MapToEntity()
    {
        throw new NotImplementedException();
    }
}

public class QuotationPatchDTO : IEntityPatcher<Quotation>
{
    public string? Description { get; set; }
    public int? Area { get; set; }
    public int? SpacesCount { get; set; }
    public bool? HasTaxes { get; set; }

    public void ApplyPatch(Quotation entity)
    {
        throw new NotImplementedException();
    }
}
