using Microsoft.EntityFrameworkCore;
using PeruControl.Model;

namespace PeruControl.Controllers;

public class OperationSheetService(DatabaseContext db)
{
    //

    public async Task<IList<GetOperationSheetsForTableOutDto>> GetOperationSheetsForTable()
    {
        var sheets = await db.ProjectOperationSheet
            .Where(sheet => sheet.Status != OperationSheetStatus.Created)
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
                EnterLeaveTime = sheet.ProjectAppointment.EnterTime?.ToString("hh:mm") ?? "Sin hora de entrada"
                    + " - " +
                    sheet.ProjectAppointment.LeaveTime?.ToString("hh:mm") ?? "Sin hora de salida",
                Status = sheet.Status,
            })
            .ToList();
    }
}
