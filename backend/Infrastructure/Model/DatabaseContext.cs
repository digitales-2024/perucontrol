using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PeruControl.Infrastructure.Configurations;
using PeruControl.Infrastructure.Model.Reports;
using PeruControl.Infrastructure.Model.Whatsapp;

namespace PeruControl.Infrastructure.Model;

public class DatabaseContext(DbContextOptions<DatabaseContext> options)
    : IdentityDbContext<User, IdentityRole<Guid>, Guid>(options)
{
    public required DbSet<Business> Businesses { get; set; }
    public required DbSet<Certificate> Certificates { get; set; }
    public required DbSet<CompleteReport> CompleteReports { get; set; }
    public required DbSet<Report1> Report1s { get; set; }
    public required DbSet<Report2> Report2s { get; set; }
    public required DbSet<Report3> Report3s { get; set; }
    public required DbSet<Report4> Report4s { get; set; }
    public required DbSet<Quotation> Quotations { get; set; }
    public required DbSet<QuotationService> QuotationServices { get; set; }
    public required DbSet<RodentRegister> RodentRegisters { get; set; }
    public required DbSet<RodentArea> RodentAreas { get; set; }
    public required DbSet<Service> Services { get; set; }
    public required DbSet<Product> Products { get; set; }
    public required DbSet<Project> Projects { get; set; }
    public required DbSet<ProjectAppointment> ProjectAppointments { get; set; }
    public required DbSet<ProjectOperationSheet> ProjectOperationSheet { get; set; }
    public required DbSet<ProjectOrderNumber> ProjectOrderNumbers { get; set; }
    public required DbSet<TermsAndConditions> TermsAndConditions { get; set; }
    public required DbSet<TreatmentArea> TreatmentAreas { get; set; }
    public required DbSet<TreatmentProduct> TreatmentProducts { get; set; }
    public required DbSet<WhatsappTemp> WhatsappTemps { get; set; }

    // New Domain entities
    public required DbSet<Domain.Entities.Client> Clients { get; set; }
    public required DbSet<Domain.Entities.ClientLocation> ClientLocations { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Old Infrastructure model configurations
        BaseModel.SetUp<Business>(builder);
        BaseModel.SetUp<Certificate>(builder);
        BaseModel.SetUp<CompleteReport>(builder);
        BaseModel.SetUp<Report1>(builder);
        BaseModel.SetUp<Report2>(builder);
        BaseModel.SetUp<Report3>(builder);
        BaseModel.SetUp<Report4>(builder);
        BaseModel.SetUp<Quotation>(builder);
        BaseModel.SetUp<QuotationService>(builder);
        BaseModel.SetUp<RodentRegister>(builder);
        BaseModel.SetUp<RodentArea>(builder);
        BaseModel.SetUp<Service>(builder);
        BaseModel.SetUp<Product>(builder);
        BaseModel.SetUp<Project>(builder);
        BaseModel.SetUp<ProjectAppointment>(builder);
        BaseModel.SetUp<ProjectOperationSheet>(builder);
        BaseModel.SetUp<TermsAndConditions>(builder);
        BaseModel.SetUp<TreatmentArea>(builder);
        BaseModel.SetUp<TreatmentProduct>(builder);

        // New Domain entity configurations
        builder.ApplyConfiguration(new ClientConfiguration());
        builder.ApplyConfiguration(new ClientLocationConfiguration());
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
