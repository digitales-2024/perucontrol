using Microsoft.AspNetCore.Authorization;
using PeruControl.Model;

namespace PeruControl.Controllers;

[Authorize]
public class ServiceController(DatabaseContext db)
    : AbstractCrudController<Service, ServiceCreateDTO, ServicePatchDTO>(db) { }
