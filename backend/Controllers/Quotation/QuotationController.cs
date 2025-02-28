using Microsoft.AspNetCore.Authorization;
using PeruControl.Model;

namespace PeruControl.Controllers;

[Authorize]
public class QuotationController(DatabaseContext db)
    : AbstractCrudController<Quotation, QuotationCreateDTO, QuotationPatchDTO>(db) { }
