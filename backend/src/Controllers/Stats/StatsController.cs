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
            .ThenInclude(a => a.Services)
            .Where(s => s.Appointments.OrderBy(a => a.DueDate).First().DueDate >= DateTime.UtcNow.AddMonths(-6))
            .ToListAsync();

        // Collect individual service count
        var servicesDictCount = new Dictionary<string, int>();
        foreach (var project in monthlyProjects)
        {
            foreach (var appointment in project.Appointments)
            {
                var services = appointment.Services;
                foreach (var service in services)
                {
                    var serviceName = service.Name;
                    if (servicesDictCount.ContainsKey(serviceName))
                    {
                        servicesDictCount[serviceName]++;
                    }
                    else
                    {
                        servicesDictCount[serviceName] = 1;
                    }
                }
            }
        }

        // Collect monthly project count
        var projectsDictionaryCount = new Dictionary<string, int>();
        foreach (var project in monthlyProjects)
        {
            var project_time = project.Appointments.OrderBy(a => a.DueDate).First().DueDate;
            var project_time_str = project_time.ToString("yyyy MM", new System.Globalization.CultureInfo("es-PE"));

            if (projectsDictionaryCount.ContainsKey(project_time_str))
            {
                projectsDictionaryCount[project_time_str]++;
            }
            else
            {
                projectsDictionaryCount[project_time_str] = 1;
            }
        }

        return Ok(new StatsGet
        {
            monthlyServiceCount = projectsDictionaryCount,
            serviceCount = servicesDictCount,
        });
    }
}

public class StatsGet
{
    public required Dictionary<string, int> monthlyServiceCount { get; set; }
    public required Dictionary<string, int> serviceCount { get; set; }
}
