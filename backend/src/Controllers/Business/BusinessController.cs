using Microsoft.AspNetCore.Authorization;
using PeruControl.Model;

namespace PeruControl.Controllers;

[Authorize]
public class BusinessController(DatabaseContext db)
    : AbstractCrudController<Business, BusinessCreateDTO, BusinessPatchDTO>(db)
{ }
