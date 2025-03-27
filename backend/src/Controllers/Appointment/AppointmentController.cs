using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Model;

namespace PeruControl.Controllers;

/// <summary>
/// Controller responsible for managing appointment-related operations.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AppointmentController(DatabaseContext db) : ControllerBase
{
    /// <summary>
    /// Retrieves appointments within a specified time range.
    /// </summary>
    /// <param name="start">The start date and time of the range.</param>
    /// <param name="end">The end date and time of the range.</param>
    /// <returns>A collection of appointments that fall within the specified time range.</returns>
    /// <response code="200">Returns the list of appointments in the specified date range.</response>
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
            .ThenInclude(p => p.Client)
            .ToListAsync();

        return Ok(
            appointments.Select(a => new AppointmentGetDTO
            {
                Project = a.Project,
                OrderNumber = a.OrderNumber,
                DueDate = a.DueDate,
                ActualDate = a.ActualDate,
                Client = a.Project.Client,
                Id = a.Id,
                IsActive = a.IsActive,
                CreatedAt = a.CreatedAt,
                ModifiedAt = a.ModifiedAt,
            })
        );
    }
}
