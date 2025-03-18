using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace PeruControl.Model;

public static class DatabaseSeeder
{
    public static async Task SeedDefaultUserAsync(IServiceProvider serviceProvider, ILogger logger)
    {
        using var scope = serviceProvider.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<
            RoleManager<IdentityRole<Guid>>
        >();

        // Create admin role if it doesn't exist
        // FIXME: get credentials for appsettings, set secure ones in prod
        var adminRoleName = "Admin";
        if (!await roleManager.RoleExistsAsync(adminRoleName))
        {
            await roleManager.CreateAsync(new IdentityRole<Guid>(adminRoleName));
            logger.LogInformation("Created {role} role", adminRoleName);
        }

        // Create admin user if it doesn't exist
        var adminEmail = "admin@admin.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);

        if (adminUser == null)
        {
            adminUser = new User
            {
                UserName = "Admin",
                Email = adminEmail,
                EmailConfirmed = true,
                // Add any additional required fields here
            };

            // Create the admin user with a password
            var result = await userManager.CreateAsync(adminUser, "Acide2025/1");

            if (result.Succeeded)
            {
                // Add admin role to user
                await userManager.AddToRoleAsync(adminUser, adminRoleName);
                logger.LogInformation("Created admin user with email {email}", adminEmail);
            }
            else
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Failed to create admin user. Errors: {errors}");
            }
        }
    }

    public static async Task SeedDefaultServicesAsync(
        IServiceProvider serviceProvider,
        ILogger logger
    )
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
        if (await context.Services.AnyAsync())
        {
            logger.LogInformation("Services already seeded");
            return;
        }

        var defaultServices = new List<Service>
        {
            new Service { Name = "Fumigación" },
            new Service { Name = "Desinfección" },
            new Service { Name = "Desinsectación" },
            new Service { Name = "Desratización" },
            new Service { Name = "Limpieza de tanque" },
        };

        await context.Services.AddRangeAsync(defaultServices);
        await context.SaveChangesAsync();

        logger.LogInformation("Seeded {count} default services", defaultServices.Count);
    }

    public static async Task SeedClients(IServiceProvider serviceProvider, ILogger logger)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
        if (await context.Clients.AnyAsync())
        {
            logger.LogInformation("Clients already seeded");
            return;
        }

        var defaultClients = new List<Client>
        {
            new Client
            {
                TypeDocument = "dni",
                TypeDocumentValue = "78923498",
                BusinessType = "-",
                Name = "Juan Perez",
                FiscalAddress = "Av. Los Pinos 123",
                Email = "juan@perez.com",
                PhoneNumber = "987654321",
                ClientLocations = new List<ClientLocation>(),
            },
            new Client
            {
                TypeDocument = "ruc",
                TypeDocumentValue = "20485938492",
                RazonSocial = "Pirotécnicos Recreativos ACME E.I.R.L.",
                BusinessType = "Producción y Comercialización de Pirotécnicos",
                Name = "ACME INC",
                FiscalAddress = "Av. Los Pinos 123",
                Email = "juan@perez.com",
                PhoneNumber = "987654321",
                ClientLocations = new List<ClientLocation>(),
            },
        };

        await context.Clients.AddRangeAsync(defaultClients);
        await context.SaveChangesAsync();

        logger.LogInformation("Seeded {count} services", defaultClients.Count);
    }

    public static async Task SeedQuotations(IServiceProvider serviceProvider, ILogger logger)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
        if (await context.Quotations.AnyAsync())
        {
            logger.LogInformation("Quotations already seeded");
            return;
        }

        // get services
        var services = await context.Services.ToListAsync();
        if (services.Count == 0)
        {
            logger.LogWarning("No services found to seed quotations");
            return;
        }
        var servicesAmount = services.Count;

        // get a client
        var client = await context.Clients.FirstOrDefaultAsync();
        if (client == null)
        {
            logger.LogWarning("No clients found to seed quotations");
            return;
        }

        var defaultQuotations = new List<Quotation>
        {
            new Quotation
            {
                Client = client,
                Services = services.Take(servicesAmount / 2).ToList(),
                Status = QuotationStatus.Pending,
                Frequency = QuotationFrequency.Bimonthly,
                Area = 420,
                SpacesCount = 32,
                HasTaxes = true,
                TermsAndConditions = "Terminos y Condiciones de la cotizacion",
            },
            new Quotation
            {
                Client = client,
                Services = services.Take(servicesAmount / 2).ToList(),
                Status = QuotationStatus.Approved,
                Frequency = QuotationFrequency.Semiannual,
                Area = 42,
                SpacesCount = 2,
                HasTaxes = false,
                TermsAndConditions = "Terminos y Condiciones",
            },
        };

        await context.Quotations.AddRangeAsync(defaultQuotations);
        await context.SaveChangesAsync();

        logger.LogInformation("Seeded {count} quoations", defaultQuotations.Count);
    }
}
