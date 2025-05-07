namespace PeruControl.Utils;

public class NotFoundResult<T> : ErrorResult<T>
    where T : notnull
{
    public NotFoundResult(string message)
        : base(message) { }

    public NotFoundResult(string message, IReadOnlyCollection<Error> errors)
        : base(message, errors) { }
}

public class NotFoundResult : ErrorResult
{
    public NotFoundResult(string message)
        : base(message) { }

    public NotFoundResult(string message, IReadOnlyCollection<Error> errors)
        : base(message, errors) { }
}
