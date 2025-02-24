using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeruControl.Model;

namespace PeruControl.Controllers;

[ApiController]
[Route("/api/[controller]")]
[Authorize]
public class UserController(DatabaseContext db) : ControllerBase
{
    [ProducesResponseType<UserReturn>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [EndpointDescription("Gets info about the currently logged in user, based on the JWT token.")]
    [HttpGet]
    public async Task<IActionResult> GetUser()
    {
        // get sub claim from jwt
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(subClaim))
        {
            return BadRequest();
        }

        // get user from db
        var entity = await db.Set<User>().FindAsync(new Guid(subClaim));
        if (entity != null)
        {
            return Ok(new UserReturn { Username = entity.UserName!, Email = entity.Email! });
        }
        else
        {
            return NotFound();
        }
    }
}

public class UserReturn
{
    public required string Username { get; set; }
    public required string Email { get; set; }
}
