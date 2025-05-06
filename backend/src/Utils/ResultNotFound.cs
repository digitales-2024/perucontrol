using System.Net;

namespace PeruControl.Utils;

public class NotFoundResult<T> : ErrorResult<T>
    where T : notnull
{
    public HttpStatusCode StatusCode { get; }

    public NotFoundResult(string message, HttpStatusCode statusCode)
        : base(message)
    {
        StatusCode = statusCode;
    }

    public NotFoundResult(
        string message,
        IReadOnlyCollection<Error> errors,
        HttpStatusCode statusCode
    )
        : base(message, errors)
    {
        StatusCode = statusCode;
    }
}
