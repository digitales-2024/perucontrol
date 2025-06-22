using PeruControl.Domain.Common;
using System.Text.RegularExpressions;

namespace PeruControl.Domain.ValueObjects;

public class Email : ValueObject
{
    private static readonly Regex EmailRegex = new(
        @"^[^@\s]+@[^@\s]+\.[^@\s]+$", 
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    public string Value { get; private set; }

    private Email(string value)
    {
        Value = value;
    }

    public static Result<Email> Create(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure<Email>("Email cannot be empty");

        if (email.Length < 3 || email.Length > 50)
            return Result.Failure<Email>("Email must be between 3 and 50 characters");

        if (!EmailRegex.IsMatch(email))
            return Result.Failure<Email>("Invalid email format");

        return Result.Success(new Email(email.ToLowerInvariant()));
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;
}
