using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PeruControl.Domain.Entities;

namespace PeruControl.Infrastructure.Configurations;

public class ClientLocationConfiguration : IEntityTypeConfiguration<ClientLocation>
{
    public void Configure(EntityTypeBuilder<ClientLocation> builder)
    {
        // Table configuration
        builder.ToTable("DomainClientLocations");
        builder.HasKey(cl => cl.Id);

        // Base entity properties
        builder.Property(cl => cl.Id).HasColumnName("Id").IsRequired();

        builder.Property(cl => cl.IsActive).HasColumnName("IsActive").HasDefaultValue(true);

        builder.Property(cl => cl.CreatedAt).HasColumnName("CreatedAt").HasDefaultValueSql("NOW()");

        builder
            .Property(cl => cl.ModifiedAt)
            .HasColumnName("ModifiedAt")
            .HasDefaultValueSql("NOW()");

        // Address value object
        builder.OwnsOne(
            cl => cl.Address,
            address =>
            {
                address
                    .Property(a => a.Value)
                    .HasColumnName("Address")
                    .HasMaxLength(250)
                    .IsRequired();
            }
        );

        // Foreign key will be configured by the Client relationship
        builder.Property<Guid>("ClientId").IsRequired();
    }
}
