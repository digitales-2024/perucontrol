using System.Text.Json.Serialization;
using PeruControl.Infrastructure.Model;

namespace PeruControl.Controllers;

public class AppointmentGetOutDTO
{
    // Appointment fields
    public required Guid Id { get; init; }
    public required int AppointmentNumber { get; init; }
    public int? CertificateNumber { get; init; }
    public TimeOnly? EnterTime { get; init; }
    public TimeOnly? LeaveTime { get; init; }
    public required DateTime DueDate { get; init; }
    public DateTime? ActualDate { get; init; }
    public required bool Cancelled { get; init; }
    public required DateTime CreatedAt { get; init; }
    public DateTime? ModifiedAt { get; init; }
    public required bool IsActive { get; init; }
    public required ProjectOperationSheet OperationSheet { get; init; }

    // Ordered number within the project (based on due date)
    public required int OrderedNumber { get; init; }

    // Project basic fields
    public required ProjectBasicInfoDTO Project { get; init; } = null!;

    // Service IDs only
    public required IEnumerable<Guid> ServicesIds { get; init; } = Array.Empty<Guid>();

    // Treatment areas
    public required IEnumerable<TreatmentAreaDTO> TreatmentAreas { get; init; } =
        Array.Empty<TreatmentAreaDTO>();

    // Treatment products
    public required IEnumerable<TreatmentProductDTO> TreatmentProducts { get; init; } =
        Array.Empty<TreatmentProductDTO>();

    // Mapping method from entity to DTO
    public static AppointmentGetOutDTO FromEntity(ProjectAppointment appointment, int orderedNumber)
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
            OrderedNumber = orderedNumber,
            OperationSheet = appointment.ProjectOperationSheet,
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
            TreatmentAreas = appointment.TreatmentAreas.Select(TreatmentAreaDTO.FromEntity),
            TreatmentProducts = appointment.TreatmentProducts.Select(
                TreatmentProductDTO.FromEntity
            ),
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

public class TreatmentAreaDTO
{
    public required Guid Id { get; init; }
    public required string AreaName { get; init; }
    public string? ObservedVector { get; init; }
    public string? InfestationLevel { get; init; }
    public string? PerformedService { get; init; }
    public string? AppliedTechnique { get; init; }

    public static TreatmentAreaDTO FromEntity(Infrastructure.Model.TreatmentArea area)
    {
        return new TreatmentAreaDTO
        {
            Id = area.Id,
            AreaName = area.AreaName,
            ObservedVector = area.ObservedVector,
            InfestationLevel = area.InfestationLevel,
            PerformedService = area.PerformedService,
            AppliedTechnique = area.AppliedTechnique,
        };
    }
}

public class TreatmentProductDTO
{
    public required Guid Id { get; init; }
    public required ProductDTO Product { get; init; } = null!;
    public required Guid ProductAmountSolventId { get; init; }
    public required string ProductAmountSolvent { get; init; } = null!;
    public string? EquipmentUsed { get; init; }
    public string? AppliedTechnique { get; init; }
    public string? AppliedService { get; init; }
    public string? AppliedTime { get; init; }

    public static TreatmentProductDTO FromEntity(TreatmentProduct product)
    {
        return new TreatmentProductDTO
        {
            Id = product.Id,
            Product = new()
            {
                Id = product.Product.Id,
                Name = product.Product.Name,
                ActiveIngredient = product.Product.ActiveIngredient,
            },
            ProductAmountSolventId = product.ProductAmountSolvent.Id,
            ProductAmountSolvent = product.ProductAmountSolvent.AmountAndSolvent,
            EquipmentUsed = product.EquipmentUsed,
            AppliedTechnique = product.AppliedTechnique,
            AppliedService = product.AppliedService,
            AppliedTime = product.AppliedTime,
        };
    }
}

public class ProductDTO
{
    public required Guid Id { get; init; }
    public required string Name { get; set; }
    public required string ActiveIngredient { get; set; }
}
