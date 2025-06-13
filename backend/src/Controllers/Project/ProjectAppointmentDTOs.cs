using PeruControl.Infrastructure.Model;

namespace PeruControl.Controllers;

public class AppointmentCreateDTO
{
    public DateTime DueDate { get; set; }
    public List<Guid> ServiceIds { get; set; } = new List<Guid>();

    public TimeOnly? EnterTime { get; set; }
    public TimeOnly? LeaveTime { get; set; }

    public string? MurinoMapKey { get; set; }
    public string? MurinoMapUrl { get; set; }
}

public class AppointmentPatchDTO : IEntityPatcher<ProjectAppointment>
{
    public int? OrderNumber { get; set; } = null;
    public DateTime? DueDate { get; set; }
    public DateTime? ActualDate { get; set; }
    public TimeOnly? EnterTime { get; set; }
    public TimeOnly? LeaveTime { get; set; }
    public string? MurinoMapKey { get; set; }
    public string? MurinoMapUrl { get; set; }

    public void ApplyPatch(ProjectAppointment entity)
    {
        if (OrderNumber != null)
            entity.CertificateNumber = OrderNumber;
        if (DueDate != null)
            entity.DueDate = (DateTime)DueDate;
        if (ActualDate != null)
            entity.ActualDate = ActualDate;
        if (EnterTime != null)
            entity.EnterTime = EnterTime.Value;
        if (LeaveTime != null)
            entity.LeaveTime = LeaveTime.Value;
        if (MurinoMapKey != null)
            entity.MurinoMapKey = MurinoMapKey;
        if (MurinoMapUrl != null)
            entity.MurinoMapUrl = MurinoMapUrl;
    }
}

public class AppointmentGetDTO2 : PeruControl.Infrastructure.Model.BaseModel
{
    public int AppointmentNumber { get; set; }
    public int? CertificateNumber { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime ActualDate { get; set; }
    public virtual ICollection<Service> Services { get; set; } = new HashSet<Service>();
    public virtual Project Project { get; set; } = null!;
    public virtual Client Client { get; set; } = null!;

    public TimeOnly? EnterTime { get; set; } // <-- Add this
    public TimeOnly? LeaveTime { get; set; } // <-- Add this

    public string? MurinoMapKey { get; set; }
    public string? MurinoMapUrl { get; set; }
}

public class AppointmentCancelDTO
{
    public bool Cancelled { get; set; }
}

public class UpdateAppointmentTimesDto
{
    public TimeOnly? EnterTime { get; set; }
    public TimeOnly? LeaveTime { get; set; }
}
