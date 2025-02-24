using Microsoft.EntityFrameworkCore;

namespace PeruControl.Model;

public interface IEntity
{
    Guid Id { get; set; }
    bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ModifiedAt { get; set; }
}

public abstract class BaseModel : IEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime ModifiedAt { get; set; }

    public static void SetUp<A>(ModelBuilder modelBuilder)
        where A : class, IEntity
    {
        modelBuilder.Entity<A>().Property(b => b.CreatedAt).HasDefaultValueSql("NOW()");
        modelBuilder.Entity<A>().Property(b => b.ModifiedAt).HasDefaultValueSql("NOW()");
    }
}
