namespace PeruControl.Services;

public class SvgTemplateService
{
    public byte[] GenerateSvgFromTemplate(
        Dictionary<string, string> placeholders,
        string templatePath
    )
    {
        string svgContent = File.ReadAllText(templatePath);

        // Replace all placeholders
        foreach (var placeholder in placeholders)
        {
            svgContent = svgContent.Replace(placeholder.Key, placeholder.Value);
        }

        // Convert the modified content back to bytes and return
        return System.Text.Encoding.UTF8.GetBytes(svgContent);
    }
}
