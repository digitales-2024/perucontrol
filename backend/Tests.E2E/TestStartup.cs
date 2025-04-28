using DotNetEnv;

namespace Tests.E2E;

[TestClass]
public static class TestStartup
{
    [AssemblyInitialize]
    public static void Init(TestContext context)
    {
        Env.Load();
    }
}