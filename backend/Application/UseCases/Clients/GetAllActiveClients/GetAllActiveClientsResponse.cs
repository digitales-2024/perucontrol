namespace PeruControl.Application.UseCases.Clients.GetAllActiveClients;

public class GetAllActiveClientsResponse
{
    public List<ClientDto> Clients { get; set; } = [];
    public int TotalCount { get; set; }
}

public class ClientDto
{
    public Guid Id { get; set; }
    public int ClientNumber { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public string DocumentValue { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? RazonSocial { get; set; }
    public string? BusinessType { get; set; }
    public string FiscalAddress { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? ContactName { get; set; }
    public List<ClientLocationDto> Locations { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime ModifiedAt { get; set; }
}

public class ClientLocationDto
{
    public Guid Id { get; set; }
    public string Address { get; set; } = string.Empty;
}
