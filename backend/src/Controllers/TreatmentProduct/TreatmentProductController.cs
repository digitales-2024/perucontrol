using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Infrastructure.Model;
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
    [EndpointSummary("Get Treatment Products of an Appointment")]
    [HttpGet("/api/Appointment/{appointmentid}/TreatmentProduct")]
    public async Task<
        ActionResult<IEnumerable<TreatmentProductDTO>>
    > GetAppointmentTreatmentProducts(Guid appointmentid)
    {
        var appointment = await db
            .ProjectAppointments.Include(pa => pa.TreatmentProducts)
            .FirstOrDefaultAsync(x => x.Id == appointmentid);

        if (appointment is null)
            return NotFound("Fecha no encontrada");

        return Ok(appointment.TreatmentProducts.Select(TreatmentProductDTO.FromEntity));
    }

    [EndpointSummary("Edit Treatment Products of an Appointment")]
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

    [EndpointSummary(
        "Get all product names (from OperationSheet fields) used in a specific Appointment. Optionally include a TreatmentProduct's ProductName by id."
    )]
    [HttpGet("/api/Appointment/{appointmentId}/SheetProductNames")]
    public async Task<
        ActionResult<IEnumerable<ProductSimpleDTO>>
    > GetSheetProductNamesByAppointment(
        Guid appointmentId,
        [FromQuery] Guid? treatmentProductId = null
    )
    {
        var appointment = await db
            .ProjectAppointments.Where(pa => pa.Id == appointmentId)
            .Select(pa => pa.ProjectOperationSheet)
            .FirstOrDefaultAsync();

        if (appointment == null)
        {
            return Ok(new List<ProductSimpleDTO>());
        }

        var productList = new List<ProductSimpleDTO>();

        if (!string.IsNullOrEmpty(appointment.Insecticide))
            productList.Add(
                new ProductSimpleDTO
                {
                    Id = Guid.NewGuid(),
                    Name = appointment.Insecticide,
                    Concentration = appointment.InsecticideAmount ?? "",
                }
            );
        if (!string.IsNullOrEmpty(appointment.Insecticide2))
            productList.Add(
                new ProductSimpleDTO
                {
                    Id = Guid.NewGuid(),
                    Name = appointment.Insecticide2,
                    Concentration = appointment.InsecticideAmount2 ?? "",
                }
            );
        if (!string.IsNullOrEmpty(appointment.Rodenticide))
            productList.Add(
                new ProductSimpleDTO
                {
                    Id = Guid.NewGuid(),
                    Name = appointment.Rodenticide,
                    Concentration = appointment.RodenticideAmount ?? "",
                }
            );
        if (!string.IsNullOrEmpty(appointment.Desinfectant))
            productList.Add(
                new ProductSimpleDTO
                {
                    Id = Guid.NewGuid(),
                    Name = appointment.Desinfectant,
                    Concentration = appointment.DesinfectantAmount ?? "",
                }
            );
        if (!string.IsNullOrEmpty(appointment.OtherProducts))
            productList.Add(
                new ProductSimpleDTO
                {
                    Id = Guid.NewGuid(),
                    Name = appointment.OtherProducts,
                    Concentration = appointment.OtherProductsAmount ?? "",
                }
            );

        productList = productList
            .GroupBy(p => new { p.Name, p.Concentration })
            .Select(g => g.First())
            .ToList();

        if (treatmentProductId.HasValue)
        {
            var extraProduct = await db
                .TreatmentProducts.Where(tp => tp.Id == treatmentProductId.Value)
                .Select(tp => new ProductSimpleDTO
                {
                    Id = tp.Id,
                    Name = tp.ProductName,
                    Concentration = tp.AmountAndSolvent,
                })
                .FirstOrDefaultAsync();

            if (
                extraProduct != null
                && !productList.Any(p =>
                    p.Name == extraProduct.Name && p.Concentration == extraProduct.Concentration
                )
            )
            {
                productList.Add(extraProduct);
            }
        }

        return Ok(productList);
    }
}
