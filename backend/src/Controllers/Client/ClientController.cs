using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeruControl.Application.UseCases.Clients.CreateClient;
using PeruControl.Application.UseCases.Clients.GetAllActiveClients;
using PeruControl.Application.UseCases.Clients.GetClientById;
using PeruControl.Application.UseCases.Clients.UpdateClientInformation;

namespace PeruControl.Controllers;

[Authorize]
[ApiController]
[Route("api/[Controller]")]
public class ClientController(
    GetAllActiveClientsUseCase _getAllActiveClientsUseCase,
    GetClientByIdUseCase _getClientByIdUseCase,
    CreateClientUseCase _createClientUseCase,
    UpdateClientInformationUseCase _updateClientInformationUseCase,
    DeactivateCLientUseCase deactivateCLientUseCase
) : ControllerBase
{
    /// <summary>
    /// Get all active clients using Clean Architecture Use Case pattern
    /// </summary>
    [HttpGet]
    [EndpointSummary("Get all active clients")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<GetAllActiveClientsResponse>> GetAllActiveClients(
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
    public async Task<IActionResult> Delete(Guid id,
        CancellationToken cancellationToken
            )
    {
        var result = await deactivateCLientUseCase.ExecuteAsync(id, cancellationToken);
        if (result.IsSuccess) return Ok();
        else return BadRequest(result.Error!);
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
