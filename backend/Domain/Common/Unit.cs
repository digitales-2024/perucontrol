namespace PeruControl.Domain.Common;

/// <summary>
/// Represents a void result for operations that don't return a value
/// </summary>
public readonly struct Unit
{
    public static readonly Unit Value = new();
}
