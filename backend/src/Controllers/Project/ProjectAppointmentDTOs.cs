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

public class AppointmentGetDTO2: PeruControl.Model.BaseModel
{
  public int AppointmentNumber { get; set; }
  public int? CertificateNumber { get; set; }
  public DateTime DueDate { get; set; }
  public DateTime ActualDate { get; set; }
  public virtual ICollection<Service> Services { get; set; } = new HashSet<Service>();
  public virtual Project Project { get; set; } = null!;
  public virtual Client Client { get; set; } = null!;
  }
