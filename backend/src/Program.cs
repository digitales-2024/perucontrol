using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PeruControl.Controllers;
using PeruControl.Model;
using PeruControl.Services;
using PeruControl.Utils;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.AddControllers();

// Database setup
builder.Services.AddDbContext<DatabaseContext>(options =>
{
    var connectionString =
        builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new Exception("DB connection string not found");
    options.UseNpgsql(connectionString);
});

// Configure Identity
builder
    .Services.AddIdentityCore<User>(options =>
    {
        // Password settings
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequiredLength = 8;

        // Email settings
        options.User.RequireUniqueEmail = true;

        // Lockout settings
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
        options.Lockout.MaxFailedAccessAttempts = 5;
    })
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<DatabaseContext>()
    .AddDefaultTokenProviders();

// Add JWT authentication
builder
    .Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            // Clock skew compensates for server time drift
            ClockSkew = TimeSpan.Zero,
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    builder.Configuration["Jwt:SecretKey"]
                        ?? throw new Exception("Jwt:SecretKey not set")
                )
            ),
            RequireSignedTokens = true,
            RequireExpirationTime = true,
        };

#if DEBUG
        // During development, use the cookie set by the frontend
        // as JWT token, for not having to manually login and set
        // Bearer on every change.
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                context.Token = context.Request.Cookies["pc_access_token"];
                return Task.CompletedTask;
            },
        };
#endif
    });

builder.Services.AddAuthorization();
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer<PeruControl.Utils.BearerSecuritySchemeTransformer>();
});

// Register modules
var modules = new IModule[] { new AuthModule(), new ClientModule() };
foreach (var module in modules)
{
    module.SetupModule(builder.Services, builder.Configuration);
}

// Register global services
builder.Services.AddScoped<ExcelTemplateService>();
builder.Services.AddScoped<OdsTemplateService>();
builder.Services.AddScoped<WordTemplateService>();
builder.Services.AddScoped<PDFConverterService>();
builder.Services.AddScoped<SvgTemplateService>();
builder.Services.AddScoped<ServiceCacheProvider>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.Theme = ScalarTheme.DeepSpace;
        options.WithCustomCss(
            """
            @import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&display=swap');
            @font-face {
              font-family: 'Iosevka';
              font-style: normal;
              font-display: swap;
              font-weight: 400;
              src: url(https://cdn.jsdelivr.net/fontsource/fonts/iosevka@latest/latin-400-normal.woff2) format('woff2'), url(https://cdn.jsdelivr.net/fontsource/fonts/iosevka@latest/latin-400-normal.woff) format('woff');
            }
            :root { --scalar-font: "Atkinson Hyperlegible"; --scalar-font-code: Iosevka, "JetBrains Mono", monospace; }
            #v-0 {max-width: 100% !important}
            """
        );
    });
}

using (var scope = app.Services.CreateScope())
{
    //
    // Seed the database
    //
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    await DatabaseSeeder.SeedDefaultUserAsync(app.Services, logger);
    await DatabaseSeeder.SeedDefaultServicesAsync(app.Services, logger);
    await DatabaseSeeder.SeedBusiness(app.Services, logger);
    await DatabaseSeeder.SeedDefaultCertificateNumber(app.Services, logger);

    // Apply more seeds when not in prod or staging
    if (!app.Environment.IsProduction() && !app.Environment.IsStaging())
    {
        logger.LogInformation("Seeding development data");
        await DatabaseSeeder.SeedClients(app.Services, logger);
    }

    //
    // Initialize service cache
    //
    var db = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
    var cacheProvider = scope.ServiceProvider.GetRequiredService<ServiceCacheProvider>();
    var services = await db.Set<Service>().ToListAsync();
    cacheProvider.Initialize(services);
}

app.UseGlobalExceptionHandler();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
