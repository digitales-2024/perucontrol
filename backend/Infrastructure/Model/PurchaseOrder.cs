using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PeruControl.Infrastructure.Model;

public enum PurchaseOrderStatus
{
    Pending, // Pendiente
    Accepted, // Aceptada
    Cancelled, // Cancelada
}

public enum PurchaseOrderCurrency
{
    PEN, // Peruvian Sol (S/.)
    USD, // US Dollar (US$)
}

public enum PurchaseOrderPaymentMethod
{
    Transfer, // Transferencia
    Cash, // Efectivo
}

public class PurchaseOrderProduct
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    [Required]
    public decimal Quantity { get; set; }

    [Required]
    public decimal UnitPrice { get; set; } // Without VAT
}

[Index(nameof(Number), IsUnique = true)]
public class PurchaseOrder : BaseModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Number { get; set; }

    [Required]
    public Guid SupplierId { get; set; }
    public Supplier Supplier { get; set; } = null!;

    [Required]
    public DateTime IssueDate { get; set; }

    [Required]
    public PurchaseOrderCurrency Currency { get; set; }

    [Required]
    public PurchaseOrderPaymentMethod PaymentMethod { get; set; }

    [Required]
    public int DurationDays { get; set; }

    [Required]
    public DateTime ExpirationDate { get; set; }

    [Required]
    [Column(TypeName = "jsonb")]
    public List<PurchaseOrderProduct> Products { get; set; } = new();

    [Required]
    public decimal Subtotal { get; set; }

    [Required]
    public decimal VAT { get; set; }

    [Required]
    public decimal Total { get; set; }

    [Required]
    public string TermsAndConditions { get; set; } = string.Empty;

    [Required]
    public PurchaseOrderStatus Status { get; set; } = PurchaseOrderStatus.Pending;
}

public class PurchaseOrderProductDTO
{
    public Guid? Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(250)]
    public string? Description { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Quantity must be greater than 0")]
    public decimal Quantity { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Unit price must be greater than 0")]
    public decimal UnitPrice { get; set; }
}

public class PurchaseOrderCreateDTO : IMapToEntity<PurchaseOrder>
{
    [Required]
    public Guid SupplierId { get; set; }

    [Required]
    public DateTime IssueDate { get; set; }

    [Required]
    public PurchaseOrderCurrency Currency { get; set; }

    [Required]
    public PurchaseOrderPaymentMethod PaymentMethod { get; set; }

    [Required]
    [Range(1, 365, ErrorMessage = "Duration must be between 1 and 365 days")]
    public int DurationDays { get; set; }

    [Required]
    public DateTime ExpirationDate { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "At least one product is required")]
    public List<PurchaseOrderProductDTO> Products { get; set; } = new();

    [Required]
    [Range(0, double.MaxValue)]
    public decimal Subtotal { get; set; }

    [Required]
    [Range(0, double.MaxValue)]
    public decimal VAT { get; set; }

    [Required]
    [Range(0, double.MaxValue)]
    public decimal Total { get; set; }

    [Required]
    [MaxLength(1000)]
    public string TermsAndConditions { get; set; } = string.Empty;

    public PurchaseOrder MapToEntity()
    {
        return new PurchaseOrder
        {
            SupplierId = SupplierId,
            IssueDate = IssueDate,
            Currency = Currency,
            PaymentMethod = PaymentMethod,
            DurationDays = DurationDays,
            ExpirationDate = ExpirationDate,
            Products = Products
                .Select(p => new PurchaseOrderProduct
                {
                    Id = p.Id ?? Guid.NewGuid(),
                    Name = p.Name,
                    Description = p.Description,
                    Quantity = p.Quantity,
                    UnitPrice = p.UnitPrice,
                })
                .ToList(),
            Subtotal = Subtotal,
            VAT = VAT,
            Total = Total,
            TermsAndConditions = TermsAndConditions,
            Status = PurchaseOrderStatus.Pending,
        };
    }
}

public class PurchaseOrderPatchDTO : IEntityPatcher<PurchaseOrder>
{
    public Guid? SupplierId { get; set; }
    public DateTime? IssueDate { get; set; }
    public PurchaseOrderCurrency? Currency { get; set; }
    public PurchaseOrderPaymentMethod? PaymentMethod { get; set; }
    public int? DurationDays { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public List<PurchaseOrderProductDTO>? Products { get; set; }
    public decimal? Subtotal { get; set; }
    public decimal? VAT { get; set; }
    public decimal? Total { get; set; }

    [MaxLength(1000)]
    public string? TermsAndConditions { get; set; }
    public PurchaseOrderStatus? Status { get; set; }

    public void ApplyPatch(PurchaseOrder entity)
    {
        if (SupplierId.HasValue)
            entity.SupplierId = SupplierId.Value;
        if (IssueDate.HasValue)
            entity.IssueDate = IssueDate.Value;
        if (Currency.HasValue)
            entity.Currency = Currency.Value;
        if (PaymentMethod.HasValue)
            entity.PaymentMethod = PaymentMethod.Value;
        if (DurationDays.HasValue)
            entity.DurationDays = DurationDays.Value;
        if (ExpirationDate.HasValue)
            entity.ExpirationDate = ExpirationDate.Value;
        if (Products != null)
            entity.Products = Products
                .Select(p => new PurchaseOrderProduct
                {
                    Id = p.Id ?? Guid.NewGuid(),
                    Name = p.Name,
                    Description = p.Description,
                    Quantity = p.Quantity,
                    UnitPrice = p.UnitPrice,
                })
                .ToList();
        if (Subtotal.HasValue)
            entity.Subtotal = Subtotal.Value;
        if (VAT.HasValue)
            entity.VAT = VAT.Value;
        if (Total.HasValue)
            entity.Total = Total.Value;
        if (TermsAndConditions != null)
            entity.TermsAndConditions = TermsAndConditions;
        if (Status.HasValue)
            entity.Status = Status.Value;
    }
}
