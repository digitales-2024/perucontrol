using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Controllers.Reports;
using PeruControl.Model;
using PeruControl.Model.Reports;
using PeruControl.Utils;

namespace PeruControl.Controllers.Reports;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController(DatabaseContext db) : ControllerBase
{
    [EndpointSummary("Get CompleteReport of an Appointment")]
    [HttpGet("/api/Appointment/{appointmentid}/CompleteReport")]
    public async Task<ActionResult<CompleteReportDTO>> GetCompleteReport(Guid appointmentid)
    {
        var appointment = await db
            .ProjectAppointments.Include(a => a.CompleteReport)
            .ThenInclude(r => r.Content)
            .FirstOrDefaultAsync(a => a.Id == appointmentid);

        if (appointment == null)
            return NotFound("Appointment not found");

        if (appointment.CompleteReport == null)
            return NotFound("CompleteReport not found for this appointment");

        var result = new CompleteReportDTO
        {
            Id = appointment.CompleteReport.Id,
            SigningDate = appointment.CompleteReport.SigningDate,
            Content = MapContentSections(appointment.CompleteReport.Content),
        };

        return Ok(result);
    }

    private List<ContentSectionDTO> MapContentSections(List<ContentSection> sections)
    {
        var result = new List<ContentSectionDTO>();

        foreach (var section in sections)
        {
            if (section is TextBlock textBlock)
            {
                result.Add(
                    new TextBlockDTO
                    {
                        Title = textBlock.Title,
                        Numbering = textBlock.Numbering,
                        Level = textBlock.Level,
                        Sections = MapContentSections(textBlock.Sections.ToList()).ToArray(),
                    }
                );
            }
            else if (section is TextArea textArea)
            {
                result.Add(new TextAreaDTO { Content = textArea.Content });
            }
        }

        return result;
    }
}
