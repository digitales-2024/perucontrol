namespace PeruControl.Model;

public class ClientLocation : BaseModel
{
    public virtual Client Client { get; set; } = null!;

    public required string Address { get; set; }
}

public class ClientLocationDTO : IMapToEntity<ClientLocation>
{
    public required string Address { get; set; }

    public ClientLocation MapToEntity()
    {
        return new ClientLocation { Address = Address };
    }
}
