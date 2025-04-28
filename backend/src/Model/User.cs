using Microsoft.AspNetCore.Identity;

namespace PeruControl.Model;

public class User : IdentityUser<Guid>
{
    public required string Name { get; set; }
}
