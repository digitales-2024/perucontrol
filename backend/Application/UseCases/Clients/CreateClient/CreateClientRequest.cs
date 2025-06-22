namespace PeruControl.Application.UseCases.Clients.CreateClient;

public class CreateClientRequest
{
    public string DocumentType { get; set; } = string.Empty;
    public string DocumentValue { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string FiscalAddress { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? RazonSocial { get; set; }
    public string? BusinessType { get; set; }
    public string? ContactName { get; set; }
    public List<string>? Locations { get; set; }
}
