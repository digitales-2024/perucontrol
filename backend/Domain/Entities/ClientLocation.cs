using PeruControl.Domain.Common;
using PeruControl.Domain.ValueObjects;

namespace PeruControl.Domain.Entities;

public class ClientLocation : BaseEntity
{
    public Address Address { get; private set; }

    // Private constructor for EF Core
    private ClientLocation() { }

    // Constructor for domain logic
    internal ClientLocation(Address address)
    {
        Address = address;
    }

    public static Result<ClientLocation> Create(string address)
    {
        var addressResult = Address.Create(address);
        if (addressResult.IsFailure)
            return Result.Failure<ClientLocation>(addressResult.Error);

        return Result.Success(new ClientLocation(addressResult.Value));
    }

    public Result UpdateAddress(string newAddress)
    {
        var addressResult = Address.Create(newAddress);
        if (addressResult.IsFailure)
            return Result.Failure(addressResult.Error);

        Address = addressResult.Value;
        UpdateModifiedAt();
        
        return Result.Success();
    }
} 