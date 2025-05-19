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
public class ReportsController(DatabaseContext db, WordTemplateService wordTemplateService)
    : ControllerBase
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
        var appointment = await db
            .ProjectAppointments.Include(a => a.TreatmentProducts)
            .ThenInclude(tp => tp.Product)
            .Include(a => a.TreatmentProducts)
            .ThenInclude(tp => tp.ProductAmountSolvent)
            .Include(a => a.TreatmentAreas)
            .ThenInclude(ta => ta.TreatmentProducts)
            .ThenInclude(tp => tp.Product)
            .Include(a => a.CompleteReport)
            .Include(a => a.Project)
            .ThenInclude(p => p.Client)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == appointmentid);

        if (appointment == null)
        {
            return NotFound("Appointment not found.");
        }

        byte[] fileBytes;
        try
        {
            fileBytes = _wordTemplateService.GenerateReportComplete(appointment, "Templates/nuevos_informes/informe_01.docx");
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

    // Report 1 Endpoints
    [EndpointSummary("Get Disinfection-Desinsect of an Appointment")]
    [HttpGet("/api/Appointment/{appointmentid}/Disinfection-Desinsect")]
    public async Task<ActionResult<Report1DTO>> GetReport1(Guid appointmentid)
    {
        var appointment = await db
            .ProjectAppointments.Include(a => a.Report1)
            .FirstOrDefaultAsync(a => a.Id == appointmentid);

        if (appointment == null)
            return NotFound("Appointment not found");

        var result = new Report1DTO
        {
            Id = appointment.Report1.Id,
            SigningDate = appointment.Report1.SigningDate,
            Content = appointment.Report1.Content,
        };

        return Ok(result);
    }

    [EndpointSummary("Update Disinfection-Desinsect of an Appointment")]
    [HttpPatch("/api/Appointment/{appointmentid}/Disinfection-Desinsect")]
    public async Task<ActionResult> UpdateReport1(Guid appointmentid, UpdateReport1DTO updateDto)
    {
        var appointment = await db
            .ProjectAppointments.Include(a => a.Report1)
            .FirstOrDefaultAsync(a => a.Id == appointmentid);

        if (appointment == null)
            return NotFound("Appointment not found");

        if (updateDto.SigningDate.HasValue)
            appointment.Report1.SigningDate = updateDto.SigningDate;

        if (updateDto.Content != null)
            appointment.Report1.Content = updateDto.Content;

        await db.SaveChangesAsync();

        return NoContent();
    }

    [EndpointSummary("Download Disinfection-Desinsect as DOCX")]
    [HttpGet("/api/Appointment/{appointmentid}/Disinfection-Desinsect/docx")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DownloadReport1Docx(Guid appointmentid)
    {
        var appointment = await db
            .ProjectAppointments.Include(a => a.TreatmentProducts)
            .ThenInclude(tp => tp.Product)
            .Include(a => a.TreatmentProducts)
            .ThenInclude(tp => tp.ProductAmountSolvent)
            .Include(a => a.TreatmentAreas)
            .ThenInclude(ta => ta.TreatmentProducts)
            .ThenInclude(tp => tp.Product)
            .Include(a => a.Report1) // Include Report1
            .Include(a => a.Project)
            .ThenInclude(p => p.Client)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == appointmentid);

        if (appointment == null)
            return NotFound("Appointment not found.");

        byte[] fileBytes;
        try
        {
            // Still calls GenerateReportComplete as per instruction
            fileBytes = _wordTemplateService.GenerateReportComplete(appointment, "Templates/nuevos_informes/informe_desinfeccion_desinsectacion.docx");
        }
        catch (Exception ex)
        {
            return BadRequest($"Error generating report: {ex.Message}");
        }

        if (fileBytes == null || fileBytes.Length == 0)
            return BadRequest("Generated report is empty or generation failed.");

        return File(
            fileBytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            $"Report1_{appointmentid}.docx"
        );
    }

    // Report 2 Endpoints
    [EndpointSummary("Get Report2 of an Appointment")]
    [HttpGet("/api/Appointment/{appointmentid}/Report2")]
    public async Task<ActionResult<Report2DTO>> GetReport2(Guid appointmentid)
    {
        var appointment = await db
            .ProjectAppointments.Include(a => a.Report2)
            .FirstOrDefaultAsync(a => a.Id == appointmentid);

        if (appointment == null)
            return NotFound("Appointment not found");

        var result = new Report2DTO
        {
            Id = appointment.Report2.Id,
            SigningDate = appointment.Report2.SigningDate,
            Content = appointment.Report2.Content,
        };

        return Ok(result);
    }

    [EndpointSummary("Update Report2 of an Appointment")]
    [HttpPatch("/api/Appointment/{appointmentid}/Report2")]
    public async Task<ActionResult> UpdateReport2(Guid appointmentid, UpdateReport2DTO updateDto)
    {
        var appointment = await db
            .ProjectAppointments.Include(a => a.Report2)
            .FirstOrDefaultAsync(a => a.Id == appointmentid);

        if (appointment == null)
            return NotFound("Appointment not found");

        if (updateDto.SigningDate.HasValue)
            appointment.Report2.SigningDate = updateDto.SigningDate;

        if (updateDto.Content != null)
            appointment.Report2.Content = updateDto.Content;

        await db.SaveChangesAsync();

        return NoContent();
    }

    [EndpointSummary("Download Report2 as DOCX")]
    [HttpGet("/api/Appointment/{appointmentid}/Report2/docx")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DownloadReport2Docx(Guid appointmentid)
    {
        var appointment = await db
            .ProjectAppointments.Include(a => a.TreatmentProducts)
            .ThenInclude(tp => tp.Product)
            .Include(a => a.TreatmentProducts)
            .ThenInclude(tp => tp.ProductAmountSolvent)
            .Include(a => a.TreatmentAreas)
            .ThenInclude(ta => ta.TreatmentProducts)
            .ThenInclude(tp => tp.Product)
            .Include(a => a.Report2) // Include Report2
            .Include(a => a.Project)
            .ThenInclude(p => p.Client)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == appointmentid);

        if (appointment == null)
            return NotFound("Appointment not found.");

        byte[] fileBytes;
        try
        {
            fileBytes = _wordTemplateService.GenerateReportComplete(appointment);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error generating report: {ex.Message}");
        }

        if (fileBytes == null || fileBytes.Length == 0)
            return BadRequest("Generated report is empty or generation failed.");

        return File(
            fileBytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            $"Report2_{appointmentid}.docx"
        );
    }

    // Report 3 Endpoints
    [EndpointSummary("Get Report3 of an Appointment")]
    [HttpGet("/api/Appointment/{appointmentid}/Report3")]
    public async Task<ActionResult<Report3DTO>> GetReport3(Guid appointmentid)
    {
        var appointment = await db
            .ProjectAppointments.Include(a => a.Report3)
            .FirstOrDefaultAsync(a => a.Id == appointmentid);

        if (appointment == null)
            return NotFound("Appointment not found");

        var result = new Report3DTO
        {
            Id = appointment.Report3.Id,
            SigningDate = appointment.Report3.SigningDate,
            Content = appointment.Report3.Content,
        };

        return Ok(result);
    }

    [EndpointSummary("Update Report3 of an Appointment")]
    [HttpPatch("/api/Appointment/{appointmentid}/Report3")]
    public async Task<ActionResult> UpdateReport3(Guid appointmentid, UpdateReport3DTO updateDto)
    {
        var appointment = await db
            .ProjectAppointments.Include(a => a.Report3)
            .FirstOrDefaultAsync(a => a.Id == appointmentid);

        if (appointment == null)
            return NotFound("Appointment not found");

        if (updateDto.SigningDate.HasValue)
            appointment.Report3.SigningDate = updateDto.SigningDate;

        if (updateDto.Content != null)
            appointment.Report3.Content = updateDto.Content;

        await db.SaveChangesAsync();

        return NoContent();
    }

    [EndpointSummary("Download Report3 as DOCX")]
    [HttpGet("/api/Appointment/{appointmentid}/Report3/docx")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DownloadReport3Docx(Guid appointmentid)
    {
        var appointment = await db
            .ProjectAppointments.Include(a => a.TreatmentProducts)
            .ThenInclude(tp => tp.Product)
            .Include(a => a.TreatmentProducts)
            .ThenInclude(tp => tp.ProductAmountSolvent)
            .Include(a => a.TreatmentAreas)
            .ThenInclude(ta => ta.TreatmentProducts)
            .ThenInclude(tp => tp.Product)
            .Include(a => a.Report3) // Include Report3
            .Include(a => a.Project)
            .ThenInclude(p => p.Client)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == appointmentid);

        if (appointment == null)
            return NotFound("Appointment not found.");

        byte[] fileBytes;
        try
        {
            fileBytes = _wordTemplateService.GenerateReportComplete(appointment);
        }
        catch (Exception ex)
        {
            return BadRequest($"Error generating report: {ex.Message}");
        }

        if (fileBytes == null || fileBytes.Length == 0)
            return BadRequest("Generated report is empty or generation failed.");

        return File(
            fileBytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            $"Report3_{appointmentid}.docx"
        );
    }

    // Report 4 Endpoints
    [EndpointSummary("Get RatExterminationSubst of an Appointment")]
    [HttpGet("/api/Appointment/{appointmentid}/RatExterminationSubst")]
    public async Task<ActionResult<Report4DTO>> GetReport4(Guid appointmentid)
    {
        var appointment = await db
            .ProjectAppointments.Include(a => a.Report4)
            .FirstOrDefaultAsync(a => a.Id == appointmentid);

        if (appointment == null)
            return NotFound("Appointment not found");

        var result = new Report4DTO
        {
            Id = appointment.Report4.Id,
            SigningDate = appointment.Report4.SigningDate,
            Content = appointment.Report4.Content,
        };

        return Ok(result);
    }

    [EndpointSummary("Update RatExterminationSubst of an Appointment")]
    [HttpPatch("/api/Appointment/{appointmentid}/RatExterminationSubst")]
    public async Task<ActionResult> UpdateReport4(Guid appointmentid, UpdateReport4DTO updateDto)
    {
        var appointment = await db
            .ProjectAppointments.Include(a => a.Report4)
            .FirstOrDefaultAsync(a => a.Id == appointmentid);

        if (appointment == null)
            return NotFound("Appointment not found");

        if (updateDto.SigningDate.HasValue)
            appointment.Report4.SigningDate = updateDto.SigningDate;

        if (updateDto.Content != null)
            appointment.Report4.Content = updateDto.Content;

        await db.SaveChangesAsync();

        return NoContent();
    }

    [EndpointSummary("Download RatExterminationSubst as DOCX")]
    [HttpGet("/api/Appointment/{appointmentid}/RatExterminationSubst/docx")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DownloadReport4Docx(Guid appointmentid)
    {
        var appointment = await db
            .ProjectAppointments.Include(a => a.TreatmentProducts)
            .ThenInclude(tp => tp.Product)
            .Include(a => a.TreatmentProducts)
            .ThenInclude(tp => tp.ProductAmountSolvent)
            .Include(a => a.TreatmentAreas)
            .ThenInclude(ta => ta.TreatmentProducts)
            .ThenInclude(tp => tp.Product)
            .Include(a => a.Report4) // Include Report4
            .Include(a => a.Project)
            .ThenInclude(p => p.Client)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == appointmentid);

        if (appointment == null)
            return NotFound("Appointment not found.");

        byte[] fileBytes;
        try
        {
            fileBytes = _wordTemplateService.GenerateReportComplete(appointment, "Templates/nuevos_informes/informe_sostenimiento_desratizacion.docx");
        }
        catch (Exception ex)
        {
            return BadRequest($"Error generating report: {ex.Message}");
        }

        if (fileBytes == null || fileBytes.Length == 0)
            return BadRequest("Generated report is empty or generation failed.");

        return File(
            fileBytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            $"Report4_{appointmentid}.docx"
        );
    }
}
