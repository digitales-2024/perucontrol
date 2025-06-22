using PeruControl.Domain.Common;

namespace PeruControl.Domain.ValueObjects;

public class ClientNumber : ValueObject
{
    public int Value { get; private set; }

    private ClientNumber(int value)
    {
        Value = value;
    }

    public static Result<ClientNumber> Create(int value)
    {
        if (value <= 0)
            return Result.Failure<ClientNumber>("Client number must be positive");

        return Result.Success(new ClientNumber(value));
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value.ToString();
}
