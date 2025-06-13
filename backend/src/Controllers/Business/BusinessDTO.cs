using PeruControl.Infrastructure.Model;

namespace PeruControl.Controllers;

public class BusinessCreateDTO : IMapToEntity<Business>
{
    public Business MapToEntity()
    {
        throw new InvalidOperationException("Business cannot be created.");
    }
}

public class BusinessPatchDTO : IEntityPatcher<Business>
{
    public string? DigesaNumber { get; set; }
    public string? Address { get; set; }
    public string? Email { get; set; }
    public string? RUC { get; set; }
    public string? Phones { get; set; }
    public string? DirectorName { get; set; }
    public string? BankName { get; set; }
    public string? BankAccount { get; set; }
    public string? BankCCI { get; set; }
    public string? Deductions { get; set; }
    public string? ThechnicalDirectorName { get; set; }
    public string? ThechnicalDirectorPosition { get; set; }
    public string? ThechnicalDirectorCIP { get; set; }
    public string? ResponsibleName { get; set; }
    public string? ResponsiblePosition { get; set; }
    public string? ResponsibleCIP { get; set; }

    public void ApplyPatch(Business entity)
    {
        if (DigesaNumber != null)
        {
            entity.DigesaNumber = DigesaNumber;
        }
        if (Address != null)
        {
            entity.Address = Address;
        }
        if (Email != null)
        {
            entity.Email = Email;
        }
        if (RUC != null)
        {
            entity.RUC = RUC;
        }
        if (Phones != null)
        {
            entity.Phones = Phones;
        }
        if (DirectorName != null)
        {
            entity.DirectorName = DirectorName;
        }
        if (BankName != null)
        {
            entity.BankName = BankName;
        }
        if (BankAccount != null)
        {
            entity.BankAccount = BankAccount;
        }
        if (BankCCI != null)
        {
            entity.BankCCI = BankCCI;
        }
        if (Deductions != null)
        {
            entity.Deductions = Deductions;
        }
        if (ThechnicalDirectorName != null)
        {
            entity.ThechnicalDirectorName = ThechnicalDirectorName;
        }
        if (ThechnicalDirectorPosition != null)
        {
            entity.ThechnicalDirectorPosition = ThechnicalDirectorPosition;
        }
        if (ThechnicalDirectorCIP != null)
        {
            entity.ThechnicalDirectorCIP = ThechnicalDirectorCIP;
        }
        if (ResponsibleName != null)
        {
            entity.ResponsibleName = ResponsibleName;
        }
        if (ResponsiblePosition != null)
        {
            entity.ResponsiblePosition = ResponsiblePosition;
        }
        if (ResponsibleCIP != null)
        {
            entity.ResponsibleCIP = ResponsibleCIP;
        }
    }
}
