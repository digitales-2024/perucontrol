using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Model;
using PeruControl.Utils;

namespace PeruControl.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TreatmentProductController(
    DatabaseContext db,
    TreatmentProductService treatmentProductService
) : ControllerBase
{
    [EndpointSummary("Edit Appoinment Treatment Products")]
    [HttpGet("/api/Appointment/{appointmentid}/TreatmentProduct")]
    public async Task<
        ActionResult<IEnumerable<TreatmentProductDTO>>
    > GetAppointmentTreatmentProducts(Guid appointmentid)
    {
        var appointment = await db
            .ProjectAppointments.Include(pa => pa.TreatmentProducts)
            .ThenInclude(tp => tp.Product)
            .Include(pa => pa.TreatmentProducts)
            .ThenInclude(tp => tp.ProductAmountSolvent)
            .FirstOrDefaultAsync(x => x.Id == appointmentid);

        if (appointment is null)
            return NotFound("Fecha no encontrada");

        return Ok(appointment.TreatmentProducts.Select(TreatmentProductDTO.FromEntity));
    }

    [EndpointSummary("Edit Appoinment Treatment Products")]
    [HttpPatch("/api/Appointment/{appointmentid}/TreatmentProduct")]
    public async Task<ActionResult> EditAppointmentTreatmentProducts(
        Guid appointmentid,
        [FromBody] IList<TreatmentProductInDTO> dto
    )
    {
        var result = await treatmentProductService.PatchTreatmentProducts(appointmentid, dto);

        return result switch
        {
            SuccessResult success => Ok(),
            Utils.NotFoundResult error => NotFound(error.Message),
            _ => throw new Exception("Unexpected result type"),
        };
    }
}
