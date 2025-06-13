using PeruControl.Infrastructure.Model;

namespace PeruControl.Controllers;

public class AppointmentGetDTO
{
    public required Project Project { get; set; } = null!;
    public int? CertificateNumber { get; set; } = null;
    public required DateTime DueDate { get; set; }
    public DateTime? ActualDate { get; set; }
    public required Client Client { get; set; }

    public required Guid Id { get; set; } = Guid.NewGuid();
    public required bool IsActive { get; set; } = true;
    public required DateTime CreatedAt { get; set; }
    public required DateTime ModifiedAt { get; set; }

    public TimeOnly? EnterTime { get; set; } // <-- Add this
    public TimeOnly? LeaveTime { get; set; } // <-- Add this

    public string? MurinoMapKey { get; set; }
    public string? MurinoMapUrl { get; set; }
}

public class AppointmentCertificatePatchDTO : IEntityPatcher<Certificate>
{
    public DateTime? ExpirationDate { get; set; } = null;

    public void ApplyPatch(Certificate entity)
    {
        if (ExpirationDate.HasValue)
        {
            entity.ExpirationDate = ExpirationDate.Value;
        }
    }
}
