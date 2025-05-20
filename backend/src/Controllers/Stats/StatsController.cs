using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Model;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StatsController(DatabaseContext db)
    : ControllerBase
{
    [HttpGet]
    [EndpointSummary("Get statistics for dashboard")]
    public async Task<ActionResult<StatsGet>> GetStatistics()
    {
        var monthlyProjects = await db.Projects
            .Include(p => p.Appointments)
            .Where(s => s.Appointments.OrderBy(a => a.DueDate).First().DueDate >= DateTime.UtcNow.AddMonths(-6))
            .ToListAsync();

        var projectsDictionaryCount = new Dictionary<DateTime, int>();
        foreach (var project in monthlyProjects)
        {
            var project_time = project.Appointments.OrderBy(a => a.DueDate).First().DueDate;
            if (projectsDictionaryCount.ContainsKey(project_time))
            {
                projectsDictionaryCount[project_time]++;
            }
            else
            {
                projectsDictionaryCount[project_time] = 1;
            }
        }
        var projectsDateCount = projectsDictionaryCount
            .OrderBy(x => x.Key)
            .ToDictionary(x => x.Key.ToString("MMMM yyyy", new System.Globalization.CultureInfo("es-PE")), x => x.Value);

        return Ok(new StatsGet
        {
            monthlyServiceCount = projectsDateCount,
        });
    }
}

public class StatsGet
{
    public required Dictionary<string, int> monthlyServiceCount { get; set; }
}
