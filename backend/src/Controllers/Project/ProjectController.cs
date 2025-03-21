using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Model;
using PeruControl.Services;

namespace PeruControl.Controllers;

[Authorize]
public class ProjectController(DatabaseContext db, ExcelTemplateService excelTemplate)
    : AbstractCrudController<Project, ProjectCreateDTO, ProjectPatchDTO>(db)
{
    [EndpointSummary("Create")]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public override async Task<ActionResult<Project>> Create([FromBody] ProjectCreateDTO createDTO)
    {
        var entity = createDTO.MapToEntity();
        entity.Id = Guid.NewGuid();

        // validate the client exists before creating the project
        var client = await _context.Set<Client>().FindAsync(createDTO.ClientId);
        if (client == null)
            return NotFound("Cliente no encontrado");
        entity.Client = client;

        // if a quotation is provided, validate it exists
        Quotation? quotation = null;
        if (createDTO.QuotationId != null)
        {
            quotation = await _context.Set<Quotation>().FindAsync(createDTO.QuotationId);
            if (quotation == null)
                return NotFound("Cotización no encontrada");
            entity.Quotation = quotation;
        }

        // Validate all services exist
        if (createDTO.Services.Count == 0)
            return BadRequest("Debe ingresar al menos un servicio");

        var services = await _context
            .Set<Service>()
            .Where(s => createDTO.Services.Contains(s.Id))
            .ToListAsync();

        if (services.Count != createDTO.Services.Count)
            return NotFound("Algunos servicios no fueron encontrados");
        entity.Services = services;

        // Create and populate the project
        _context.Add(entity);
        await _context.SaveChangesAsync();

        return Created();
    }

    [EndpointSummary("Get all")]
    [HttpGet]
    [ProducesResponseType<IEnumerable<ProjectSummary>>(StatusCodes.Status200OK)]
    public override async Task<ActionResult<IEnumerable<Project>>> GetAll()
    {
        var projects = await _context
            .Projects.Include(c => c.Client)
            .Include(p => p.Services)
            .Include(q => q.Quotation)
            .ToListAsync();

        var projectSummaries = projects
            .Select(p => new ProjectSummary
            {
                Id = p.Id,
                Client = p.Client,
                Services = p.Services,
                Status = p.Status,
                SpacesCount = p.SpacesCount,
                Area = p.Area,
                Address = p.Address,
                Quotation = p.Quotation,
                IsActive = p.IsActive,
            })
            .ToList();

        return Ok(projectSummaries);
    }

    [EndpointSummary("Get one by Id")]
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ProjectSummary), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public override async Task<ActionResult<Project>> GetById(Guid id)
    {
        var project = await _context
            .Projects.Include(c => c.Client)
            .Include(p => p.Services)
            .Include(q => q.Quotation)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
        {
            return NotFound();
        }

        var projectSummary = new ProjectSummary
        {
            Id = project.Id,
            Client = project.Client,
            Services = project.Services,
            Status = project.Status,
            SpacesCount = project.SpacesCount,
            Area = project.Area,
            Address = project.Address,
            Quotation = project.Quotation,
        };

        return Ok(projectSummary);
    }

    [EndpointSummary("Update project")]
    [HttpPatch("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
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

    [EndpointSummary("Update Project State")]
    [HttpPatch("{id}/update-state")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateState(Guid id, [FromBody] ProjectStatusPatchDTO patchDto)
    {
        var project = await _dbSet.FirstOrDefaultAsync(q => q.Id == id);
        if (project == null)
        {
            return NotFound();
        }

        // Actualizar el estado del proyecto y guardar en la base de datos
        project.Status = patchDto.Status;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [EndpointSummary("Generate Operations Sheet")]
    [HttpPost("{id}/gen-operations-sheet")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GenerateOperationsSheet(
        Guid id,
        [FromBody] ProjectOperationSheetExport export
    )
    {
        var project = _dbSet
            .Include(p => p.Client)
            .Include(p => p.Services)
            .FirstOrDefault(p => p.Id == id);

        if (project == null)
        {
            return NotFound(
                $"Proyecto no encontrado (${id}). Actualize la página y regrese a la lista de cotizaciones."
            );
        }

        var serviceNames = project.Services.Select(s => s.Name).ToList();
        var serviceNamesStr = string.Join(", ", serviceNames);

        var placeholders = new Dictionary<string, string>
        {
            { "{{fecha_op}}", export.OperationDate },
            { "{{hora_ingreso}}", export.EnterTime },
            { "{{hora_salida}}", export.LeaveTime },
            { "{{razon_social}}", project.Client.RazonSocial ?? "" },
            { "{{direccion}}", project.Address },
            { "{{giro_empresa}}", project.Client.BusinessType },
            { "{{condicion_sanitaria}}", export.SanitaryCondition },
            { "{{areas_tratadas}}", export.TreatedAreas },
            { "{{servicio}}", serviceNamesStr },
            { "{{certificado_nro}}", "--prov--" },
            { "{{insectos}}", export.Insects },
            { "{{roedores}}", export.Rodents },
            { "{{otros}}", export.OtherPlagues },
            { "{{insecticida}}", export.Insecticide },
            { "{{insecticida_2}}", export.Insecticide2 },
            { "{{rodenticida}}", export.Rodenticide },
            { "{{desinfectante}}", export.Desinfectant },
            { "{{producto_otros}}", export.OtherProducts },
            { "{{insecticida_cantidad}}", export.InsecticideAmount },
            { "{{insecticida_cantidad_2}}", export.InsecticideAmount2 },
            { "{{rodenticida_cantidad}}", export.RodenticideAmount },
            { "{{desinfectante_cantidad}}", export.DesinfectantAmount },
            { "{{producto_otros_cantidad}}", export.OtherProductsAmount },
            { "{{monitoreo_desratizacion_1}}", export.RatExtermination1 },
            { "{{monitoreo_desratizacion_2}}", export.RatExtermination2 },
            { "{{monitoreo_desratizacion_3}}", export.RatExtermination3 },
            { "{{monitoreo_desratizacion_4}}", export.RatExtermination4 },
            { "{{personal_1}}", export.Staff1 },
            { "{{personal_2}}", export.Staff2 },
            { "{{personal_3}}", export.Staff3 },
            { "{{personal_4}}", export.Staff4 },
            { "{{aspersion_manual}}", export.aspersionManual ? "Sí" : "No" },
            { "{{aspersion_motor}}", export.aspersionMotor ? "Sí" : "No" },
            { "{{nebulizacion_frio}}", export.nebulizacionFrio ? "Sí" : "No" },
            { "{{nebulizacion_caliente}}", export.nebulizacionCaliente ? "Sí" : "No" },
            { "{{nebulizacion_cebos_total}}", export.nebulizacionCebosTotal ? "Sí" : "No" },
            { "{{colocacion_cebos_cebaderos}}", export.colocacionCebosCebaderos ? "Sí" : "No" },
            { "{{colocacion_cebos_repuestos}}", export.colocacionCebosRepuestos ? "Sí" : "No" },
            /* { "{{degree_insect_infectivity}}", export.degreeInsectInfectivity.ToString() },
            { "{{degree_rodent_infectivity}}", export.degreeRodentInfectivity.ToString() }, */
            { "{{observations}}", export.observations },
            { "{{recommendations}}", export.recommendations },
        };
        var fileBytes = excelTemplate.GenerateExcelFromTemplate(
            placeholders,
            "Templates/ficha_operaciones.xlsx"
        );
        return File(
            fileBytes,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "quotation.xlsx"
        );
    }
}
