using Microsoft.AspNetCore.Authorization;
using PeruControl.Infrastructure.Model;

namespace PeruControl.Controllers;

[Authorize]
public class ServiceController(DatabaseContext db)
    : AbstractCrudController<Service, ServiceCreateDTO, ServicePatchDTO>(db) { }
