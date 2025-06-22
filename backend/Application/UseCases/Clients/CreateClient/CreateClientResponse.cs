namespace PeruControl.Application.UseCases.Clients.CreateClient;

public class CreateClientResponse
{
    public Guid ClientId { get; set; }
    public string Message { get; set; } = string.Empty;
}
