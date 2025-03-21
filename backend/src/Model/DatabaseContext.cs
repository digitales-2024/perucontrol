using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace PeruControl.Model;

public class DatabaseContext(DbContextOptions<DatabaseContext> options)
    : IdentityDbContext<User, IdentityRole<Guid>, Guid>(options)
{
    public required DbSet<Business> Businesses { get; set; }
    public required DbSet<Client> Clients { get; set; }
    public required DbSet<Certificate> Certificates { get; set; }
    public required DbSet<ClientLocation> ClientLocations { get; set; }
    public required DbSet<Quotation> Quotations { get; set; }
    public required DbSet<Service> Services { get; set; }
    public required DbSet<Project> Projects { get; set; }
    public required DbSet<ProjectAppointment> ProjectAppointments { get; set; }
    public required DbSet<ProjectOrderNumber> ProjectOrderNumbers { get; set; }
    public required DbSet<Supply> Supplies { get; set; }
    public required DbSet<TermsAndConditions> TermsAndConditions { get; set; }
    public required DbSet<ProjectOperationSheet> ProjectOperationSheet { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        PeruControl.Model.Business.SetUp<Business>(builder);
        PeruControl.Model.Client.SetUp<Client>(builder);
        PeruControl.Model.Certificate.SetUp<Certificate>(builder);
        PeruControl.Model.ClientLocation.SetUp<ClientLocation>(builder);
        PeruControl.Model.Quotation.SetUp<Quotation>(builder);
        PeruControl.Model.Project.SetUp<Project>(builder);
        PeruControl.Model.ProjectAppointment.SetUp<ProjectAppointment>(builder);
        PeruControl.Model.Service.SetUp<Service>(builder);
        PeruControl.Model.Supply.SetUp<Supply>(builder);
        PeruControl.Model.TermsAndConditions.SetUp<TermsAndConditions>(builder);
        PeruControl.Model.ProjectOperationSheet.SetUp<ProjectOperationSheet>(builder);
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return await base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker
            .Entries()
            .Where(e => e.Entity is IEntity && e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            var entity = (IEntity)entry.Entity;
            var now = DateTime.UtcNow; // Use UTC time for consistency

            entity.ModifiedAt = now;
        }
    }
}
