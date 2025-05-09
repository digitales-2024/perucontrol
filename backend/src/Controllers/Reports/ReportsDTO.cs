using PeruControl.Model.Reports;

namespace PeruControl.Controllers.Reports;

public class CompleteReportDTO
{
    public required Guid Id { get; set; }
    public DateTime? SigningDate { get; set; }
    public required List<ContentSection> Content { get; set; }
}

public class UpdateCompleteReportDTO
{
    public DateTime? SigningDate { get; set; }
    public List<ContentSection>? Content { get; set; }
}
