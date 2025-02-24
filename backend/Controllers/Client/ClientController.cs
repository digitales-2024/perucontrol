using Microsoft.AspNetCore.Authorization;
using PeruControl.Model;

namespace PeruControl.Controllers;

[Authorize]
public class ClientController(DatabaseContext db)
    : AbstractCrudController<Client, ClientPatchDTO>(db) { }
