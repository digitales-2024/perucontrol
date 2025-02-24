using System.Reflection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Model;

namespace PeruControl.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class AbstractCrudController<T, PatchDTO> : ControllerBase
    where T : class, IEntity
    where PatchDTO : class
{
    protected readonly DatabaseContext _context;
    protected readonly DbSet<T> _dbSet;

    public AbstractCrudController(DatabaseContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    // GET: api/[controller]
    [EndpointSummary("Get all")]
    [HttpGet]
    public virtual async Task<ActionResult<IEnumerable<T>>> GetAll()
    {
        return await _dbSet.ToListAsync();
    }

    // GET: api/[controller]/{id}
    [EndpointSummary("Get one by ID")]
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public virtual async Task<ActionResult<T>> GetById(Guid id)
    {
        var entity = await _dbSet.FindAsync(id);
        return entity == null ? NotFound() : Ok(entity);
    }

    // POST: api/[controller]
    [EndpointSummary("Create one")]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public virtual async Task<ActionResult<T>> Create([FromBody] T entity)
    {
        if (entity.Id == Guid.Empty)
        {
            entity.Id = Guid.NewGuid();
        }

        _dbSet.Add(entity);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
    }

    [EndpointSummary("Partial edit one by id")]
    [HttpPatch("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public virtual async Task<IActionResult> Patch(Guid id, [FromBody] PatchDTO patchDto)
    {
        var entity = await _dbSet.FindAsync(id);
        if (entity == null)
            return NotFound();

        var errors = new List<string>();
        var entityType = typeof(T);
        var dtoProperties = typeof(PatchDTO).GetProperties(
            BindingFlags.Public | BindingFlags.Instance
        );

        foreach (var dtoProp in dtoProperties)
        {
            var value = dtoProp.GetValue(patchDto);
            if (value == null)
                continue;

            var entityProp = entityType.GetProperty(
                dtoProp.Name,
                BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance
            );

            if (entityProp == null)
            {
                errors.Add($"Invalid property: {dtoProp.Name}");
                continue;
            }

            if (!entityProp.CanWrite)
            {
                errors.Add($"Property {dtoProp.Name} is read-only");
                continue;
            }

            try
            {
                // Handle nullable underlying types
                var targetType =
                    Nullable.GetUnderlyingType(entityProp.PropertyType) ?? entityProp.PropertyType;
                var convertedValue = Convert.ChangeType(value, targetType);
                entityProp.SetValue(entity, convertedValue);
            }
            catch (Exception ex)
            {
                errors.Add($"Error setting {dtoProp.Name}: {ex.Message}");
            }
        }

        if (errors.Count > 0)
            return BadRequest(new { Errors = errors });

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _dbSet.AnyAsync(e => e.Id == id))
                return NotFound();
            throw;
        }

        return NoContent();
    }

    [EndpointSummary("Reactivate by id")]
    [HttpPatch("{id}/reactivate")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public virtual async Task<IActionResult> Reactivate(Guid id)
    {
        var entity = await _dbSet.FindAsync(id);
        if (entity == null)
        {
            return NotFound();
        }
        entity.IsActive = true;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/[controller]/{id}
    [EndpointSummary("Deactivate by id")]
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public virtual async Task<IActionResult> Delete(Guid id)
    {
        var entity = await _dbSet.FindAsync(id);
        if (entity == null)
            return NotFound();
        entity.IsActive = false;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
