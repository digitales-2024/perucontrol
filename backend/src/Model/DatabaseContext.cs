using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PeruControl.Model.Reports;

namespace PeruControl.Model;

public class DatabaseContext(DbContextOptions<DatabaseContext> options)
    : IdentityDbContext<User, IdentityRole<Guid>, Guid>(options)
{
    public required DbSet<Business> Businesses { get; set; }
    public required DbSet<Client> Clients { get; set; }
    public required DbSet<Certificate> Certificates { get; set; }
    public required DbSet<ClientLocation> ClientLocations { get; set; }
    public required DbSet<CompleteReport> CompleteReports { get; set; }
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

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        PeruControl.Model.Business.SetUp<Business>(builder);
        PeruControl.Model.Client.SetUp<Client>(builder);
        PeruControl.Model.Certificate.SetUp<Certificate>(builder);
        PeruControl.Model.ClientLocation.SetUp<ClientLocation>(builder);
        PeruControl.Model.Reports.CompleteReport.SetUp<CompleteReport>(builder);
        PeruControl.Model.Quotation.SetUp<Quotation>(builder);
        PeruControl.Model.QuotationService.SetUp<QuotationService>(builder);
        PeruControl.Model.RodentRegister.SetUp<RodentRegister>(builder);
        PeruControl.Model.RodentArea.SetUp<RodentArea>(builder);
        PeruControl.Model.Service.SetUp<Service>(builder);
        PeruControl.Model.Product.SetUp<Product>(builder);
        PeruControl.Model.Project.SetUp<Project>(builder);
        PeruControl.Model.ProjectAppointment.SetUp<ProjectAppointment>(builder);
        PeruControl.Model.ProjectOperationSheet.SetUp<ProjectOperationSheet>(builder);
        PeruControl.Model.TermsAndConditions.SetUp<TermsAndConditions>(builder);
        PeruControl.Model.TreatmentArea.SetUp<TreatmentArea>(builder);
        PeruControl.Model.TreatmentProduct.SetUp<TreatmentProduct>(builder);
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
