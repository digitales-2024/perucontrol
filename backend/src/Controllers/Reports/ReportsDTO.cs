namespace PeruControl.Controllers.Reports;

public class CompleteReportDTO
{
    public Guid Id { get; set; }
    public DateTime? SigningDate { get; set; }
    public List<ContentSectionDTO> Content { get; set; } = [];
}

public abstract class ContentSectionDTO { }

public class TextBlockDTO : ContentSectionDTO
{
    public string Title { get; set; } = null!;
    public string Numbering { get; set; } = null!;
    public int Level { get; set; }
    public ContentSectionDTO[] Sections { get; set; } = [];
}

public class TextAreaDTO : ContentSectionDTO
{
    public string Content { get; set; } = null!;
}
