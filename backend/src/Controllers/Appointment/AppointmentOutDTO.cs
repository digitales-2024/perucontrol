using System.Text.Json.Serialization;
using PeruControl.Model;

namespace PeruControl.Controllers;

public class AppointmentGetOutDTO
{
    // Appointment fields
    public required Guid Id { get; init; }
    public required int AppointmentNumber { get; init; }
    public int? CertificateNumber { get; init; }
    public TimeSpan? EnterTime { get; init; }
    public TimeSpan? LeaveTime { get; init; }
    public required DateTime DueDate { get; init; }
    public DateTime? ActualDate { get; init; }
    public required bool Cancelled { get; init; }
    public required DateTime CreatedAt { get; init; }
    public DateTime? ModifiedAt { get; init; }
    public required bool IsActive { get; init; }

    // Project basic fields
    public required ProjectBasicInfoDTO Project { get; init; } = null!;

    // Service IDs only
    public required IEnumerable<Guid> ServicesIds { get; init; } = Array.Empty<Guid>();

    // Mapping method from entity to DTO
    public static AppointmentGetOutDTO FromEntity(ProjectAppointment appointment)
    {
        return new AppointmentGetOutDTO
        {
            Id = appointment.Id,
            AppointmentNumber = appointment.AppointmentNumber,
            CertificateNumber = appointment.CertificateNumber,
            EnterTime = appointment.EnterTime,
            LeaveTime = appointment.LeaveTime,
            DueDate = appointment.DueDate,
            ActualDate = appointment.ActualDate,
            Cancelled = appointment.Cancelled,
            CreatedAt = appointment.CreatedAt,
            ModifiedAt = appointment.ModifiedAt,
            Project = new ProjectBasicInfoDTO
            {
                Id = appointment.Project.Id,
                ProjectNumber = appointment.Project.ProjectNumber,
                Address = appointment.Project.Address,
                Status = appointment.Project.Status,
                Services = appointment.Project.Services.ToList(),
            },
            ServicesIds = appointment.Services.Select(s => s.Id),
            IsActive = appointment.IsActive,
        };
    }
}

// Simple DTO for project basic info
public class ProjectBasicInfoDTO
{
    public required Guid Id { get; init; }
    public required int ProjectNumber { get; init; }
    public required string Address { get; init; } = string.Empty;
    public required IList<Service> Services { get; init; } = null!;

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public ProjectStatus Status { get; init; }
}
