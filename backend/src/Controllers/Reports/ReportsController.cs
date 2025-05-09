using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Model;
using PeruControl.Model.Reports;

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
    
    [EndpointSummary("Update CompleteReport of an Appointment")]
    [HttpPatch("/api/Appointment/{appointmentid}/CompleteReport")]
    public async Task<ActionResult> UpdateCompleteReport(Guid appointmentid, UpdateCompleteReportDTO updateDto)
    {
        var appointment = await db
            .ProjectAppointments.Include(a => a.CompleteReport)
            .FirstOrDefaultAsync(a => a.Id == appointmentid);

        if (appointment == null)
            return NotFound("Appointment not found");

        if (appointment.CompleteReport == null)
            return NotFound("CompleteReport not found for this appointment");
            
        // Update fields if provided
        if (updateDto.SigningDate.HasValue)
            appointment.CompleteReport.SigningDate = updateDto.SigningDate;
            
        if (updateDto.Content != null)
            appointment.CompleteReport.Content = updateDto.Content;
            
        await db.SaveChangesAsync();
        
        return NoContent();
    }
}
