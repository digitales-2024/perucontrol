using PeruControl.Domain.Common;
using PeruControl.Domain.ValueObjects;

namespace PeruControl.Domain.Entities;

public class Client : BaseEntity, IAggregateRoot
{
    // ClientNumber is set by the database after insert
    private int? _clientNumber;
    public int ClientNumber =>
        _clientNumber
        ?? throw new InvalidOperationException("Client must be saved to database first");

    public DocumentInfo DocumentInfo { get; private set; } = null!;
    public string? RazonSocial { get; private set; }
    public string? BusinessType { get; private set; }
    public string Name { get; private set; } = null!;
    public Address FiscalAddress { get; private set; } = null!;
    public Email Email { get; private set; } = null!;
    public PhoneNumber PhoneNumber { get; private set; } = null!;
    public string? ContactName { get; private set; }

    private readonly List<ClientLocation> _locations = [];
    public IReadOnlyList<ClientLocation> Locations => _locations.AsReadOnly();

    // Private constructor for EF Core
    private Client() { }

    // Factory method for creating new clients
    public static Result<Client> Create(
        string typeDocument,
        string typeDocumentValue,
        string name,
        string fiscalAddress,
        string email,
        string phoneNumber,
        string? razonSocial = null,
        string? businessType = null,
        string? contactName = null
    )
    {
        // Business validation here
        var documentResult = DocumentInfo.Create(typeDocument, typeDocumentValue);
        if (documentResult.IsFailure)
            return Result.Failure<Client>(documentResult.Error);

        var emailResult = Email.Create(email);
        if (emailResult.IsFailure)
            return Result.Failure<Client>(emailResult.Error);

        var phoneResult = PhoneNumber.Create(phoneNumber);
        if (phoneResult.IsFailure)
            return Result.Failure<Client>(phoneResult.Error);

        var addressResult = Address.Create(fiscalAddress);
        if (addressResult.IsFailure)
            return Result.Failure<Client>(addressResult.Error);

        var client = new Client
        {
            DocumentInfo = documentResult.Value,
            Name = name,
            FiscalAddress = addressResult.Value,
            Email = emailResult.Value,
            PhoneNumber = phoneResult.Value,
            RazonSocial = razonSocial,
            BusinessType = businessType,
            ContactName = contactName,
            // _clientNumber remains null until database assigns it
        };

        return Result.Success(client);
    }

    public Result AddLocation(string address)
    {
        var locationResult = ClientLocation.Create(address);
        if (locationResult.IsFailure)
            return Result.Failure(locationResult.Error);

        _locations.Add(locationResult.Value);
        UpdateModifiedAt();

        return Result.Success();
    }

    public Result RemoveLocation(Guid locationId)
    {
        var location = _locations.FirstOrDefault(l => l.Id == locationId);
        if (location == null)
            return Result.Failure("Location not found");

        _locations.Remove(location);
        UpdateModifiedAt();

        return Result.Success();
    }

    public void UpdateContactInfo(string? contactName, string? businessType)
    {
        ContactName = contactName;
        BusinessType = businessType;
        UpdateModifiedAt();
    }
}
