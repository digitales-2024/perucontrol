using System.Text.Json.Serialization;

namespace PeruControl.Infrastructure.Model.Reports;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "$type")]
[JsonDerivedType(typeof(TextBlock), "textBlock")]
[JsonDerivedType(typeof(TextArea), "textArea")]
public abstract class ContentSection { }

public sealed class TextBlock : ContentSection
{
    public required string Title { get; set; }
    public required string Numbering { get; set; }
    public required int Level { get; set; }
    public required ContentSection[] Sections { get; set; }
}

public sealed class TextArea : ContentSection
{
    public required string Content { get; set; }
}
