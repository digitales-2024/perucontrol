using PeruControl.Model;

namespace PeruControl.Controllers;

public class CertificateCreateDTO : IMapToEntity<Certificate>
{
    public required Guid ProjectId { get; set; }
    public required DateTime ExpirationDate { get; set; }

    public Certificate MapToEntity()
    {
        return new() { ExpirationDate = ExpirationDate };
    }
}

public class CertificatePatchDTO : IEntityPatcher<Certificate>
{
    public DateTime? ExpirationDate { get; set; }

    public void ApplyPatch(Certificate entity)
    {
        if (ExpirationDate.HasValue)
        {
            entity.ExpirationDate = ExpirationDate.Value;
        }
    }
}
