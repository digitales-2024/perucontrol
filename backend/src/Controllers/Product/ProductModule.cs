namespace PeruControl.Controllers.Product;

public class ProductModule : IModule
{
    public IServiceCollection SetupModule(IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<ProductService>();
        return services;
    }
}
