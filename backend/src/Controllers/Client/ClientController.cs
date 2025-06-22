using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeruControl.Application.UseCases.Clients;
using PeruControl.Application.UseCases.Clients.CreateClient;
using PeruControl.Application.UseCases.Clients.GetAllActiveClients;
using PeruControl.Application.UseCases.Clients.GetClientById;
using PeruControl.Application.UseCases.Clients.UpdateClientInformation;
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
    /// Get all active clients using Clean Architecture Use Case pattern
    /// </summary>
    [HttpGet]
    [EndpointSummary("Get all active clients")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<GetAllClientsResponse>> GetAllClients(
        CancellationToken cancellationToken
    )
    {
        var request = new GetAllActiveClientsRequest();
        var result = await _getAllActiveClientsUseCase.ExecuteAsync(request, cancellationToken);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    [HttpGet("{id}")]
    [EndpointSummary("Get client by ID")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GetClientByIdResponse>> GetClientById(
        Guid id,
        CancellationToken cancellationToken
    )
    {
        var request = new GetClientByIdRequest { ClientId = id };
        var result = await _getClientByIdUseCase.ExecuteAsync(request, cancellationToken);

        if (result.IsFailure)
            return NotFound(result.Error);

        return Ok(result.Value);
    }

    [HttpPost]
    [EndpointSummary("Create new client")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CreateClientResponse>> CreateClient(
        [FromBody] CreateClientRequest request,
        CancellationToken cancellationToken
    )
    {
        var result = await _createClientUseCase.ExecuteAsync(request, cancellationToken);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return CreatedAtAction(
            nameof(GetClientById),
            new { id = result.Value!.ClientId },
            result.Value
        );
    }

    [HttpPatch("{id}")]
    [EndpointSummary("Update client information")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateClientInformation(
        Guid id,
        [FromBody] UpdateClientInformationRequest request,
        CancellationToken cancellationToken
    )
    {
        request.ClientId = id; // Ensure the ID matches the route
        var result = await _updateClientInformationUseCase.ExecuteAsync(request, cancellationToken);

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

    [HttpDelete("{id:guid}")]
    [EndpointSummary("Deactivate a client")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken cancellationToken)
    {
        var result = await deactivateClientUseCase.ExecuteAsync(id, cancellationToken);
        if (result.IsSuccess)
            return Ok();
        else
            return BadRequest(result.Error!);
    }

    [HttpPatch("{id:guid}/reactivate")]
    [EndpointSummary("Reactivate a client")]
    public async Task<IActionResult> Reactivate(Guid id, CancellationToken cancellationToken)
    {
        var result = await reactivateClientUseCase.ExecuteAsync(id, cancellationToken);
        if (result.IsSuccess)
            return Ok();
        else
            return BadRequest(result.Error!);
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
}

public class SunatQueryResponse
{
    public string? RazonSocial { get; set; }
    public string? Name { get; set; }
    public string? FiscalAddress { get; set; }
    public string? BusinessType { get; set; }
    public string? ContactName { get; set; }
}
