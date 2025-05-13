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
                Name = "Administrador",
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

    public static async Task SeedDefaultCertificateNumber(
        IServiceProvider serviceProvider,
        ILogger logger
    )
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
        if (await context.ProjectOrderNumbers.AnyAsync())
        {
            logger.LogInformation("Services already seeded");
            return;
        }

        var defaultOrderNombre = new ProjectOrderNumber { ProjectOrderNumberValue = 0 };

        await context.ProjectOrderNumbers.AddAsync(defaultOrderNombre);
        await context.SaveChangesAsync();

        logger.LogInformation(
            "Seeded initial Certificate Number at " + defaultOrderNombre.ProjectOrderNumberValue
        );
    }

    public static async Task SeedBusiness(IServiceProvider serviceProvider, ILogger logger)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
        var businessCount = await context.Businesses.CountAsync();
        if (businessCount == 1)
        {
            logger.LogInformation("Business already seeded");
            return;
        }
        if (businessCount > 1)
        {
            throw new InvalidDataException(
                "Multiple businesses found. Only 1 business is allowed."
            );
        }

        var business = new Business
        {
            DigesaNumber = "62-2023",
            Address = "Urb. Villa Manuelito A-16, J.L.B. y Rivero, Arequipa",
            Email = "servicios@perucontrol.com",
            RUC = "20539641922",
            Phones = "979716629 - 986951290",
            DirectorName = "Sr. William Moreyra A.",
            BankName = "Crédito del Perú",
            BankAccount = "215-20391810-0-04",
            BankCCI = "002-21500203918100429",
            Deductions = "00-101-385558",
            ThechnicalDirectorName = "",
            ThechnicalDirectorPosition = "",
            ThechnicalDirectorCIP = "",
            ResponsibleName = "",
            ResponsiblePosition = "",
            ResponsibleCIP = "",
        };
        await context.Businesses.AddAsync(business);
        await context.SaveChangesAsync();

        logger.LogInformation("Main business seeded.");
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
            new()
            {
                Client = client,
                Services = services.Take(servicesAmount / 2).ToList(),
                Status = QuotationStatus.Pending,
                Frequency = QuotationFrequency.Bimonthly,
                HasTaxes = true,
                CreationDate = DateTime.Now,
                ExpirationDate = DateTime.Now.AddDays(30),
                ServiceAddress = "Av. Los Olivos 123, Lima",
                PaymentMethod = "Transferencia bancaria",
                Others = "Servicio con garantía de 3 meses",
                Availability = "Inmediata",
                QuotationServices = new List<QuotationService>
                {
                    new()
                    {
                        Amount = 1,
                        NameDescription = "DESINSECTACION",
                        Price = 150,
                    },
                    new()
                    {
                        Amount = 1,
                        NameDescription = "DESRATIZACION",
                        Price = 150,
                    },
                },
            },
            new()
            {
                Client = client,
                Services = services.Take(servicesAmount / 2).ToList(),
                Status = QuotationStatus.Approved,
                Frequency = QuotationFrequency.Semiannual,
                HasTaxes = false,
                CreationDate = DateTime.Now,
                ExpirationDate = DateTime.Now.AddDays(30),
                ServiceAddress = "Jr. Las Palmeras 456, San Isidro",
                PaymentMethod = "Efectivo",
                Others = "Incluye certificación DIGESA",
                Availability = "1 semana",
            },
        };

        await context.Quotations.AddRangeAsync(defaultQuotations);
        await context.SaveChangesAsync();

        logger.LogInformation("Seeded {count} quoations", defaultQuotations.Count);
    }

    public static async Task SeedProductsAsync(IServiceProvider serviceProvider, ILogger logger)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
        if (await context.Products.AnyAsync())
        {
            return;
        }

        var defaultEntities = new List<Product>
        {
            new()
            {
                Name = "Alfaphos EC",
                ActiveIngredient = "Temephos 25% + Alfacipermetrina 10%",
                ProductAmountSolvents =
                [
                    new() { AmountAndSolvent = "240ml en 16L de agua" },
                    new() { AmountAndSolvent = "180ml en 16L de agua" },
                    new() { AmountAndSolvent = "60ml en 16L de agua" },
                ],
            },
            new()
            {
                Name = "Glutamonio",
                ActiveIngredient = "Amonio cuaternario de 5ta generación",
                ProductAmountSolvents =
                [
                    new() { AmountAndSolvent = "60ml en 06L de agua" },
                    new() { AmountAndSolvent = "120ml en 16L de agua" },
                    new() { AmountAndSolvent = "180ml en 16L de agua" },
                ],
            },
            new()
            {
                Name = "S-Delta 50 SC",
                ActiveIngredient = "Deltametrina 50%",
                ProductAmountSolvents =
                [
                    new() { AmountAndSolvent = "140ml en 06L de agua" },
                    new() { AmountAndSolvent = "160ml en 16L de agua" },
                    new() { AmountAndSolvent = "180ml en 16L de agua" },
                ],
            },
            new()
            {
                Name = "Chuspisol 10 WG",
                ActiveIngredient = "Tiametoxam 10%",
                ProductAmountSolvents =
                [
                    new() { AmountAndSolvent = "50g en 50ml de agua" },
                    new() { AmountAndSolvent = "45g en 50ml de agua" },
                    new() { AmountAndSolvent = "40g en 50ml de agua" },
                ],
            },
        };

        await context.Products.AddRangeAsync(defaultEntities);
        await context.SaveChangesAsync();

        logger.LogInformation("Seeded {count} products", defaultEntities.Count);
    }
}
