using PeruControl.Domain.Common;

namespace PeruControl.Domain.ValueObjects;

public class DocumentInfo : ValueObject
{
    public string Type { get; private set; }
    public string Value { get; private set; }

    private DocumentInfo(string type, string value)
    {
        Type = type;
        Value = value;
    }

    public static Result<DocumentInfo> Create(string type, string value)
    {
        if (string.IsNullOrWhiteSpace(type))
            return Result.Failure<DocumentInfo>("Document type cannot be empty");
            
        if (type.Length > 3)
            return Result.Failure<DocumentInfo>("Document type cannot exceed 3 characters");

        if (string.IsNullOrWhiteSpace(value))
            return Result.Failure<DocumentInfo>("Document value cannot be empty");
            
        if (value.Length < 8 || value.Length > 11)
            return Result.Failure<DocumentInfo>("Document value must be between 8 and 11 characters");

        return Result.Success(new DocumentInfo(type, value));
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Type;
        yield return Value;
    }

    public override string ToString() => $"{Type}: {Value}";
}
