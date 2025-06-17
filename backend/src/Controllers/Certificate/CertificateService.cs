using Microsoft.EntityFrameworkCore;
using PeruControl.Infrastructure.Model;

namespace PeruControl.Controllers;

public class CertificateService(DatabaseContext db)
{
    public async Task<IList<GetCertificateForTableOutDto>> GetCertificatesForTable()
    {
        var certificates = await db
            .Certificates.Where(cert => cert.Status != ResourceStatus.Created)
            .Include(cert => cert.ProjectAppointment)
            .ThenInclude(appt => appt.Project)
            .ThenInclude(proj => proj.Client)
            .OrderByDescending(cert => cert.ProjectAppointment.DueDate)
            .ToListAsync();

        return certificates
            .Select(cert => new GetCertificateForTableOutDto
            {
                ProjectId = cert.ProjectAppointment.Project.Id,
                CertificateId = cert.Id,
                AppointmentId = cert.ProjectAppointment.Id,
                Number = cert.ProjectAppointment.AppointmentNumber,
                ClientName = cert.ProjectAppointment.Project.Client.Name,
                ActualDate = cert.ProjectAppointment.ActualDate,
                Status = cert.Status,
            })
            .ToList();
    }

    public async Task<IList<GetCertificateForCreationOutDto>> GetCertificatesForCreation()
    {
        var projects = await db
            .Projects.Include(proj => proj.Client)
            .Include(proj => proj.Appointments)
            .ThenInclude(appt => appt.Certificate)
            .Where(proj =>
                proj.Appointments.Any(appt => appt.Certificate.Status == ResourceStatus.Created)
            )
            .ToListAsync();

        return projects
            .Select(project => new GetCertificateForCreationOutDto
            {
                ServiceId = project.Id,
                ClientName = project.Client.Name,
                ServiceNumber = project.ProjectNumber,
                AvailableCerts = project
                    .Appointments.Where(appt => appt.Certificate.Status == ResourceStatus.Created)
                    .OrderBy(appt => appt.DueDate)
                    .Select(appointment => new GetCertificateForCreationOutDto.CertificateAvailable
                    {
                        AppoinmentId = appointment.Id,
                        CertificateId = appointment.Certificate.Id,
                        DueDate = appointment.DueDate,
                        Status = appointment.Certificate.Status,
                    })
                    .ToList(),
            })
            .ToList();
    }
}
