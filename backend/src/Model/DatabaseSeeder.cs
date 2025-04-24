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
            new Quotation
            {
                Client = client,
                Services = services.Take(servicesAmount / 2).ToList(),
                Status = QuotationStatus.Pending,
                Frequency = QuotationFrequency.Bimonthly,
                Area = 420,
                SpacesCount = 32,
                HasTaxes = true,
                CreationDate = DateTime.Now,
                ExpirationDate = DateTime.Now.AddDays(30),
                ServiceAddress = "Av. Los Olivos 123, Lima",
                PaymentMethod = "Transferencia bancaria",
                Others = "Servicio con garantía de 3 meses",
                ServiceListText = "Fumigación, Desinfección, Desinsectación",
                ServiceDescription = "Servicio integral de control de plagas para oficinas",
                ServiceDetail =
                    "Incluye fumigación completa de todas las áreas especificadas, con productos de alta calidad y certificados, aplicación de gel insecticida en puntos estratégicos, y colocación de trampas según necesidad.",
                Price = 1250.00m,
                RequiredAvailability = "Fines de semana",
                ServiceTime = "4 horas",
                CustomField6 = "Garantía extendida",
                TreatedAreas = "Oficinas, baños, cocina, almacén",
                Deliverables = "Certificado de fumigación, informe técnico, recomendaciones",
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
                CreationDate = DateTime.Now,
                ExpirationDate = DateTime.Now.AddDays(30),
                ServiceAddress = "Jr. Las Palmeras 456, San Isidro",
                PaymentMethod = "Efectivo",
                Others = "Incluye certificación DIGESA",
                ServiceListText = "Desratización, Limpieza de tanque",
                ServiceDescription = "Control de roedores y limpieza sanitaria",
                ServiceDetail =
                    "El servicio incluye instalación de cebaderos para control de roedores en perímetro e interior, uso de rodenticidas de última generación, y limpieza profesional de tanques con productos biodegradables.",
                Price = 850.00m,
                RequiredAvailability = "Lunes a viernes",
                ServiceTime = "2 horas",
                CustomField6 = "Sin productos con olor",
                TreatedAreas = "Sótano, perímetro exterior, tanque de agua",
                Deliverables = "Informe técnico, certificado de salubridad",
            },
        };

        await context.Quotations.AddRangeAsync(defaultQuotations);
        await context.SaveChangesAsync();

        logger.LogInformation("Seeded {count} quoations", defaultQuotations.Count);
    }
}
