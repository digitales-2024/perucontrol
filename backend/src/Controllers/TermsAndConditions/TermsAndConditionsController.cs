using Microsoft.AspNetCore.Authorization;
using PeruControl.Infrastructure.Model;

namespace PeruControl.Controllers;

[Authorize]
public class TermsAndConditionsController(DatabaseContext db)
    : AbstractCrudController<
        TermsAndConditions,
        TermsAndConditionsCreateDTO,
        TermsAndConditionsPatchDTO
    >(db) { }
