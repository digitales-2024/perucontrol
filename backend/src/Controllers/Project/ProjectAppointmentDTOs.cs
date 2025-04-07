using PeruControl.Model;

namespace PeruControl.Controllers;

public class AppointmentCreateDTO
{
    public DateTime DueDate { get; set; }
}

public class AppointmentPatchDTO : IEntityPatcher<ProjectAppointment>
{
    public int? OrderNumber { get; set; } = null;
    public DateTime? DueDate { get; set; }
    public DateTime? ActualDate { get; set; }

    public void ApplyPatch(ProjectAppointment entity)
    {
        if (OrderNumber != null)
            entity.CertificateNumber = OrderNumber;
        if (DueDate != null)
            entity.DueDate = (DateTime)DueDate;
        if (ActualDate != null)
            entity.ActualDate = ActualDate;
    }
}
