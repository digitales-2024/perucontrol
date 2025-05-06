using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Model;
using PeruControl.Utils;

namespace PeruControl.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TreatmentAreaController(
    DatabaseContext db,
    TreatmentAreaService treatmentAreaService
) : ControllerBase
{
    [EndpointSummary("Edit Appoinment Treatment Areas")]
    [HttpGet("/api/Appointment/{appointmentid}/TreatmentArea")]
    public async Task<
        ActionResult<IEnumerable<TreatmentAreaDTO>>
    > GetAppointmentTreatmentAreas(Guid appointmentid)
    {
        var appointment = await db
            .ProjectAppointments
            .Include(pa => pa.TreatmentAreas)
            .FirstOrDefaultAsync(x => x.Id == appointmentid);

        if (appointment is null)
            return NotFound("Fecha no encontrada");

        return Ok(appointment.TreatmentAreas.Select(TreatmentAreaDTO.FromEntity));
    }
}
