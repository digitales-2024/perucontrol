using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeruControl.Application.UseCases.Clients;
using PeruControl.Application.UseCases.Clients.CreateClient;
using PeruControl.Application.UseCases.Clients.GetAllActiveClients;
using PeruControl.Application.UseCases.Clients.GetClientById;
using PeruControl.Application.UseCases.Clients.UpdateClientInformation;
using PeruControl.Infrastructure.Model;
using PeruControl.Services;

namespace PeruControl.Controllers;

[Authorize]
[ApiController]
[Route("api/[Controller]")]
public class ClientController(
    GetAllActiveClientsUseCase _getAllActiveClientsUseCase,
    GetClientByIdUseCase _getClientByIdUseCase,
    CreateClientUseCase _createClientUseCase,
    UpdateClientInformationUseCase _updateClientInformationUseCase,
    DeactivateClientUseCase deactivateClientUseCase,
    ReactivateClientUseCase reactivateClientUseCase,
    ClientService clientService,
    CsvExportService csvExportService,
    ILogger<ClientController> logger
) : ControllerBase
{
    /// <summary>
    /// Get all active clients - Legacy endpoint using Clean Architecture
    /// </summary>
    [HttpGet]
    [EndpointSummary("Get all")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<LegacyClient>>> GetAll(
        CancellationToken cancellationToken
    )
    {
        var request = new GetAllActiveClientsRequest();
        var result = await _getAllActiveClientsUseCase.ExecuteAsync(request, cancellationToken);

        if (result.IsFailure)
            return BadRequest(result.Error);

        var legacyClients = result.Value!.Clients.Select(MapToLegacyClient).ToList();
        return Ok(legacyClients);
    }

    /// <summary>
    /// Get client by ID - Legacy endpoint using Clean Architecture
    /// </summary>
    [HttpGet("{id}")]
    [EndpointSummary("Get one by ID")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LegacyClient>> GetById(
        Guid id,
        CancellationToken cancellationToken
    )
    {
        var request = new GetClientByIdRequest { ClientId = id };
        var result = await _getClientByIdUseCase.ExecuteAsync(request, cancellationToken);

        if (result.IsFailure)
            return NotFound(result.Error);

        var legacyClient = MapToLegacyClient(result.Value!.Client);
        return Ok(legacyClient);
    }

    /// <summary>
    /// Create client - Legacy endpoint using Clean Architecture
    /// </summary>
    [HttpPost]
    [EndpointSummary("Create")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LegacyClient>> Create(
        [FromBody] ClientCreateDTO createDTO,
        CancellationToken cancellationToken
    )
    {
        var createRequest = new CreateClientRequest
        {
            DocumentType = createDTO.TypeDocument,
            DocumentValue = createDTO.TypeDocumentValue,
            Name = createDTO.Name,
            FiscalAddress = createDTO.FiscalAddress,
            Email = createDTO.Email,
            PhoneNumber = createDTO.PhoneNumber,
            RazonSocial = createDTO.RazonSocial,
            BusinessType = createDTO.BusinessType,
            ContactName = createDTO.ContactName,
            Locations = createDTO
                .ClientLocations?.Where(cl => !string.IsNullOrWhiteSpace(cl.Address))
                .Select(cl => cl.Address)
                .ToList(),
        };

        var result = await _createClientUseCase.ExecuteAsync(createRequest, cancellationToken);

        if (result.IsFailure)
            return BadRequest(result.Error);

        // Get the created client to return the full object
        var getRequest = new GetClientByIdRequest { ClientId = result.Value!.ClientId };
        var getResult = await _getClientByIdUseCase.ExecuteAsync(getRequest, cancellationToken);

        if (getResult.IsFailure)
            return BadRequest(getResult.Error);

        var legacyClient = MapToLegacyClient(getResult.Value!.Client);
        return CreatedAtAction(nameof(GetById), new { id = legacyClient.Id }, legacyClient);
    }

    /// <summary>
    /// Update client - Legacy endpoint using Clean Architecture (note the /update/ route)
    /// </summary>
    [HttpPatch("/update/{id}")]
    [EndpointSummary("Actualizar cliente por ID")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateClient(
        Guid id,
        [FromBody] ClientPatchDTO patchDTO,
        CancellationToken cancellationToken
    )
    {
        var updateRequest = new UpdateClientInformationRequest
        {
            ClientId = id,
            Name = patchDTO.Name,
            RazonSocial = patchDTO.RazonSocial,
            BusinessType = patchDTO.BusinessType,
            ContactName = patchDTO.ContactName,
            FiscalAddress = patchDTO.FiscalAddress,
            Email = patchDTO.Email,
            PhoneNumber = patchDTO.PhoneNumber,
            Locations = patchDTO
                .ClientLocations?.Select(cl => new LocationUpdateDto
                {
                    Id = null, // For backward compatibility, we'll treat all as new
                    Address = cl.Address,
                })
                .ToList(),
        };

        var result = await _updateClientInformationUseCase.ExecuteAsync(
            updateRequest,
            cancellationToken
        );

        if (result.IsFailure)
        {
            if (result.Error.Contains("not found"))
                return NotFound(result.Error);
            if (result.Error.Contains("concurrencia") || result.Error.Contains("otro usuario"))
                return Conflict(result.Error);

            return BadRequest(result.Error);
        }

        return NoContent();
    }

    /// <summary>
    /// Delete client - Legacy endpoint using Clean Architecture
    /// </summary>
    [HttpDelete("{id}")]
    [EndpointSummary("Delete client")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await deactivateClientUseCase.ExecuteAsync(id, cancellationToken);
        if (result.IsSuccess)
            return Ok();
        else
            return NotFound(result.Error!);
    }

    /// <summary>
    /// Reactivate client - Legacy endpoint using Clean Architecture
    /// </summary>
    [HttpPatch("{id}/reactivate")]
    [EndpointSummary("Reactive client by Id")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Reactivate(Guid id, CancellationToken cancellationToken)
    {
        var result = await reactivateClientUseCase.ExecuteAsync(id, cancellationToken);
        if (result.IsSuccess)
            return Ok();
        else
            return NotFound(result.Error!);
    }

    [HttpGet("search-by-ruc/{ruc}")]
    [EndpointSummary("Get business data by RUC")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SunatQueryResponse>> SearchByRuc(string ruc)
    {
        try
        {
            // first check if the ruc is already in the db, to not hit SUNAT unnecessarily
            // disabled due to: implementation speed
            // var client = await _context.Clients.FirstOrDefaultAsync(c =>
            //     c.TypeDocumentValue == ruc
            // );
            // if (client != null)
            // {
            //     return Ok(
            //         new SunatQueryResponse
            //         {
            //             RazonSocial = client.RazonSocial,
            //             Name = client.Name,
            //             FiscalAddress = client.FiscalAddress,
            //             BusinessType = client.BusinessType,
            //             ContactName = client.ContactName,
            //         }
            //     );
            // }

            var data = await clientService.ScrapSunat(ruc);
            return Ok(data);
        }
        catch (HttpRequestException ex)
        {
            logger.LogDebug($"HTTP Error when fetching SUNAT: {ex.StatusCode} - {ex.Message}");
            return NotFound();
        }
    }

    [EndpointSummary("Export all clients to CSV with optional date range filtering")]
    [EndpointDescription(
        "Export clients to CSV. Use startDate and endDate query parameters to filter by creation date. If startDate is not specified, exports from Unix epoch start (1970-01-01). If endDate is not specified, exports until current time."
    )]
    [HttpGet("export/csv")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FileResult))]
    public async Task<IActionResult> ExportClientsCsv(
        CancellationToken cancellationToken,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null
    )
    {
        var allClientsResult = await _getAllActiveClientsUseCase.ExecuteAsync(
            new GetAllActiveClientsRequest(),
            cancellationToken
        );
        if (allClientsResult.IsFailure)
        {
            return BadRequest(allClientsResult.Error);
        }

        var csvBytes = csvExportService.ExportClientsToCsv(
            allClientsResult.Value!.Clients,
            startDate,
            endDate
        );

        // Create a more descriptive filename with date range info
        var fileName = "clients_export";
        if (startDate.HasValue || endDate.HasValue)
        {
            fileName += "_";
            if (startDate.HasValue)
                fileName += $"from_{startDate.Value:yyyyMMdd}";
            if (endDate.HasValue)
                fileName += $"_to_{endDate.Value:yyyyMMdd}";
        }
        fileName += $"_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";

        return File(csvBytes, "text/csv", fileName);
    }

    #region Private Mapping Helpers

    private static LegacyClient MapToLegacyClient(ClientDto clientDto)
    {
        return new LegacyClient
        {
            Id = clientDto.Id,
            ClientNumber = clientDto.ClientNumber,
            TypeDocument = clientDto.DocumentType,
            TypeDocumentValue = clientDto.DocumentValue,
            RazonSocial = clientDto.RazonSocial,
            BusinessType = clientDto.BusinessType,
            Name = clientDto.Name,
            FiscalAddress = clientDto.FiscalAddress,
            Email = clientDto.Email,
            PhoneNumber = clientDto.PhoneNumber,
            ContactName = clientDto.ContactName,
            ClientLocations = clientDto
                .Locations.Select(l => new LegacyClientLocation { Id = l.Id, Address = l.Address })
                .ToList(),
            CreatedAt = clientDto.CreatedAt,
            ModifiedAt = clientDto.ModifiedAt,
            IsActive = clientDto.IsActive,
        };
    }

    #endregion
}

#region Legacy DTOs for Backward Compatibility

/// <summary>
/// Legacy Client model for backward compatibility
/// </summary>
public class LegacyClient : IEntity
{
    public Guid Id { get; set; }
    public int ClientNumber { get; set; }
    public required string TypeDocument { get; set; }
    public required string TypeDocumentValue { get; set; }
    public string? RazonSocial { get; set; }
    public string? BusinessType { get; set; }
    public required string Name { get; set; }
    public required string FiscalAddress { get; set; }
    public required string Email { get; set; }
    public required string PhoneNumber { get; set; }
    public string? ContactName { get; set; }
    public required ICollection<LegacyClientLocation> ClientLocations { get; set; } =
        new List<LegacyClientLocation>();
    public DateTime CreatedAt { get; set; }
    public DateTime ModifiedAt { get; set; }
    public bool IsActive { get; set; }
}

/// <summary>
/// Legacy ClientLocation model for backward compatibility
/// </summary>
public class LegacyClientLocation : IEntity
{
    public Guid Id { get; set; }
    public string Address { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime ModifiedAt { get; set; }
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// Legacy DTO for creating clients - for backward compatibility
/// </summary>
public class ClientCreateDTO : IMapToEntity<LegacyClient>
{
    [MinLength(0)]
    [MaxLength(3)]
    public required string TypeDocument { get; set; }

    [MinLength(8, ErrorMessage = "El documento debe tener al menos 8 caracteres")]
    [MaxLength(11, ErrorMessage = "El documento debe tener como máximo 11 caracteres")]
    public required string TypeDocumentValue { get; set; }

    [MinLength(0)]
    [MaxLength(150, ErrorMessage = "La razón social debe tener como máximo 150 caracteres")]
    public string? RazonSocial { get; set; }

    [MinLength(0)]
    [MaxLength(250, ErrorMessage = "El tipo de negocio debe tener como máximo 250 caracteres")]
    public string? BusinessType { get; set; }

    [MinLength(1, ErrorMessage = "El nombre no puede estar vacio")]
    [MaxLength(100, ErrorMessage = "El nombre debe tener como máximo 100 caracteres")]
    public required string Name { get; set; }

    [MinLength(1)]
    [MaxLength(250, ErrorMessage = "La dirección debe tener como máximo 100 caracteres")]
    public required string FiscalAddress { get; set; }

    [MinLength(3)]
    [MaxLength(50, ErrorMessage = "El email debe tener como máximo 50 caracteres")]
    public required string Email { get; set; }

    public ICollection<ClientLocationDTO>? ClientLocations { get; set; }

    [MinLength(6, ErrorMessage = "El número de teléfono debe tener al menos 6 caracteres")]
    [MaxLength(24, ErrorMessage = "El número de teléfono debe tener como máximo 24 caracteres")]
    public required string PhoneNumber { get; set; }

    [MinLength(0)]
    [MaxLength(100, ErrorMessage = "El nombre contacto debe tener como máximo 100 caracteres")]
    public string? ContactName { get; set; }

    public LegacyClient MapToEntity()
    {
        return new LegacyClient
        {
            TypeDocument = TypeDocument,
            TypeDocumentValue = TypeDocumentValue,
            RazonSocial = RazonSocial,
            BusinessType = BusinessType,
            Name = Name,
            FiscalAddress = FiscalAddress,
            Email = Email,
            PhoneNumber = PhoneNumber,
            ContactName = ContactName,
            ClientLocations =
                ClientLocations != null && ClientLocations.Any()
                    ? ClientLocations
                        .Where(c => !string.IsNullOrWhiteSpace(c.Address))
                        .Select(c => c.MapToEntity())
                        .ToList()
                    : new List<LegacyClientLocation>(),
        };
    }
}

/// <summary>
/// Legacy DTO for patching clients - for backward compatibility
/// </summary>
public class ClientPatchDTO : IEntityPatcher<LegacyClient>
{
    [MinLength(0)]
    [MaxLength(150)]
    public string? RazonSocial { get; set; }

    [MinLength(0)]
    [MaxLength(250)]
    public string? BusinessType { get; set; }

    [MinLength(1)]
    [MaxLength(100)]
    public string? Name { get; set; }

    [MinLength(1)]
    [MaxLength(250)]
    public string? FiscalAddress { get; set; }

    [MinLength(3)]
    [MaxLength(50)]
    public string? Email { get; set; }

    [MinLength(6)]
    [MaxLength(24)]
    public string? PhoneNumber { get; set; }

    [MinLength(0)]
    [MaxLength(100)]
    public string? ContactName { get; set; }

    public ICollection<ClientLocationDTO>? ClientLocations { get; set; }

    public void ApplyPatch(LegacyClient entity)
    {
        if (RazonSocial != null)
            entity.RazonSocial = RazonSocial;
        if (BusinessType != null)
            entity.BusinessType = BusinessType;
        if (Name != null)
            entity.Name = Name;
        if (FiscalAddress != null)
            entity.FiscalAddress = FiscalAddress;
        if (Email != null)
            entity.Email = Email;
        if (PhoneNumber != null)
            entity.PhoneNumber = PhoneNumber;
        if (ContactName != null)
            entity.ContactName = ContactName;
    }
}

/// <summary>
/// Legacy DTO for client locations - for backward compatibility
/// </summary>
public class ClientLocationDTO : IMapToEntity<LegacyClientLocation>
{
    public string Address { get; set; } = string.Empty;

    public LegacyClientLocation MapToEntity()
    {
        return new LegacyClientLocation { Address = Address };
    }
}

#endregion

public class SunatQueryResponse
{
    public string? RazonSocial { get; set; }
    public string? Name { get; set; }
    public string? FiscalAddress { get; set; }
    public string? BusinessType { get; set; }
    public string? ContactName { get; set; }
}
