using System.Text.Json.Serialization;

namespace PeruControl.Infrastructure.Model;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ResourceStatus
{
    /// The operation sheet has been only created
    Created,

    /// The operation sheet has started to be edited
    Started,

    /// The operation sheet is completed
    Completed,
}
