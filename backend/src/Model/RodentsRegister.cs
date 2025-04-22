using System.Text.Json.Serialization;

namespace PeruControl.Model;

public class RodentRegister : BaseModel
{
    public Guid ProjectAppointmentId { get; set; }

    [JsonIgnore]
    public ProjectAppointment ProjectAppointment { get; set; } = null!;

    public required DateTime ServiceDate { get; set; }
    public DateOnly? EnterTime { get; set; }
    public DateOnly? LeaveTime { get; set; }

    public IEnumerable<RodentArea> RodentAreas { get; set; } = new HashSet<RodentArea>();

    /// Incidencias Encontradas
    public string? Incidents { get; set; }

    /// Medidas correctivas
    public string? CorrectiveMeasures { get; set; }
}

public class RodentArea : BaseModel
{
    [JsonIgnore]
    public RodentRegister RodentRegister { get; set; } = null!;

    public required string Name { get; set; }
    public required int CebaderoTrampa { get; set; }
    public required QuotationFrequency Frequency { get; set; }
    public required RodentConsumption RodentConsumption { get; set; }
    public required RodentResult RodentResult { get; set; }
    public required RodentMaterials RodentMaterials { get; set; }

    /// Principio activo
    public required string ProductName { get; set; }

    /// Dosis utilizada
    public required string ProductDose { get; set; }
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RodentResult
{
    Active,
    Inactive,
    RoedMto,
    Others,
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RodentMaterials
{
    Fungicide,
    RodenticideOrBait,
    StickyTrap,
    Tomahawk,
}

public class RodentAreaUpdateDTO
{
    public Guid? Id { get; set; }

    public string Name { get; set; } = null!;
    public int CebaderoTrampa { get; set; }
    public QuotationFrequency Frequency { get; set; }
    public RodentConsumption RodentConsumption { get; set; }
    public RodentResult RodentResult { get; set; }
    public RodentMaterials RodentMaterials { get; set; }
    public string ProductName { get; set; } = null!;
    public string ProductDose { get; set; } = null!;
}

public class RodentRegisterUpdateDTO : IEntityPatcher<RodentRegister>
{
    public DateTime? ServiceDate { get; set; }
    public DateOnly? EnterTime { get; set; }
    public DateOnly? LeaveTime { get; set; }

    public string? Incidents { get; set; }
    public string? CorrectiveMeasures { get; set; }

    public List<RodentAreaUpdateDTO> RodentAreas { get; set; } = new();

    public void ApplyPatch(RodentRegister entity)
    {
        if (ServiceDate.HasValue)
            entity.ServiceDate = ServiceDate.Value;

        if (EnterTime.HasValue)
            entity.EnterTime = EnterTime;

        if (LeaveTime.HasValue)
            entity.LeaveTime = LeaveTime;

        if (Incidents != null)
            entity.Incidents = Incidents;

        if (CorrectiveMeasures != null)
            entity.CorrectiveMeasures = CorrectiveMeasures;
    }
}
