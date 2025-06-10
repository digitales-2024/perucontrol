using Microsoft.EntityFrameworkCore;
using PeruControl.Model;

namespace PeruControl.Controllers;

public class OperationSheetService(DatabaseContext db)
{
    public async Task<IList<GetOperationSheetsForTableOutDto>> GetOperationSheetsForTable()
    {
        var sheets = await db
            .ProjectOperationSheet.Where(sheet => sheet.Status != OperationSheetStatus.Created)
            .Include(sheet => sheet.ProjectAppointment)
            .ThenInclude(appt => appt.Project)
            .ThenInclude(proj => proj.Client)
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
                    sheet.ProjectAppointment.EnterTime?.ToString("hh:mm")
                    ?? "Sin hora de entrada"
                        + " - "
                        + sheet.ProjectAppointment.LeaveTime?.ToString("hh:mm")
                    ?? "Sin hora de salida",
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
                    appt.ProjectOperationSheet.Status == OperationSheetStatus.Created
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
                    .Appointments
                    .Where(s => s.ProjectOperationSheet.Status == OperationSheetStatus.Created)
                    .Select(
                        appt => new GetOperationSheetsForCreationOutDto.OperationSheetAvailable
                        {
                            AppoinmentId = appt.Id,
                            OperationSheetId = appt.ProjectOperationSheet.Id,
                            DueDate = appt.DueDate,
                            Status = appt.ProjectOperationSheet.Status,
                        }
                    )
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

        sheet.Status = OperationSheetStatus.Started;
        await db.SaveChangesAsync();

        return;
    }
}
