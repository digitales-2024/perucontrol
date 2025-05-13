using System.Net;

namespace PeruControl.Utils;

public class HttpErrorResult<T> : ErrorResult<T>
    where T : notnull
{
    public HttpStatusCode StatusCode { get; }

    public HttpErrorResult(string message, HttpStatusCode statusCode)
        : base(message)
    {
        StatusCode = statusCode;
    }

    public HttpErrorResult(
        string message,
        IReadOnlyCollection<Error> errors,
        HttpStatusCode statusCode
    )
        : base(message, errors)
    {
        StatusCode = statusCode;
    }
}
