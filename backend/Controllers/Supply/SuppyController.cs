using Microsoft.AspNetCore.Authorization;
using PeruControl.Model;

namespace PeruControl.Controllers;

[Authorize]
public class SupplyController(DatabaseContext db)
    : AbstractCrudController<Supply, SupplyCreateDTO, SupplyPatchDTO>(db) { }
