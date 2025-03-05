using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Model;
using PeruControl.Services;

namespace PeruControl.Controllers;

[Authorize]
public class QuotationController(DatabaseContext db, ExcelTemplateService excelTemplate, WordTemplateService wordTemplate)
    : AbstractCrudController<Quotation, QuotationCreateDTO, QuotationPatchDTO>(db)
{
    [EndpointSummary("Create a Quotation")]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public override async Task<ActionResult<Quotation>> Create(
        [FromBody] QuotationCreateDTO createDto
    )
    {
        var client = await _context.Set<Client>().FindAsync(createDto.ClientId);
        if (client == null)
            return NotFound("Cliente no encontrado");

        var services = await _context
            .Set<Service>()
            .Where(s => createDto.ServiceIds.Contains(s.Id))
            .ToListAsync();

        var missingServiceIds = createDto.ServiceIds
            .Except(services.Select(s => s.Id))
            .ToList();
        if (missingServiceIds.Any())
        {
            return NotFound("Algunos servicios no fueron encontrados");
        }

        var entity = createDto.MapToEntity();
        entity.Id = Guid.NewGuid();
        entity.Client = client;
        entity.Services = services;

        _dbSet.Add(entity);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
    }

    [EndpointSummary("Get all")]
    [HttpGet]
    [ProducesResponseType<IEnumerable<QuotationGetDTO>>(StatusCodes.Status200OK)]
    public override async Task<ActionResult<IEnumerable<Quotation>>> GetAll()
    {
        return await _context
            .Quotations.Include(c => c.Client)
            .Include(s => s.Services)
            .ToListAsync();
    }

    [EndpointSummary("Get one by ID")]
    [HttpGet("{id}")]
    [ProducesResponseType<QuotationGetDTO>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public override async Task<ActionResult<Quotation>> GetById(Guid id)
    {
        var entity = await _dbSet
            .Include(c => c.Client)
            .Include(s => s.Services)
            .FirstOrDefaultAsync(q => q.Id == id);
        return entity == null ? NotFound() : Ok(entity);
    }

    [EndpointSummary("Generate Excel")]
    [HttpGet("{id}/gen-excel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult GenerateExcel()
    {
        var placeholders = new Dictionary<string, string>
        {
            // sample values
            { "{{digesa_habilitacion}}", "322" },
        };
        var fileBytes = excelTemplate.GenerateExcelFromTemplate(
            placeholders,
            "template.xlsx"
        );
        return File(
            fileBytes,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "quotation.xlsx"
        );
    }

    /*[EndpointSummary("Generate Word")]*/
    /*[HttpGet("{id}/gen-word")]*/
    /*[ProducesResponseType(StatusCodes.Status200OK)]*/
    /*[ProducesResponseType(StatusCodes.Status404NotFound)]*/
    /*public IActionResult GenerateWord()*/
    /*{*/
    /*    var placeholders = new Dictionary<string, string>*/
    /*    {*/
    /*        { "{{nombre_empresa}}", "Empresa Cencosud" },*/
    /*    };*/
    /*    var fileBytes = wordTemplate.GenerateWordFromTemplate(*/
    /*        placeholders,*/
    /*        "template.docx"*/
    /*    );*/
    /*    return File(*/
    /*        fileBytes,*/
    /*        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",*/
    /*        "my-template.docx"*/
    /*    );*/
    /*}*/
}
