namespace PeruControl.Model;

public class ClientLocation : BaseModel
{
    public Client Client { get; set; } = null!;

    public required string Address { get; set; }
}
