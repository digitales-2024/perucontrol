using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Model;
using PeruControl.Utils;

namespace PeruControl.Controllers.TreatmentArea;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TreatmentAreaController(DatabaseContext db, TreatmentAreaService treatmentAreaService)
    : ControllerBase
{
    [EndpointSummary("Get Treatment Areas of an Appointment")]
    [HttpGet("/api/Appointment/{appointmentid}/TreatmentArea")]
    public async Task<ActionResult<IEnumerable<TreatmentAreaGetDTO>>> GetAppointmentTreatmentAreas(
        Guid appointmentid
    )
    {
        var appointment = await db
            .ProjectAppointments.Include(pa => pa.TreatmentAreas)
            .ThenInclude(ta => ta.TreatmentProducts)
            .FirstOrDefaultAsync(x => x.Id == appointmentid);

        if (appointment is null)
            return NotFound("Fecha no encontrada");

        return Ok(appointment.TreatmentAreas.Select(TreatmentAreaDTO.FromEntity));
    }

    [EndpointSummary("Edit Treatment Areas of an Appointment")]
    [HttpPatch("/api/Appointment/{appointmentid}/TreatmentArea")]
    public async Task<ActionResult> EditAppointmentTreatmentAreas(
        Guid appointmentid,
        [FromBody] IList<TreatmentAreaInDTO> dto
    )
    {
        var result = await treatmentAreaService.UpdateTreatmentAreas(appointmentid, dto);

        return result switch
        {
            SuccessResult => Ok(),
            Utils.NotFoundResult error => NotFound(error.Message),
            _ => throw new Exception("Unexpected result type"),
        };
    }
}
