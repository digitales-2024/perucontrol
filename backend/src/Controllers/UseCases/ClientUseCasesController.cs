using Microsoft.AspNetCore.Mvc;
using PeruControl.Application.UseCases.Clients.GetAllActiveClients;

namespace PeruControl.Controllers.UseCases;

[ApiController]
[Route("api/v2/clients")]
public class ClientUseCasesController(GetAllActiveClientsUseCase getAllActiveClientsUseCase)
    : ControllerBase
{
    /// <summary>
    /// Get all active clients using Clean Architecture Use Case pattern
    /// </summary>
    [HttpGet("active")]
    public async Task<IActionResult> GetAllActiveClients()
    {
        var request = new GetAllActiveClientsRequest();
        var result = await getAllActiveClientsUseCase.ExecuteAsync(request);

        if (result.IsFailure)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }
}
