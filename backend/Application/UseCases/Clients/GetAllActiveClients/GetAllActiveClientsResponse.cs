namespace PeruControl.Application.UseCases.Clients.GetAllActiveClients;

public class GetAllClientsResponse
{
    public required List<ClientDto> Clients { get; set; }
    public required int TotalCount { get; set; }
}

public class ClientDto
{
    public required Guid Id { get; set; }
    public required int ClientNumber { get; set; }
    public required string DocumentType { get; set; } = string.Empty;
    public required string DocumentValue { get; set; } = string.Empty;
    public required string Name { get; set; } = string.Empty;
    public string? RazonSocial { get; set; }
    public string? BusinessType { get; set; }
    public required string FiscalAddress { get; set; } = string.Empty;
    public required string Email { get; set; } = string.Empty;
    public required string PhoneNumber { get; set; } = string.Empty;
    public string? ContactName { get; set; }
    public required List<ClientLocationDto> Locations { get; set; } = [];
    public required DateTime CreatedAt { get; set; }
    public required DateTime ModifiedAt { get; set; }
    public required bool IsActive { get; set; }
}

public class ClientLocationDto
{
    public Guid Id { get; set; }
    public string Address { get; set; } = string.Empty;
}
