using PeruControl.Infrastructure.Model;

namespace PeruControl.Controllers;

public class GetCertificateForTableOutDto
{
    public required Guid ProjectId { get; set; }
    public required Guid CertificateId { get; set; }
    public required Guid AppointmentId { get; set; }
    public required int Number { get; set; }
    public required string ClientName { get; set; }
    public DateTime? ActualDate { get; set; } = null;
    public required ResourceStatus Status { get; set; }
}

public class GetCertificateForCreationOutDto
{
    public required Guid ServiceId { get; set; }
    public required string ClientName { get; set; }
    public required int ServiceNumber { get; set; }
    public required IList<CertificateAvailable> AvailableCerts { get; set; }

    public class CertificateAvailable
    {
        public required Guid AppoinmentId { get; set; }
        public required Guid CertificateId { get; set; }
        public required DateTime DueDate { get; set; }
        public required ResourceStatus Status { get; set; }
    }
}
