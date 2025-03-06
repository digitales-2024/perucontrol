using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PeruControl.Model;

namespace PeruControl.Controllers;

[ApiController]
[ProducesResponseType<LoginResponse>(StatusCodes.Status200OK)]
[ProducesResponseType<string>(StatusCodes.Status401Unauthorized)]
[Route("/api/[controller]")]
public class AuthController(JwtService jwt, UserManager<User> userManager) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> login([FromBody] LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return Unauthorized("Credenciales incorrectos");

        var isValid = await userManager.CheckPasswordAsync(user, request.Password);
        if (!isValid)
            return Unauthorized("Credenciales incorrectos");

        var (token, accessExpiration) = jwt.GenerateToken(
            userId: user.Id.ToString(),
            username: request.Email,
            roles: new[] { "User" }
        );
        var (refreshToken, refreshExpiration) = jwt.GenerateRefreshToken(
            user.Id.ToString(),
            request.Email
        );

        return new LoginResponse(
            AccessToken: token,
            RefreshToken: refreshToken,
            AccessExpiresIn: accessExpiration,
            RefreshExpiresIn: refreshExpiration
        );
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<LoginResponse>> refresh([FromBody] RefreshRequest req)
    {
        // validate refresh token
        var userId = jwt.ValidateRefreshToken(req.RefreshToken);
        if (userId == null)
        {
            return Unauthorized("Credencial invalido, inicie sesión de nuevo");
        }

        // get user from userid
        var user = await userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return Unauthorized("Credencial invalido, inicie sesión de nuevo");
        }

        var (token, accessExpiration) = jwt.GenerateToken(
            userId: user.Id.ToString(),
            username: user.Email!,
            roles: new[] { "User" }
        );
        var (refreshToken, refreshExpiration) = jwt.GenerateRefreshToken(
            user.Id.ToString(),
            user.Email!
        );

        return new LoginResponse(
            AccessToken: token,
            RefreshToken: refreshToken,
            AccessExpiresIn: accessExpiration,
            RefreshExpiresIn: refreshExpiration
        );
    }
}

public class LoginRequest
{
    [MinLength(3)]
    [MaxLength(100)]
    [DefaultValue("admin@admin.com")]
    public required string Email { get; set; }

    [MinLength(8)]
    [MaxLength(100)]
    [DefaultValue("Acide2025/1")]
    public required string Password { get; set; }
}

public class RefreshRequest
{
    [MinLength(1)]
    public required string RefreshToken { get; set; }
}

public record LoginResponse(
    string AccessToken,
    string RefreshToken,
    int AccessExpiresIn,
    int RefreshExpiresIn
);
