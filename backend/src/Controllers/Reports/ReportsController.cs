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
            .FirstOrDefaultAsync(a => a.Id == appointmentid);

        if (appointment == null)
            return NotFound("Appointment not found");

        if (appointment.CompleteReport == null)
            return NotFound("CompleteReport not found for this appointment");

        var result = new CompleteReportDTO
        {
            Id = appointment.CompleteReport.Id,
            SigningDate = appointment.CompleteReport.SigningDate,
            Content = appointment.CompleteReport.Content,
        };

        return Ok(result);
    }
}
