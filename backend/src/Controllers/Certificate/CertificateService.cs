using Microsoft.EntityFrameworkCore;
using PeruControl.Infrastructure.Model;
using PeruControl.Services;
using PeruControl.Utils;

namespace PeruControl.Controllers;

public class CertificateService(
    DatabaseContext db,
    SvgTemplateService svgTemplateService,
    WordTemplateService wordTemplateService,
    ImageService imageService,
    LibreOfficeConverterService pdfConverterService,
    EmailService emailService,
    WhatsappService whatsappService
)
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

    public async Task MarkCertificateCreated(Guid certificateId)
    {
        var certificate = await db.Certificates.FindAsync(certificateId);

        if (certificate is null)
        {
            throw new Exception("No encontrado");
        }

        certificate.Status = ResourceStatus.Started;
        await db.SaveChangesAsync();

        return;
    }

    public async Task<Result<Certificate>> GetByAppointmentId(Guid appointmentId)
    {
        var appointment = await db.Set<ProjectAppointment>()
            .Include(p => p.Certificate)
            .FirstOrDefaultAsync(a => a.Id == appointmentId);

        if (appointment == null)
            return new NotFoundResult<Certificate>("No se encontró la fecha para el Certificado");

        return new SuccessResult<Certificate>(appointment.Certificate);
    }

    public async Task<Result<Certificate>> UpdateCertificate(
        Guid certificateId,
        AppointmentCertificatePatchDTO updateDTO
    )
    {
        var certificate = await db
            .Certificates.Include(c => c.ProjectAppointment)
            .FirstOrDefaultAsync(cert => cert.Id == certificateId);

        if (certificate == null)
        {
            return new NotFoundResult<Certificate>(
                "No se encontró una ficha de operaciones para la fecha especificada."
            );
        }

        // Apply changes to the existing object
        updateDTO.ApplyPatch(certificate);

        // Save changes to the database
        db.Update(certificate);
        await db.SaveChangesAsync();

        return new SuccessResult<Certificate>(certificate);
    }

    public async Task<IEnumerable<CertificateGet>> GetAllCertificates()
    {
        var certificates = await db
            .Certificates.Include(c => c.ProjectAppointment)
            .ThenInclude(pa => pa.Services)
            .Include(c => c.ProjectAppointment)
            .ThenInclude(pa => pa.Project)
            .ThenInclude(p => p.Client)
            .Where(c => c.ProjectAppointment.CertificateNumber != null)
            .ToListAsync();

        return certificates.Select(a => new CertificateGet
        {
            Id = a.Id,
            IsActive = a.IsActive,
            CreatedAt = a.CreatedAt,
            ModifiedAt = a.ModifiedAt,
            ProjectAppointment = a.ProjectAppointment,
            ProjectAppointmentId = a.ProjectAppointmentId,
            ExpirationDate = a.ExpirationDate ?? DateTime.MinValue,
            Project = a.ProjectAppointment.Project,
            Client = a.ProjectAppointment.Project.Client,
            Services = a.ProjectAppointment.Services,
        });
    }

    private (
        ProjectAppointment? appointment,
        Business? business,
        string? error,
        string fum,
        string inse,
        string ratiz,
        string infec,
        string cis1,
        string cis2
    ) GetCertificateData(Guid certificateId)
    {
        var projectAppointment = db
            .ProjectAppointments.Include(pa => pa.Services)
            .Include(pa => pa.Certificate)
            .Include(pa => pa.ProjectOperationSheet)
            .Include(pa => pa.Project)
            .ThenInclude(p => p.Client)
            .FirstOrDefault(pa => pa.Certificate.Id == certificateId);

        if (projectAppointment is null)
            return (null, null, "No se encontró el certificado.", "", "", "", "", "", "");

        var business = db.Businesses.FirstOrDefault();
        if (business == null)
            return (
                projectAppointment,
                null,
                "Datos de la empresa no encontrados.",
                "",
                "",
                "",
                "",
                "",
                ""
            );

        if (projectAppointment.Certificate.ExpirationDate is null)
            return (
                projectAppointment,
                business,
                "La fecha de vencimiento no está establecida.",
                "",
                "",
                "",
                "",
                "",
                ""
            );

        var sheetTreatedAreas = projectAppointment.ProjectOperationSheet.TreatedAreas;
        if (string.IsNullOrEmpty(sheetTreatedAreas))
            return (
                projectAppointment,
                business,
                "Las áreas tratadas no se ingresaron en la ficha de operaciones.",
                "",
                "",
                "",
                "",
                "",
                ""
            );

        var (fum, inse, ratiz, infec, cis1, cis2) = ("", "", "", "", "", "");
        foreach (var service in projectAppointment.Services)
        {
            switch (service.Name)
            {
                case "Fumigación":
                    fum = "X";
                    break;
                case "Desinfección":
                    inse = "X";
                    break;
                case "Desinsectación":
                    ratiz = "X";
                    break;
                case "Desratización":
                    infec = "X";
                    break;
                case "Limpieza de tanque":
                    cis1 = "X";
                    cis2 = "X";
                    break;
            }
        }

        return (projectAppointment, business, null, fum, inse, ratiz, infec, cis1, cis2);
    }

    public Result<byte[]> GenerateCertificateWord(Guid certificateId)
    {
        var (projectAppointment, business, error, fum, inse, ratiz, infec, cis1, cis2) =
            GetCertificateData(certificateId);

        if (error != null)
            return new ErrorResult<byte[]>(error);
        if (projectAppointment == null)
            return new NotFoundResult<byte[]>(
                "Project appointment not found after GetCertificateData check."
            );
        if (business == null)
            return new NotFoundResult<byte[]>(
                "Business data not found after GetCertificateData check."
            );

        var project = projectAppointment.Project;
        var sheet = projectAppointment.ProjectOperationSheet;
        var client = project.Client;
        var certificate = projectAppointment.Certificate;

        var serviceNames = project.Services.Select(s => s.Name).ToList();
        var serviceNamesStr = string.Join(", ", serviceNames);

        var placeholders = new Dictionary<string, string>
        {
            { "{client_name}", client.Name },
            { "{fecha}", sheet.OperationDate.ToString("dd/MM/yyyy") },
            { "{razon_social}", client.RazonSocial ?? "-" },
            { "{client_address}", project.Address },
            { "{client_bysiness_type}", client.BusinessType ?? "" },
            { "{client_area}", sheet.TreatedAreas },
            { "{servicios}", serviceNamesStr },
            { "{fumigacion}", fum },
            { "{desinsectacion}", ratiz },
            { "{desratizacion}", infec },
            { "{desinfeccion}", inse },
            { "{tanques_elevados}", cis1 },
            { "{tanques_cisternas}", cis2 },
            { "cert_creation_date", sheet.OperationDate.ToString("dd/MM/yyyy") },
            { "client_expiration_date", certificate.ExpirationDate?.ToString("dd/MM/yyyy") ?? "-" },
        };

        var fileBytes = wordTemplateService.GenerateWordFromTemplate(
            placeholders,
            "Templates/certificado_plantilla_word.docx"
        );

        return new SuccessResult<byte[]>(fileBytes);
    }

    public Result<byte[]> GenerateCertificatePdf(Guid certificateId)
    {
        var (projectAppointment, business, error, fum, inse, ratiz, infec, cis1, cis2) =
            GetCertificateData(certificateId);

        if (error != null)
            return new ErrorResult<byte[]>(error);
        if (projectAppointment == null)
            return new NotFoundResult<byte[]>(
                "Project appointment not found after GetCertificateData check."
            );
        if (business == null)
            return new NotFoundResult<byte[]>(
                "Business data not found after GetCertificateData check."
            );

        var certificate = projectAppointment.Certificate;
        var project = projectAppointment.Project;
        var client = project.Client;
        var sheetTreatedAreas = projectAppointment.ProjectOperationSheet.TreatedAreas;

        var signature1 = imageService.GetImageAsBase64("signature1.png");
        var signature2 = imageService.GetImageAsBase64("signature2.png");
        if (signature1 is null || signature2 is null)
        {
            return new ErrorResult<byte[]>("No se configuraron las firmas de certificado.");
        }

        var clientName = (client.RazonSocial ?? client.Name).ToUpper();
        var clientAddress = project.Address.ToUpper();
        var clientGiro = (client.BusinessType ?? "").ToUpper();
        var clientTreatedAreas = (sheetTreatedAreas ?? "").ToUpper();
        var certServiceDate = (projectAppointment.ActualDate?.ToString("dd 'de' MMMM 'de' yyyy", new System.Globalization.CultureInfo("es-PE")) ?? "").ToUpper();
        var certExpirationDate = (certificate.ExpirationDate?.ToString("dd 'de' MMMM 'de' yyyy", new System.Globalization.CultureInfo("es-PE")) ?? "").ToUpper();

        var placeholders = new Dictionary<string, string>
        {
            { "{nombre_cliente}", clientName },
            { "{direccion_cliente}", clientAddress },
            { "{giro_cliente}", clientGiro},
            { "{servicio_area}", clientTreatedAreas},
            { "{fecha_servicio}", certServiceDate},
            { "{fecha_vencimiento}", certExpirationDate},
            { "{cert_n}", projectAppointment.CertificateNumber?.ToString("D6") ?? "" },
            { "{fum}", fum },
            { "{inse}", inse },
            { "{ratiz}", ratiz },
            { "{infec}", infec },
            { "{cis1}", cis1 },
            { "{cis2}", cis2 },
            { "{constancia_hab}", business.DigesaNumber },
            { "{peruc_ruc}", business.RUC },
            { "{perucontrol_telefonos}", business.Phones },
            { "{perucontrol_correo}", business.Email },
            { "{perucontrol_pagina}", "www.perucontrol.com" },
            { "{technical_name}", business.ThechnicalDirectorName },
            { "{technical_position}", business.ThechnicalDirectorPosition },
            { "{technical_cip}", business.ThechnicalDirectorCIP },
            { "{responsible_name}", business.ResponsibleName },
            { "{responsible_position}", business.ResponsiblePosition },
            { "{responsible_cip}", business.ResponsibleCIP },
            { "{imagen_firma_1}", $"data:image/png;base64,{signature1}" },
            { "{imagen_firma_2}", $"data:image/png;base64,{signature2}" },
        };

        var svgBytes = svgTemplateService.GenerateSvgFromTemplate(
            placeholders,
            "Templates/certificado_plantilla_ok.svg"
        );

        var (pdfBytes, errorStr) = pdfConverterService.ConvertToPdf(svgBytes, "svg");

        if (!string.IsNullOrEmpty(errorStr))
        {
            return new ErrorResult<byte[]>(errorStr);
        }
        if (pdfBytes == null)
        {
            return new ErrorResult<byte[]>("Error generando PDF desde SVG");
        }

        return new SuccessResult<byte[]>(pdfBytes);
    }

    public async Task<Result<string>> SendCertificatePdfViaEmail(Guid certificateId, string email)
    {
        var pdfResult = GenerateCertificatePdf(certificateId);
        if (pdfResult is not SuccessResult<byte[]> successResult)
        {
            return new ErrorResult<string>(
                "Error generating PDF: " + (pdfResult as ErrorResult<byte[]>)?.Message
            );
        }

        var (ok, serviceError) = await emailService.SendEmailAsync(
            to: email,
            subject: "CERTIFICADO DE PERUCONTROL.COM EIRL",
            htmlBody: """
                <p>¡Buen día Estimados!</p>
                <br />
                <p>Adjuntamos lo solicitado, de tener alguna duda, no duden en comunicarse conmigo.</p>
            """,
            textBody: "¡Buen día Estimados! Adjuntamos lo solicitado, de tener alguna duda, no duden en comunicarse conmigo. ",
            attachments:
            [
                new()
                {
                    FileName = "certificado_perucontrol.pdf",
                    Content = new MemoryStream(successResult.Data),
                    ContentType = "application/pdf",
                },
            ]
        );

        if (!ok)
        {
            return new ErrorResult<string>(
                serviceError ?? "Error enviando el correo con el certificado."
            );
        }

        return new SuccessResult<string>("Email sent successfully");
    }

    public async Task<Result<string>> SendCertificatePdfViaWhatsapp(
        Guid certificateId,
        string phoneNumber
    )
    {
        var pdfResult = GenerateCertificatePdf(certificateId);
        if (pdfResult is not SuccessResult<byte[]> successResult)
        {
            return new ErrorResult<string>(
                "Error generating PDF: " + (pdfResult as ErrorResult<byte[]>)?.Message
            );
        }

        await whatsappService.SendWhatsappServiceMessageAsync(
            fileBytes: successResult.Data,
            contentSid: "HXc9bee467c02d529435b97f7694ad3b87",
            fileName: "certificado.pdf",
            phoneNumber: phoneNumber
        );

        return new SuccessResult<string>("WhatsApp message sent successfully");
    }
}
