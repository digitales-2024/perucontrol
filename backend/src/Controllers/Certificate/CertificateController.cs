using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PeruControl.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CertificateController(CertificateService certificateService)
{
    [EndpointSummary("Get Certificates for table")]
    [EndpointDescription(
        "This endpoint returns a list of Certificates, sorted by most recent, and only ones with status != Created"
    )]
    [HttpGet("for-table")]
    public async Task<IList<GetCertificateForTableOutDto>> GetOperationSheetsForTable()
    {
        var list = await certificateService.GetCertificatesForTable();
        return list;
    }

    [EndpointSummary("Get Certificates for creation")]
    [EndpointDescription(
        "Returns a list of certificates and their appointments for creation, where the certificate has status == Created"
    )]
    [HttpGet("for-creation")]
    public async Task<IList<GetCertificateForCreationOutDto>> GetOperationSheetsForCreation()
    {
        var list = await certificateService.GetCertificatesForCreation();
        return list;
    }
}
