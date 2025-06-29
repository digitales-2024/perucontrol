using Microsoft.EntityFrameworkCore;
using PeruControl.Infrastructure.Model;

namespace PeruControl.Controllers;

public class OperationSheetService(DatabaseContext db)
{
    public async Task<IList<GetOperationSheetsForTableOutDto>> GetOperationSheetsForTable()
    {
        var sheets = await db
            .ProjectOperationSheet.Where(sheet => sheet.Status != ResourceStatus.Created)
            .Include(sheet => sheet.ProjectAppointment)
            .ThenInclude(appt => appt.Project)
            .ThenInclude(proj => proj.Client)
            .OrderByDescending(sheet => sheet.ProjectAppointment.DueDate)
            .ToListAsync();

        if (sheets is null)
        {
            throw new Exception("Not Found");
        }

        return sheets
            .Select(sheet => new GetOperationSheetsForTableOutDto
            {
                ProjectId = sheet.ProjectAppointment.Project.Id,
                OperationSheetId = sheet.Id,
                AppointmentId = sheet.ProjectAppointment.Id,
                Number = sheet.ProjectAppointment.AppointmentNumber,
                ClientName = sheet.ProjectAppointment.Project.Client.Name,
                ActualDate = sheet.ProjectAppointment.ActualDate,
                EnterLeaveTime =
                    (
                        sheet.ProjectAppointment.EnterTime?.ToString("hh:mm tt")
                        ?? "Sin hora de entrada"
                    )
                    + " - "
                    + (
                        sheet.ProjectAppointment.LeaveTime?.ToString("hh:mm tt")
                        ?? "Sin hora de salida"
                    ),
                Status = sheet.Status,
            })
            .ToList();
    }

    public async Task<IList<GetOperationSheetsForCreationOutDto>> GetOperationSheetsForCreation()
    {
        var services = await db
            .Projects.Include(proj => proj.Client)
            .Include(proj => proj.Appointments)
            .ThenInclude(appt => appt.ProjectOperationSheet)
            .Where(proj =>
                proj.Appointments.Any(appt =>
                    appt.ProjectOperationSheet.Status == ResourceStatus.Created
                )
            )
            .ToListAsync();

        return services
            .Select(service => new GetOperationSheetsForCreationOutDto
            {
                ServiceId = service.Id,
                ClientName = service.Client.Name,
                ServiceNumber = service.ProjectNumber,
                AvailableSheets = service
                    .Appointments.Where(s =>
                        s.ProjectOperationSheet.Status == ResourceStatus.Created
                    )
                    .OrderBy(s => s.DueDate)
                    .Select(appt => new GetOperationSheetsForCreationOutDto.OperationSheetAvailable
                    {
                        AppoinmentId = appt.Id,
                        OperationSheetId = appt.ProjectOperationSheet.Id,
                        DueDate = appt.DueDate,
                        Status = appt.ProjectOperationSheet.Status,
                    })
                    .ToList(),
            })
            .ToList();
    }

    public async Task MarkOperationSheetCreated(Guid operationSheetId)
    {
        var sheet = await db.ProjectOperationSheet.FindAsync(operationSheetId);

        if (sheet is null)
        {
            throw new Exception("No encontrado");
        }

        sheet.Status = ResourceStatus.Started;
        await db.SaveChangesAsync();

        return;
    }
}
