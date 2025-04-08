using PeruControl.Model;

namespace PeruControl.Services;

public class ServiceCacheProvider
{
    private readonly List<Service> _services = new();

    public IReadOnlyList<Service> Services => _services;

    public void Initialize(IEnumerable<Service> services)
    {
        _services.Clear();
        _services.AddRange(services);
    }

    public bool ValidateIds(IEnumerable<Guid> serviceIds)
    {
        foreach (var serviceId in serviceIds)
        {
            if (_services.All(s => s.Id != serviceId))
            {
                return false;
            }
        }

        return true;
    }

    public ICollection<Service> GetServices(IEnumerable<Guid> serviceIds)
    {
        var services = new List<Service>();

        foreach (var serviceId in serviceIds)
        {
            var service = _services.FirstOrDefault(s => s.Id == serviceId);
            if (service != null)
            {
                services.Add(service);
            }
        }

        return services;
    }
}
