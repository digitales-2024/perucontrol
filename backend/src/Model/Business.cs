namespace PeruControl.Model;

public class Business : BaseModel
{
    // Digesa number: N° "62-2023"
    public required string DigesaNumber { get; set; }

    // PeruControl's address
    public required string Address { get; set; }

    // PeruControl's email
    public required string Email { get; set; }

    // PeruControl's RUC number
    public required string RUC { get; set; }

    // Phone numbers of PeruControl: "999888777 - 999777333"
    public required string Phones { get; set; }

    // `Gerente`
    public required string DirectorName { get; set; }

    // Bank name, e.g. "Interbank"
    public required string BankName { get; set; }

    // Bank account number
    public required string BankAccount { get; set; }

    // Bank account CCI
    public required string BankCCI { get; set; }

    // `Detracciones`, e.g. "00-101-385558"
    public required string Deductions { get; set; }

    // Nombre del director tecnico
    public required string ThechnicalDirectorName { get; set; }

    // Cargo del director tecnico
    public required string ThechnicalDirectorPosition { get; set; }

    // CIP del director tecnico
    public required string ThechnicalDirectorCIP { get; set; }

    // Nombre del responsable
    public required string ResponsibleName { get; set; }

    // Cargo del responsable
    public required string ResponsiblePosition { get; set; }

    // CIP del responsable
    public required string ResponsibleCIP { get; set; }
}
