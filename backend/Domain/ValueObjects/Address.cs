using PeruControl.Domain.Common;

namespace PeruControl.Domain.ValueObjects;

public class Address : ValueObject
{
    public string Value { get; private set; }

    private Address(string value)
    {
        Value = value;
    }

    public static Result<Address> Create(string address)
    {
        if (string.IsNullOrWhiteSpace(address))
            return Result.Failure<Address>("Address cannot be empty");

        if (address.Length < 1 || address.Length > 250)
            return Result.Failure<Address>("Address must be between 1 and 250 characters");

        return Result.Success(new Address(address.Trim()));
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}
