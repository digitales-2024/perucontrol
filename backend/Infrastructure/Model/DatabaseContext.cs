using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PeruControl.Infrastructure.Model.Reports;
using PeruControl.Infrastructure.Model.Whatsapp;

namespace PeruControl.Infrastructure.Model;

public class DatabaseContext(DbContextOptions<DatabaseContext> options)
    : IdentityDbContext<User, IdentityRole<Guid>, Guid>(options)
{
    public required DbSet<Business> Businesses { get; set; }
    public required DbSet<Client> Clients { get; set; }
    public required DbSet<Supplier> Suppliers { get; set; }
    public required DbSet<Certificate> Certificates { get; set; }
    public required DbSet<ClientLocation> ClientLocations { get; set; }
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

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        PeruControl.Infrastructure.Model.Business.SetUp<Business>(builder);
        PeruControl.Infrastructure.Model.Client.SetUp<Client>(builder);
        PeruControl.Infrastructure.Model.Certificate.SetUp<Certificate>(builder);
        PeruControl.Infrastructure.Model.ClientLocation.SetUp<ClientLocation>(builder);
        PeruControl.Infrastructure.Model.Supplier.SetUp<Supplier>(builder);
        PeruControl.Infrastructure.Model.Reports.CompleteReport.SetUp<CompleteReport>(builder);
        PeruControl.Infrastructure.Model.Reports.Report1.SetUp<Report1>(builder);
        PeruControl.Infrastructure.Model.Reports.Report2.SetUp<Report2>(builder);
        PeruControl.Infrastructure.Model.Reports.Report3.SetUp<Report3>(builder);
        PeruControl.Infrastructure.Model.Reports.Report4.SetUp<Report4>(builder);
        PeruControl.Infrastructure.Model.Quotation.SetUp<Quotation>(builder);
        PeruControl.Infrastructure.Model.QuotationService.SetUp<QuotationService>(builder);
        PeruControl.Infrastructure.Model.RodentRegister.SetUp<RodentRegister>(builder);
        PeruControl.Infrastructure.Model.RodentArea.SetUp<RodentArea>(builder);
        PeruControl.Infrastructure.Model.Service.SetUp<Service>(builder);
        PeruControl.Infrastructure.Model.Product.SetUp<Product>(builder);
        PeruControl.Infrastructure.Model.Project.SetUp<Project>(builder);
        PeruControl.Infrastructure.Model.ProjectAppointment.SetUp<ProjectAppointment>(builder);
        PeruControl.Infrastructure.Model.ProjectOperationSheet.SetUp<ProjectOperationSheet>(
            builder
        );
        PeruControl.Infrastructure.Model.TermsAndConditions.SetUp<TermsAndConditions>(builder);
        PeruControl.Infrastructure.Model.TreatmentArea.SetUp<TreatmentArea>(builder);
        PeruControl.Infrastructure.Model.TreatmentProduct.SetUp<TreatmentProduct>(builder);
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
