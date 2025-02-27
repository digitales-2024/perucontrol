using System.ComponentModel.DataAnnotations;

namespace PeruControl.Model;

public class Service : BaseModel
{
    public required string Name { get; set; }
}

public class ServicePatchDTO
{

}
