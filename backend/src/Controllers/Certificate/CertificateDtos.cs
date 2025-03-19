using PeruControl.Model;

namespace PeruControl.Controllers;

public class CertificateCreateDTO : IMapToEntity<Certificate>
{
    public required Guid ProjectId { get; set; }
    public required string TreatedArea { get; set; }
    public required DateTime CreationDate { get; set; }
    public required DateTime ExpirationDate { get; set; }

    public Certificate MapToEntity()
    {
        return new()
        {
            CreationDate = CreationDate,
            ExpirationDate = ExpirationDate,
            TreatedArea = TreatedArea,
        };
    }
}

public class CertificatePatchDTO : IEntityPatcher<Certificate>
{
    public void ApplyPatch(Certificate entity) { }
}
