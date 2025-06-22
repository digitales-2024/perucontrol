using PeruControl.Domain.Common;

namespace PeruControl.Domain.ValueObjects;

public class PhoneNumber : ValueObject
{
    public string Value { get; private set; }

    private PhoneNumber(string value)
    {
        Value = value;
    }

    public static Result<PhoneNumber> Create(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return Result.Failure<PhoneNumber>("Phone number cannot be empty");

        if (phoneNumber.Length < 6 || phoneNumber.Length > 24)
            return Result.Failure<PhoneNumber>("Phone number must be between 6 and 24 characters");

        // Remove all non-digit characters for validation
        var digitsOnly = new string(phoneNumber.Where(char.IsDigit).ToArray());
        if (digitsOnly.Length < 6)
            return Result.Failure<PhoneNumber>("Phone number must contain at least 6 digits");

        return Result.Success(new PhoneNumber(phoneNumber));
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}
