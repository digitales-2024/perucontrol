namespace PeruControl.Utils;

public abstract class Result
{
    public bool Success { get; protected init; }
    public bool Failure => !Success;
}

public abstract class Result<T> : Result
    where T : notnull
{
    private readonly T? _data;

    protected Result(T? data)
    {
        _data = data;
    }

    public T Data =>
        Success
            ? _data
                ?? throw new InvalidOperationException(
                    "Data is unexpectedly null despite Success being true"
                )
            : throw new InvalidOperationException(
                $"Cannot access {nameof(Data)} when {nameof(Success)} is false"
            );
}

public sealed class SuccessResult : Result
{
    public SuccessResult() => Success = true;
}

public sealed class SuccessResult<T> : Result<T>
    where T : notnull
{
    public SuccessResult(T data)
        : base(data) => Success = true;
}

public class ErrorResult : Result, IErrorResult
{
    public string Message { get; }
    public IReadOnlyCollection<Error> Errors { get; }

    public ErrorResult(string message)
        : this(message, Array.Empty<Error>()) { }

    public ErrorResult(string message, IReadOnlyCollection<Error>? errors)
    {
        Message = message;
        Success = false;
        Errors = errors ?? Array.Empty<Error>();
    }
}

public class ErrorResult<T> : Result<T>, IErrorResult
    where T : notnull
{
    public string Message { get; }
    public IReadOnlyCollection<Error> Errors { get; }

    public ErrorResult(string message)
        : this(message, Array.Empty<Error>()) { }

    public ErrorResult(string message, IReadOnlyCollection<Error>? errors)
        : base(default)
    {
        Message = message;
        Success = false;
        Errors = errors ?? Array.Empty<Error>();
    }
}

public sealed class Error
{
    public string? Code { get; }
    public string Details { get; }

    public Error(string details)
        : this(null, details) { }

    public Error(string? code, string details)
    {
        Code = code;
        Details = details ?? throw new ArgumentNullException(nameof(details));
    }
}

internal interface IErrorResult
{
    string Message { get; }
    IReadOnlyCollection<Error> Errors { get; }
}
