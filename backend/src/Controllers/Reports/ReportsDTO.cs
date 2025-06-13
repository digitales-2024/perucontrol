using System;
using System.Collections.Generic;
using PeruControl.Infrastructure.Model.Reports;

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

public class Report1DTO
{
    public Guid Id { get; set; }
    public DateTime? SigningDate { get; set; }
    public List<ContentSection> Content { get; set; } = [];
}

public class UpdateReport1DTO
{
    public DateTime? SigningDate { get; set; }
    public List<ContentSection>? Content { get; set; }
}

public class Report2DTO
{
    public Guid Id { get; set; }
    public DateTime? SigningDate { get; set; }
    public List<ContentSection> Content { get; set; } = [];
}

public class UpdateReport2DTO
{
    public DateTime? SigningDate { get; set; }
    public List<ContentSection>? Content { get; set; }
}

public class Report3DTO
{
    public Guid Id { get; set; }
    public DateTime? SigningDate { get; set; }
    public List<ContentSection> Content { get; set; } = [];
}

public class UpdateReport3DTO
{
    public DateTime? SigningDate { get; set; }
    public List<ContentSection>? Content { get; set; }
}

public class Report4DTO
{
    public Guid Id { get; set; }
    public DateTime? SigningDate { get; set; }
    public List<ContentSection> Content { get; set; } = [];
}

public class UpdateReport4DTO
{
    public DateTime? SigningDate { get; set; }
    public List<ContentSection>? Content { get; set; }
}
