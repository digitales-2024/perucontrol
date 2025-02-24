using Microsoft.AspNetCore.Authorization;
using PeruControl.Model;

namespace PeruControl.Controllers;

[Authorize]
public class TermsAndConditionsController(DatabaseContext db)
    : AbstractCrudController<TermsAndConditions, TermsAndConditionsPatchDTO>(db) { }
