using System.ComponentModel.DataAnnotations;

namespace PeruControl.Model;

public class Quotation : BaseModel
{
    public Client Client { get; set; } = null!;
}

public class QuotationPatchDTO
{

}
