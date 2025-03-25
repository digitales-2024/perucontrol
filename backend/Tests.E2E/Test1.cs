using Microsoft.Playwright;
using Microsoft.Playwright.MSTest;

namespace Tests.E2E;

[TestClass]
public sealed class Test1 : PageTest
{
    public readonly string BaseUrl = Environment.GetEnvironmentVariable("BASE_URL") ?? throw new InvalidOperationException("BASE_URL envvar is not set. It is needed to run the tests.");
    public static readonly string ReportsDirectory = Environment.GetEnvironmentVariable("REPORT_DIR") ?? "reports";

    [ClassInitialize]
    public static void SetupReporting(TestContext _)
    {
        // Create reports directory if it doesn't exist
        Directory.CreateDirectory(ReportsDirectory);
    }

    [TestInitialize]
    public async Task SetupScreenshotOnFailure()
    {
        // Configure screenshots on failure
        await Page.SetViewportSizeAsync(1280, 720);
    }

    [TestMethod]
    public async Task TestLogin()
    {
        try
        {
            await Page.Context.Tracing.StartAsync(new() { Screenshots = true, Snapshots = true });

            await Page.GotoAsync($"{BaseUrl}/login");
            await Expect(Page.GetByRole(AriaRole.Heading, new() { Name = "Bienvenido" })).ToBeVisibleAsync();

            // fill login form
            await Page.GetByLabel("Correo electrónico").FillAsync("admin@admin.com");
            await Page.GetByLabel("Contraseña").FillAsync("Acide2025/1");
            await Page.GetByRole(AriaRole.Button, new() { Name = "Iniciar sesión" }).ClickAsync();

            // wait for navigation
            await Expect(Page).ToHaveURLAsync($"{BaseUrl}/");

            await Expect(Page.GetByRole(AriaRole.Heading, new() { Name = "Inicio" })).ToBeVisibleAsync();
        }
        catch (Exception)
        {
            // Take screenshot on failure
            var screenshotPath = Path.Combine(ReportsDirectory, $"failure-{TestContext.TestName}-{DateTime.Now:yyyyMMddHHmmss}.png");
            await Page.ScreenshotAsync(new() { Path = screenshotPath, FullPage = true });

            // Create trace file
            var tracePath = Path.Combine(ReportsDirectory, $"trace-{TestContext.TestName}-{DateTime.Now:yyyyMMddHHmmss}.zip");
            await Page.Context.Tracing.StopAsync(new() { Path = tracePath });

            throw;
        }
    }
}
