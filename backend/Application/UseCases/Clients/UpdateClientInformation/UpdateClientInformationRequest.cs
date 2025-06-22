namespace PeruControl.Application.UseCases.Clients.UpdateClientInformation;

public class UpdateClientInformationRequest
{
    public Guid ClientId { get; set; }
    public string? Name { get; set; }
    public string? RazonSocial { get; set; }
    public string? BusinessType { get; set; }
    public string? ContactName { get; set; }
    public string? DocumentType { get; set; }
    public string? DocumentValue { get; set; }
    public string? FiscalAddress { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public List<LocationUpdateDto>? Locations { get; set; }
}

public class LocationUpdateDto
{
    public Guid? Id { get; set; }
    public string Address { get; set; } = string.Empty;
}
