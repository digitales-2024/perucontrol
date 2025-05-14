using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Model;
using PeruControl.Services;

namespace PeruControl.Controllers;

public class ReportGenerationRequest
{
    public required string Day { get; set; }
    public required string Month { get; set; }
    public required string Year { get; set; }
}

[Authorize]
public class ProjectController(
    DatabaseContext db,
    ProjectService projectService,
    LibreOfficeConverterService pdfConverterService,
    // S3Service s3Service,
    WordTemplateService wordTemplateService,
    EmailService emailService,
    WhatsappService whatsappService
) : AbstractCrudController<Project, ProjectCreateDTO, ProjectPatchDTO>(db)
{
    private static readonly SemaphoreSlim _orderNumberLock = new SemaphoreSlim(1, 1);
    private readonly ProjectService _projectService = projectService;
    private readonly LibreOfficeConverterService _pdfConverterService = pdfConverterService;
    private readonly EmailService _emailService = emailService;
    private readonly WhatsappService _whatsappService = whatsappService;

    [EndpointSummary("Create")]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public override async Task<ActionResult<Project>> Create([FromBody] ProjectCreateDTO createDTO)
    {
        var (status, msg) = await projectService.CreateProject(createDTO);
        return status switch
        {
            201 => Created(),
            400 => BadRequest(msg),
            404 => NotFound(msg),
            _ => throw new InvalidOperationException("Unexpected status code"),
        };
    }

    [EndpointSummary("Get all")]
    [HttpGet]
    [ProducesResponseType<IEnumerable<ProjectSummary>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public override async Task<ActionResult<IEnumerable<Project>>> GetAll()
    {
        var projects = await _context
            .Projects.Include(p => p.Client)
            .OrderByDescending(p => p.ProjectNumber)
            .Include(p => p.Services)
            .Include(q => q.Quotation)
            .Include(p => p.Appointments)
            .ToListAsync();

        var projectSummaries = projects
            .Select(p => new ProjectSummary
            {
                Id = p.Id,
                ProjectNumber = p.ProjectNumber,
                Client = p.Client,
                Services = p.Services,
                Status = p.Status,
                SpacesCount = p.SpacesCount,
                Area = p.Area,
                Address = p.Address,
                Quotation = p.Quotation,
                IsActive = p.IsActive,
                Price = p.Price,
                Ambients = p.Ambients,
                CreatedAt = p.CreatedAt,
                Appointments = p.Appointments.Select(a => a.DueDate).ToList(),
            })
            .ToList();

        return Ok(projectSummaries);
    }

    [EndpointSummary("Get one by Id")]
    [HttpGet("{id}")]
    [ProducesResponseType<ProjectSummarySingle>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public override async Task<ActionResult<Project>> GetById(Guid id)
    {
        var project = await _context
            .Projects.Include(p => p.Client)
            .Include(p => p.Services)
            .Include(p => p.Quotation)
            .Include(p => p.Appointments)
            .ThenInclude(a => a.Services)
            .Include(p => p.Appointments)
            .ThenInclude(a => a.ProjectOperationSheet)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
        {
            return NotFound();
        }

        var projectSummary = new ProjectSummarySingle
        {
            Id = project.Id,
            ProjectNumber = project.ProjectNumber,
            Client = project.Client,
            Services = project.Services,
            Status = project.Status,
            SpacesCount = project.SpacesCount,
            Area = project.Area,
            Address = project.Address,
            Quotation = project.Quotation,
            IsActive = project.IsActive,
            Price = project.Price,
            Ambients = project.Ambients,
            Appointments = project
                .Appointments.Select(a => new ProjectAppointmentDTO
                {
                    Id = a.Id,
                    CreatedAt = a.CreatedAt,
                    ModifiedAt = a.ModifiedAt,
                    CertificateNumber = a.CertificateNumber,
                    DueDate = a.DueDate,
                    ActualDate = a.ActualDate,
                    ServicesIds = a.Services.Select(s => s.Id).ToList(),
                    ProjectOperationSheet = a.ProjectOperationSheet,
                })
                .ToList(),
        };

        return Ok(projectSummary);
    }

    [EndpointSummary("Get one by Id v2")]
    [HttpGet("{id}/v2")]
    [ProducesResponseType<ProjectSummarySingle>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectSummarySingle>> GetById2(Guid id)
    {
        var project = await _context
            .Projects.Include(p => p.Client)
            .Include(p => p.Services)
            .Include(p => p.Quotation)
            .Include(p => p.Appointments)
            .ThenInclude(a => a.Services)
            .Include(p => p.Appointments)
            .ThenInclude(a => a.ProjectOperationSheet)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
        {
            return NotFound();
        }

        var projectSummary = new ProjectSummarySingle
        {
            Id = project.Id,
            Client = project.Client,
            Services = project.Services,
            ProjectNumber = project.ProjectNumber,
            Status = project.Status,
            SpacesCount = project.SpacesCount,
            Area = project.Area,
            Address = project.Address,
            Quotation = project.Quotation,
            IsActive = project.IsActive,
            Price = project.Price,
            Ambients = project.Ambients,
            Appointments = project
                .Appointments.Select(a => new ProjectAppointmentDTO
                {
                    Id = a.Id,
                    IsActive = a.IsActive,
                    CreatedAt = a.CreatedAt,
                    ModifiedAt = a.ModifiedAt,
                    CertificateNumber = a.CertificateNumber,
                    DueDate = a.DueDate,
                    ActualDate = a.ActualDate,
                    Cancelled = a.Cancelled,
                    EnterTime = a.EnterTime,
                    LeaveTime = a.LeaveTime,
                    AppointmentNumber = a.AppointmentNumber,
                    ServicesIds = a.Services.Select(s => s.Id).ToList(),
                    ProjectOperationSheet = a.ProjectOperationSheet,
                })
                .OrderBy(a => a.DueDate)
                .ToList(),
            CreatedAt = project.CreatedAt,
            ModifiedAt = project.ModifiedAt,
        };

        return Ok(projectSummary);
    }

    [EndpointSummary("Get one by Id v3")]
    [HttpGet("{id}/v3")]
    [ProducesResponseType<ProjectSummarySingle2>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<Project>> GetById3(Guid id)
    {
        var project = await _context
            .Projects.Include(p => p.Client)
            .Include(p => p.Services)
            .Include(p => p.Quotation)
            .Include(p => p.Appointments)
            .ThenInclude(a => a.Services)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
        {
            return NotFound();
        }

        var projectSummary = new ProjectSummarySingle2
        {
            Id = project.Id,
            Client = project.Client,
            Services = project.Services,
            ProjectNumber = project.ProjectNumber,
            Status = project.Status,
            SpacesCount = project.SpacesCount,
            Area = project.Area,
            Address = project.Address,
            Quotation = project.Quotation,
            IsActive = project.IsActive,
            Price = project.Price,
            Appointments = project.Appointments.Select(a => a.DueDate).ToList(),
            CreatedAt = project.CreatedAt,
        };

        return Ok(projectSummary);
    }

    [EndpointSummary("Update project")]
    [HttpPatch("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public override async Task<IActionResult> Patch(Guid id, [FromBody] ProjectPatchDTO patchDto)
    {
        var entity = await _dbSet.Include(p => p.Services).FirstOrDefaultAsync(p => p.Id == id);
        if (entity == null)
        {
            return NotFound();
        }

        if (patchDto.ClientId != null)
        {
            var client = await _context.Clients.FindAsync(patchDto.ClientId.Value);
            if (client == null)
            {
                return NotFound("Cliente no encontrado");
            }
            entity.Client = client;
        }

        if (patchDto.QuotationId != null)
        {
            var quotation = await _context.Quotations.FindAsync(patchDto.QuotationId.Value);
            if (quotation == null)
            {
                return NotFound("Cotización no encontrada");
            }
            entity.Quotation = quotation;
        }

        if (patchDto.Services != null)
        {
            var newServiceIds = await _context
                .Services.Where(s => patchDto.Services.Contains(s.Id))
                .Select(s => s.Id)
                .ToListAsync();

            // Check if we got all the IDs we were sent
            if (newServiceIds.Count != patchDto.Services.Count)
            {
                var invalidIds = patchDto.Services.Except(newServiceIds).ToList();

                return BadRequest($"Invalid service IDs: {string.Join(", ", invalidIds)}");
            }

            // Get services to remove (existing ones not in new list)
            var servicesToRemove = entity
                .Services.Where(s => !newServiceIds.Contains(s.Id))
                .ToList();

            // Get services to add (new ones not in existing list)
            var existingServiceIds = entity.Services.Select(s => s.Id);
            var servicesToAdd = await _context
                .Services.Where(s =>
                    newServiceIds.Contains(s.Id) && !existingServiceIds.Contains(s.Id)
                )
                .ToListAsync();

            // Apply the changes
            foreach (var service in servicesToRemove)
                entity.Services.Remove(service);

            foreach (var service in servicesToAdd)
                entity.Services.Add(service);
        }

        patchDto.ApplyPatch(entity);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [EndpointSummary("Deactivate Project by id")]
    [HttpDelete("{id}/desactivate")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeactivateProject(Guid id)
    {
        // Buscar el proyecto por ID
        var project = await _context
            .Projects.Include(p => p.Quotation) // Incluir la relación con la cotización
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
        {
            return NotFound("Proyecto no encontrado");
        }

        // Desactivar el proyecto
        project.IsActive = false;

        // Liberar la cotización asociada, si existe
        if (project.Quotation != null)
        {
            project.Quotation = null;
        }

        // Guardar los cambios en la base de datos
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [EndpointSummary("Add Appointment")]
    [EndpointDescription("Creates and adds a new appointment to a project")]
    [HttpPost("{id}/appointment")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Project>> AddAppointment(
        Guid id,
        [FromBody] AppointmentCreateDTO dto
    )
    {
        // verify project exists
        // var project = await _context.Projects.FindAsync(id);
        var project = await _context
            .Projects.Include(p => p.Services)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
            return NotFound("Proyecto no encontrado");

        // Verify services exist
        var invalidServices = dto.ServiceIds.Except(project.Services.Select(s => s.Id)).ToList();
        if (invalidServices.Any())
        {
            return BadRequest(
                $"Los siguientes servicios no existen: {string.Join(", ", invalidServices)}"
            );
        }

        // create appointment
        var newAppointment = new ProjectAppointment
        {
            DueDate = dto.DueDate,
            Certificate = new(),
            ProjectOperationSheet = new() { OperationDate = dto.DueDate },
            RodentRegister = new() { ServiceDate = dto.DueDate },
            Services = await _context
                .Services.Where(s => dto.ServiceIds.Contains(s.Id))
                .ToListAsync(),
        };

        // append appointment to projects
        _context.Entry(newAppointment).State = EntityState.Added;
        _context.Entry(newAppointment.ProjectOperationSheet).State = EntityState.Added;
        project.Appointments.Add(newAppointment);

        await _context.SaveChangesAsync();

        return Created();
    }

    [EndpointSummary("Edit Appointment")]
    [EndpointDescription("Edits an appointment from a project")]
    [HttpPatch("{proj_id}/appointment/{app_id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Project>> PatchAppointment(
        Guid proj_id,
        Guid app_id,
        [FromBody] AppointmentPatchDTO dto
    )
    {
        // validate entity exists
        var appointment = await _context
            .ProjectAppointments.Include(a => a.Project)
            .FirstOrDefaultAsync(a => a.Id == app_id);
        if (appointment is null)
            return NotFound("Evento no encontrado");
        if (appointment.Project.Id != proj_id)
            return BadRequest("Evento no pertenece al proyecto");

        // If the appointment cert id is not null, AND
        // the real date is being set, create and set the appointment cert id
        if (appointment.CertificateNumber == null && dto.ActualDate.HasValue)
        {
            await _orderNumberLock.WaitAsync();
            try
            {
                var newIdResult = await _context
                    .Database.SqlQueryRaw<int>(
                        "UPDATE \"ProjectOrderNumbers\" SET \"ProjectOrderNumberValue\" = \"ProjectOrderNumberValue\" + 1 RETURNING \"ProjectOrderNumberValue\""
                    )
                    .ToListAsync();

                if (newIdResult.Count() == 0)
                {
                    throw new InvalidOperationException(
                        "No se encontró el último ID de la cotización. Sistema corrupto."
                    );
                }

                var newId = newIdResult[0];
                appointment.CertificateNumber = newId;
            }
            finally
            {
                _orderNumberLock.Release();
            }
        }

        dto.ApplyPatch(appointment);
        await _context.SaveChangesAsync();
        return Ok();
    }

    [EndpointSummary("Cancel or reactivate an Appointment")]
    [HttpPatch("{proj_id}/cancel/{app_id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CancelAppointment(
        Guid proj_id,
        Guid app_id,
        [FromBody] AppointmentCancelDTO dto
    )
    {
        var appointment = await _context.ProjectAppointments.FindAsync(app_id);
        if (appointment == null)
            return NotFound();

        appointment.Cancelled = dto.Cancelled;
        await _context.SaveChangesAsync();

        return Ok(new { appointment.AppointmentNumber, appointment.Cancelled });
    }

    [EndpointSummary("Update enterTime and leaveTime of a Appointment")]
    [HttpPatch("{id}/times")]
    public async Task<IActionResult> UpdateAppointmentTimes(
        Guid id,
        [FromBody] UpdateAppointmentTimesDto dto
    )
    {
        var appointment = await _context.ProjectAppointments.FindAsync(id);

        if (appointment == null)
        {
            return NotFound();
        }

        appointment.EnterTime = dto.EnterTime;
        appointment.LeaveTime = dto.LeaveTime;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [EndpointSummary("Desactivate Appointment")]
    [EndpointDescription("Deactivates an appointment from a project")]
    [HttpDelete("{proj_id}/appointment/{app_id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Project>> DeactivateAppointment(Guid proj_id, Guid app_id)
    {
        // validate entity exists
        var appointment = await _context
            .ProjectAppointments.Include(a => a.Project)
            .FirstOrDefaultAsync(a => a.Id == app_id);
        if (appointment == null)
            return NotFound("Evento no encontrado");
        if (appointment.Project.Id != proj_id)
            return BadRequest("Evento no pertenece al proyecto");

        appointment.IsActive = false;
        await _context.SaveChangesAsync();
        return Ok();
    }

    [EndpointSummary("Generate Schedule Excel")]
    [EndpointDescription("Generates the Schedule spreadsheet for a project.")]
    [HttpPost("{id}/schedule/excel")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FileResult))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GenerateScheduleExcel(Guid id)
    {
        var (excelBytes, error) = await projectService.GenerateAppointmentScheduleExcel(id);
        if (error is not null)
        {
            return BadRequest(error);
        }
        if (excelBytes is null)
        {
            return NotFound("Error generando excel");
        }

        // send
        return File(excelBytes, "application/vnd.ms-excel", "schedule.xlsx");
    }

    [EndpointSummary("Generate Schedule PDF")]
    [EndpointDescription("Generates the Schedule spreadsheet for a project.")]
    [HttpPost("{id}/schedule/pdf")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FileResult))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GenerateSchedulePDF(Guid id)
    {
        var (pdfBytes, errorMsg) = await GenerateSchedulePdfBytesAsync(id);

        if (pdfBytes == null)
        {
            if (errorMsg != null && (errorMsg.ToLower().Contains("no encontrado") || errorMsg.ToLower().Contains("not found")))
            {
                return NotFound(errorMsg);
            }
            return BadRequest(errorMsg ?? "Error desconocido generando el PDF del cronograma.");
        }

        // send
        return File(pdfBytes, "application/pdf", "ficha_operaciones.pdf");
    }

    [EndpointSummary("Generate Schedule Format 2 excel")]
    [EndpointDescription("Generates the secons Schedule spreadsheet for a project.")]
    [HttpPost("{id}/schedule2/excel")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FileResult))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GenerateSchedule2Excel(Guid id)
    {
        var (odsBytes, error) = await projectService.GenerateAppointmentSchedule2Excel(id);
        if (error is not null)
        {
            return BadRequest(error);
        }
        if (odsBytes is null)
        {
            return NotFound("Error generando excel");
        }

        // send
        return File(odsBytes, "application/vnd.oasis.opendocument.spreadsheet", "cronograma.ods");
    }

    [EndpointSummary("Generate Schedule Format 2 PDF")]
    [EndpointDescription("Generates the secons Schedule spreadsheet for a project.")]
    [HttpPost("{id}/schedule2/pdf")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FileResult))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GenerateSchedule2PDF(Guid id)
    {
        var (odsBytes, error) = await projectService.GenerateAppointmentSchedule2Excel(id);
        if (error is not null)
        {
            return BadRequest(error);
        }
        if (odsBytes is null)
        {
            return NotFound("Error generando excel");
        }

        var (pdfBytes, pdfErr) = pdfConverterService.convertToPdf(odsBytes, "ods");
        if (pdfErr != "")
        {
            return BadRequest(pdfErr);
        }
        if (pdfBytes == null)
        {
            return BadRequest("Error generando PDF");
        }

        // send
        return File(pdfBytes, "application/pdf", "ficha_operaciones.pdf");
    }

    [EndpointSummary("Generate Disinfection Report Word")]
    [HttpPost("{id}/disinfection/report/word")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GenerateDisinfectionReport(
        Guid id,
        [FromBody] ReportGenerationRequest request
    )
    {
        var project = _context
            .Projects.Include(p => p.Services)
            .Include(p => p.Appointments)
            .Include(p => p.Client)
            .FirstOrDefault(p => p.Id == id);

        if (project is null)
        {
            return NotFound("No se encontró el proyecto.");
        }

        var client = project.Client;

        var placeholders = new Dictionary<string, string>
        {
            { "{project_day}", request.Day },
            { "{project_month}", request.Month },
            { "{project_year}", request.Year },
            { "{client_name}", client.ContactName ?? client.Name },
            { "{client_address}", client.FiscalAddress },
        };

        var fileBytes = wordTemplateService.GenerateWordFromTemplate(
            placeholders,
            "Templates/Informe_Desinfección.docx"
        );

        return File(
            fileBytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Informe_Desinfección.docx"
        );
    }

    [EndpointSummary("Generate Disinsection Report Word")]
    [HttpPost("{id}/disinsection/report/word")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GenerateDisinsectionReport(
        Guid id,
        [FromBody] ReportGenerationRequest request
    )
    {
        var project = _context
            .Projects.Include(p => p.Services)
            .Include(p => p.Appointments)
            .Include(p => p.Client)
            .FirstOrDefault(p => p.Id == id);

        if (project is null)
        {
            return NotFound("No se encontró el proyecto.");
        }

        var client = project.Client;

        var placeholders = new Dictionary<string, string>
        {
            { "{project_day}", request.Day },
            { "{project_month}", request.Month },
            { "{project_year}", request.Year },
            { "{client_name}", client.ContactName ?? client.Name },
            { "{client_address}", client.FiscalAddress },
        };

        var fileBytes = wordTemplateService.GenerateWordFromTemplate(
            placeholders,
            "Templates/Informe_Desinsectación.docx"
        );

        return File(
            fileBytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Informe_Desinsectación.docx"
        );
    }

    [EndpointSummary("Generate Rat Extermination Report Word")]
    [HttpPost("{id}/ratextermination/report/word")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GenerateRatExterminationReport(
        Guid id,
        [FromBody] ReportGenerationRequest request
    )
    {
        var project = _context
            .Projects.Include(p => p.Services)
            .Include(p => p.Appointments)
            .Include(p => p.Client)
            .FirstOrDefault(p => p.Id == id);

        if (project is null)
        {
            return NotFound("No se encontró el proyecto.");
        }

        var client = project.Client;

        var placeholders = new Dictionary<string, string>
        {
            { "{project_day}", request.Day },
            { "{project_month}", request.Month },
            { "{project_year}", request.Year },
            { "{client_name}", client.ContactName ?? client.Name },
            { "{client_address}", client.FiscalAddress },
        };

        var fileBytes = wordTemplateService.GenerateWordFromTemplate(
            placeholders,
            "Templates/Informe_Desratización.docx"
        );

        return File(
            fileBytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Informe_Desratización.docx"
        );
    }

    [EndpointSummary("Generate Disinfestation Sustainment Report Word")]
    [HttpPost("{id}/disinfestation/sustainment/report/word")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GenerateDisinfestationSustainmentReport(
        Guid id,
        [FromBody] ReportGenerationRequest request
    )
    {
        var project = _context
            .Projects.Include(p => p.Services)
            .Include(p => p.Appointments)
            .Include(p => p.Client)
            .FirstOrDefault(p => p.Id == id);

        if (project is null)
        {
            return NotFound("No se encontró el proyecto.");
        }

        var client = project.Client;

        var placeholders = new Dictionary<string, string>
        {
            { "{project_day}", request.Day },
            { "{project_month}", request.Month },
            { "{project_year}", request.Year },
            { "{client_name}", client.ContactName ?? client.Name },
            { "{client_address}", client.FiscalAddress },
        };

        var fileBytes = wordTemplateService.GenerateWordFromTemplate(
            placeholders,
            "Templates/Informe_Sostenimiento_Desinsectación.docx"
        );

        return File(
            fileBytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Informe_Sostenimiento_Desinsectación.docx"
        );
    }

    [EndpointSummary("Generate Desinsecticides Desratization Sustainment Report Word")]
    [HttpPost("{id}/desinsecticides/desratization/sustainment/report/word")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GenerateDesinsecticidesDesratizationSustainmentReport(
        Guid id,
        [FromBody] ReportGenerationRequest request
    )
    {
        var project = _context
            .Projects.Include(p => p.Services)
            .Include(p => p.Appointments)
            .Include(p => p.Client)
            .FirstOrDefault(p => p.Id == id);

        if (project is null)
        {
            return NotFound("No se encontró el proyecto.");
        }

        var client = project.Client;

        var placeholders = new Dictionary<string, string>
        {
            { "{project_day}", request.Day },
            { "{project_month}", request.Month },
            { "{project_year}", request.Year },
            { "{client_name}", client.ContactName ?? client.Name },
            { "{client_address}", client.FiscalAddress },
        };

        var fileBytes = wordTemplateService.GenerateWordFromTemplate(
            placeholders,
            "Templates/Informe_Sostenimiento_Desinsectación_Desratización.docx"
        );

        return File(
            fileBytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Informe_Sostenimiento_Desinsectación_Desratización.docx"
        );
    }

    [EndpointSummary("Generate Sustainability Desratization Report Word")]
    [HttpPost("{id}/sustainability/desratization/report/word")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GenerateSustainmentDesratizationReport(
        Guid id,
        [FromBody] ReportGenerationRequest request
    )
    {
        var project = _context
            .Projects.Include(p => p.Services)
            .Include(p => p.Appointments)
            .Include(p => p.Client)
            .FirstOrDefault(p => p.Id == id);

        if (project is null)
        {
            return NotFound("No se encontró el proyecto.");
        }

        var client = project.Client;

        var placeholders = new Dictionary<string, string>
        {
            { "{project_day}", request.Day },
            { "{project_month}", request.Month },
            { "{project_year}", request.Year },
            { "{client_name}", client.ContactName ?? client.Name },
            { "{client_address}", client.FiscalAddress },
        };

        var fileBytes = wordTemplateService.GenerateWordFromTemplate(
            placeholders,
            "Templates/Informe_Sostenimiento_Desratización.docx"
        );

        return File(
            fileBytes,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "Informe_Sostenimiento_Desratización.docx"
        );
    }

    [EndpointSummary("Send Schedule PDF via Email")]
    [HttpPost("{id}/schedule/email-pdf")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> SendSchedulePDFViaEmail(
        Guid id,
        [FromQuery][System.ComponentModel.DataAnnotations.Required][System.ComponentModel.DataAnnotations.EmailAddress] string email
    )
    {
        var (pdfBytes, errorMsg) = await GenerateSchedulePdfBytesAsync(id);

        if (pdfBytes == null)
        {
            if (errorMsg != null && (errorMsg.ToLower().Contains("no encontrado") || errorMsg.ToLower().Contains("not found")))
            {
                return NotFound(errorMsg);
            }
            return BadRequest(errorMsg ?? "Error desconocido generando el PDF del cronograma.");
        }

        var (ok, serviceError) = await _emailService.SendEmailAsync(
            to: email,
            subject: "Cronograma de Proyecto PDF",
            htmlBody: "",
            textBody: "",
            attachments:
            [
                new()
                {
                    FileName = "cronograma_perucontrol.pdf",
                    Content = new MemoryStream(pdfBytes),
                    ContentType = "application/pdf",
                },
            ]
        );

        if (!ok)
        {
            return StatusCode(500, serviceError ?? "Error enviando el correo");
        }

        return Ok();
    }

    [EndpointSummary("Send Schedule PDF via WhatsApp")]
    [HttpPost("{id}/schedule/whatsapp-pdf")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> SendSchedulePDFViaWhatsapp(Guid id, [FromQuery][System.ComponentModel.DataAnnotations.Required] string phoneNumber)
    {
        var (pdfBytes, errorMsg) = await GenerateSchedulePdfBytesAsync(id);

        if (pdfBytes == null)
        {
            if (errorMsg != null && (errorMsg.ToLower().Contains("no encontrado") || errorMsg.ToLower().Contains("not found")))
            {
                return NotFound(errorMsg);
            }
            return BadRequest(errorMsg ?? "Error desconocido generando el PDF del cronograma.");
        }

        await _whatsappService.SendWhatsappServiceMessageAsync(
            fileBytes: pdfBytes,
            contentSid: "HXc9bee467c02d529435b97f7694ad3b87", // Assuming this SID is generic for document sending
            fileName: "ficha_operaciones.pdf",
            phoneNumber: phoneNumber
        );

        return Ok();
    }

    private async Task<(byte[]? PdfBytes, string? ErrorMessage)> GenerateSchedulePdfBytesAsync(Guid id)
    {
        var (excelBytes, error) = await _projectService.GenerateAppointmentScheduleExcel(
            id,
            isPdf: true // This parameter seems to indicate the template type for excel, not that it returns PDF
        );

        if (error != null)
        {
            return (null, error);
        }
        if (excelBytes == null)
        {
            return (null, "Error generando los datos base (Excel) para el cronograma del proyecto.");
        }

        var (odsBytes, odsErr) = _pdfConverterService.convertTo(excelBytes, "xlsx", "ods");
        if (!string.IsNullOrEmpty(odsErr))
        {
            return (null, $"Error convirtiendo a ODS: {odsErr}");
        }
        if (odsBytes == null)
        {
            return (null, "Error generando el archivo ODS intermedio para el PDF del cronograma.");
        }

        var (pdfBytes, pdfErr) = _pdfConverterService.convertToPdf(odsBytes, "ods");
        if (!string.IsNullOrEmpty(pdfErr))
        {
            return (null, $"Error convirtiendo a PDF: {pdfErr}");
        }
        if (pdfBytes == null)
        {
            return (null, "Error final generando el archivo PDF del cronograma.");
        }

        return (pdfBytes, null);
    }
}
