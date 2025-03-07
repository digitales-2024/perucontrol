using Microsoft.Playwright;
using Microsoft.Playwright.MSTest;

namespace Tests.E2E;

[TestClass]
public sealed class Test1 : PageTest
{
    public readonly string BaseUrl = Environment.GetEnvironmentVariable("BASE_URL") ?? throw new InvalidOperationException("BASE_URL envvar is not set. It is needed to run the tests.");

    [TestMethod]
    public async Task TestLogin()
    {
        await Page.GotoAsync($"{BaseUrl}/login");
        await Expect(Page.GetByRole(AriaRole.Heading, new() { Name = "Bienvenido" })).ToBeVisibleAsync();

        // fill login form
        await Page.GetByLabel("Correo electrónico").FillAsync("admin@admin.com");
        await Page.GetByLabel("Contraseña").FillAsync("Acide2025/1");
        await Page.GetByRole(AriaRole.Button, new() { Name = "Iniciar sesión" }).ClickAsync();

        // wait for navigation
        await Expect(Page).ToHaveURLAsync($"{BaseUrl}/");

        await Expect(Page.GetByRole(AriaRole.Heading, new() { Name = "Dashboard" })).ToBeVisibleAsync();
    }
}
