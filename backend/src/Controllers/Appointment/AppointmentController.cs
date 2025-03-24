using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Model;

namespace PeruControl.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentController(DatabaseContext db) : ControllerBase
{
    [EndpointSummary("Get by time range")]
    [HttpGet]
    [ProducesResponseType<IEnumerable<AppointmentGetDTO>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<AppointmentGetDTO>>> GetByTimeRange(
        [FromQuery] DateTime start,
        [FromQuery] DateTime end
    )
    {
        var appointments = await db
            .Appointments.Where(a => a.DueDate >= start && a.DueDate <= end)
            .Include(a => a.Project)
            .ToListAsync();

        return Ok(
            appointments.Select(a => new AppointmentGetDTO
            {
                Project = a.Project,
                OrderNumber = a.OrderNumber,
                DueDate = a.DueDate,
                ActualDate = a.ActualDate,
                Id = a.Id,
                IsActive = a.IsActive,
                CreatedAt = a.CreatedAt,
                ModifiedAt = a.ModifiedAt,
            })
        );
    }
}
