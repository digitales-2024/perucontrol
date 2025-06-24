using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PeruControl.Infrastructure.Model;

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
            return Ok(
                new UserReturn
                {
                    Name = entity.Name,
                    Username = entity.UserName!,
                    Email = entity.Email!,
                }
            );
        }
        else
        {
            return NotFound();
        }
    }

    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [HttpPut]
    public async Task<IActionResult> UpdateUser(
        [FromBody] UserUpdateDTO dto,
        [FromServices] UserManager<User> userManager
    )
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(subClaim))
            return BadRequest();

        var user = await userManager.FindByIdAsync(subClaim);
        if (user == null)
            return NotFound();

        user.Name = dto.Name;
        user.Email = dto.Email;
        user.UserName = dto.Email;

        var updateResult = await userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            return BadRequest(updateResult.Errors);

        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            var passResult = await userManager.ResetPasswordAsync(user, token, dto.Password);
            if (!passResult.Succeeded)
                return BadRequest(passResult.Errors);
        }

        return NoContent();
    }
}

public class UserReturn
{
    public required string Name { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
}

public class UserUpdateDTO
{
    public required string Name { get; set; }
    public required string Email { get; set; }
    public string? Password { get; set; }
}
