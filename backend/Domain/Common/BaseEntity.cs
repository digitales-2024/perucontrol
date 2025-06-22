namespace PeruControl.Domain.Common;

public abstract class BaseEntity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();
    public bool IsActive { get; protected set; } = true;
    public DateTime CreatedAt { get; protected set; }
    public DateTime ModifiedAt { get; protected set; }

    protected BaseEntity()
    {
        CreatedAt = DateTime.UtcNow;
        ModifiedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        ModifiedAt = DateTime.UtcNow;
    }

    public void Reactivate()
    {
        IsActive = true;
        ModifiedAt = DateTime.UtcNow;
    }

    protected void UpdateModifiedAt()
    {
        ModifiedAt = DateTime.UtcNow;
    }
}
