using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Model;
using PeruControl.Model.Reports;
using PeruControl.Services;

namespace PeruControl.Controllers.Reports;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController(
    DatabaseContext db,
    WordTemplateService wordTemplateService
) : ControllerBase
{
    private readonly WordTemplateService _wordTemplateService = wordTemplateService;

    [EndpointSummary("Get CompleteReport of an Appointment")]
    [HttpGet("/api/Appointment/{appointmentid}/CompleteReport")]
    public async Task<ActionResult<CompleteReportDTO>> GetCompleteReport(Guid appointmentid)
    {
        var appointment = await db
            .ProjectAppointments.Include(a => a.CompleteReport)
            .FirstOrDefaultAsync(a => a.Id == appointmentid);

        if (appointment == null)
            return NotFound("Appointment not found");

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
    public async Task<ActionResult> UpdateCompleteReport(
        Guid appointmentid,
        UpdateCompleteReportDTO updateDto
    )
    {
        var appointment = await db
            .ProjectAppointments.Include(a => a.CompleteReport)
            .FirstOrDefaultAsync(a => a.Id == appointmentid);

        if (appointment == null)
            return NotFound("Appointment not found");

        // Update fields if provided
        if (updateDto.SigningDate.HasValue)
            appointment.CompleteReport.SigningDate = updateDto.SigningDate;

        if (updateDto.Content != null)
            appointment.CompleteReport.Content = updateDto.Content;

        await db.SaveChangesAsync();

        return NoContent();
    }

    [EndpointSummary("Download Complete Report as DOCX")]
    [HttpGet("/api/Appointment/{appointmentid}/CompleteReport/docx")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DownloadCompleteReportDocx(Guid appointmentid)
    {
        var appointment = await db.ProjectAppointments
            .Include(a => a.TreatmentProducts)
                .ThenInclude(tp => tp.Product)
            .Include(a => a.TreatmentProducts) 
                .ThenInclude(tp => tp.ProductAmountSolvent)
            .Include(a => a.TreatmentAreas)
                .ThenInclude(ta => ta.TreatmentProducts)
                    .ThenInclude(tp => tp.Product)
            .Include(a => a.CompleteReport)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == appointmentid);

        if (appointment == null)
        {
            return NotFound("Appointment not found.");
        }

        byte[] fileBytes;
        try
        {
            fileBytes = _wordTemplateService.GenerateReport01(appointment);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error generating report: {ex.Message}");
        }

        if (fileBytes == null || fileBytes.Length == 0)
        {
            return BadRequest("Generated report is empty or generation failed.");
        }

        return File(
            fileBytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            $"CompleteReport_{appointmentid}.docx"
        );
    }
}
