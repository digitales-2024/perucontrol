using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Infrastructure.Model;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StatsController(DatabaseContext db) : ControllerBase
{
    [HttpGet]
    [EndpointSummary("Get statistics for dashboard")]
    public async Task<ActionResult<StatsGet>> GetStatistics(
        [FromQuery] DateTime? start,
        [FromQuery] DateTime? end
    )
    {
        if (start is null)
        {
            start = DateTime.UtcNow.AddMonths(-6);
        }
        if (end is null)
        {
            end = DateTime.UtcNow;
        }

        var monthlyQuotations = await db
            .Quotations.Where(q => q.CreationDate >= start && q.CreationDate <= end)
            .ToListAsync();

        var monthlyProjects = await db
            .Projects.Include(p => p.Appointments)
            .ThenInclude(a => a.Services)
            .Where(s =>
                s.Appointments.OrderBy(a => a.DueDate).First().DueDate >= start
                && s.Appointments.OrderBy(a => a.DueDate).First().DueDate <= end
            )
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
        var monthlyProfit = new Dictionary<string, decimal>();

        foreach (var project in monthlyProjects)
        {
            var project_time = project.Appointments.OrderBy(a => a.DueDate).First().DueDate;
            var project_time_str = project_time.ToString(
                "MMMM yyyy",
                new System.Globalization.CultureInfo("es-PE")
            );

            //
            // Projects count
            //
            if (projectsDictionaryCount.ContainsKey(project_time_str))
            {
                projectsDictionaryCount[project_time_str]++;
            }
            else
            {
                projectsDictionaryCount[project_time_str] = 1;
            }

            //
            // Monthly profit
            //
            if (monthlyProfit.ContainsKey(project_time_str))
            {
                monthlyProfit[project_time_str] += project.Price;
            }
            else
            {
                monthlyProfit[project_time_str] = project.Price;
            }
        }

        // Collect quotation data
        var monthlyQuotationsDict = new Dictionary<string, QuotationData>();
        foreach (var quotation in monthlyQuotations)
        {
            var project_time_str = quotation.CreationDate.ToString(
                "MMMM yyyy",
                new System.Globalization.CultureInfo("es-PE")
            );

            QuotationData qdata;
            if (monthlyQuotationsDict.ContainsKey(project_time_str))
            {
                qdata = monthlyQuotationsDict[project_time_str];
            }
            else
            {
                qdata = new QuotationData() { Accepted = 0, Rejected = 0 };
                monthlyQuotationsDict[project_time_str] = qdata;
            }

            if (quotation.Status == QuotationStatus.Approved)
            {
                qdata.Accepted += 1;
            }
            else if (quotation.Status == QuotationStatus.Rejected)
            {
                qdata.Rejected += 1;
            }
        }

        return Ok(
            new StatsGet
            {
                MonthlyServiceCount = projectsDictionaryCount,
                ServiceCount = servicesDictCount,
                MonthlyProfit = monthlyProfit,
                MonthlyQuotations = monthlyQuotationsDict,
            }
        );
    }
}

public class StatsGet
{
    public required Dictionary<string, int> MonthlyServiceCount { get; set; }
    public required Dictionary<string, int> ServiceCount { get; set; }
    public required Dictionary<string, decimal> MonthlyProfit { get; set; }
    public required Dictionary<string, QuotationData> MonthlyQuotations { get; set; }
}

public class QuotationData
{
    public required int Accepted { get; set; }
    public required int Rejected { get; set; }
}
