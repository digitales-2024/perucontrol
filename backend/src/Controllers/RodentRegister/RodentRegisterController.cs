using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PeruControl.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RodentRegisterController() : ControllerBase
{
    [HttpGet]
    public IActionResult Do()
    {
        return Ok();
    }
}
