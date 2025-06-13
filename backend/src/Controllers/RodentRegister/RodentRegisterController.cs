using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeruControl.Infrastructure.Model;
using PeruControl.Utils;

namespace PeruControl.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RodentRegisterController(RodentRegisterService service) : ControllerBase
{
    [HttpGet]
    public IActionResult Do()
    {
        return Ok();
    }
}
