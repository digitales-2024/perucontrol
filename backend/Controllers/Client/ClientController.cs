using System.Net;
using System.Net.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeruControl.Model;

namespace PeruControl.Controllers;

[Authorize]
public class ClientController(DatabaseContext db)
    : AbstractCrudController<Client, ClientPatchDTO>(db)
{
    [HttpGet("search-by-ruc/{ruc}")]
    public async Task<IActionResult> SearchByRuc(string ruc)
    {
        var ruc2 = "20493096436";

        var handler = new HttpClientHandler
        {
            UseCookies = true,
            CookieContainer = new CookieContainer(),
            AllowAutoRedirect = true,
        };
        using var client = new HttpClient(handler);
        client.DefaultRequestHeaders.Add(
            "User-Agent",
            """Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"""
        );
        client.DefaultRequestHeaders.Add("Host", "e-consultaruc.sunat.gob.pe");

        try
        {
            // First request, to get valid cookies
            var sunatUrl =
                "https://e-consultaruc.sunat.gob.pe/cl-ti-itmrconsruc/FrameCriterioBusquedaWeb.jsp";
            var firstRequest = await client.GetAsync(sunatUrl);
            firstRequest.EnsureSuccessStatusCode();

            Console.WriteLine("GET success :D");

            // Second request, actually fetching SUNAT data
            var sunatToken = GenerateSunatToken(52);
            var formData = new Dictionary<string, string>
            {
                { "accion", "consPorRuc" },
                { "razSoc", "" },
                { "nroRuc", ruc2 },
                { "nrodoc", "" },
                { "token", sunatToken },
                { "contexto", "ti-it" },
                { "modo", "1" },
                { "rbtnTipo", "1" },
                { "search1", ruc2 },
                { "tipdoc", "1" },
                { "search2", "" },
                { "search3", "" },
                { "codigo", "" },
            };
            var postResponse = await client.PostAsync(
                "https://e-consultaruc.sunat.gob.pe/cl-ti-itmrconsruc/jcrS00Alias",
                new FormUrlEncodedContent(formData)
            );
            postResponse.EnsureSuccessStatusCode();

            var finalHtml = await postResponse.Content.ReadAsStringAsync();

            Console.WriteLine($"Final status: {postResponse.StatusCode}");
            Console.WriteLine($"Final content:\n\n{finalHtml}");
        }
        catch (HttpRequestException ex)
        {
            Console.WriteLine($"HTTP Error: {ex.StatusCode} - {ex.Message}");

            return NotFound();
        }

        return Ok();
    }

    [HttpGet("parse-ruc/{ruc}")]
    public IActionResult ParseRucHtml()
    {
        // load html file
        using var file = System.IO.File.Open("response.html", FileMode.Open);
        if (file == null)
        {
            return BadRequest();
        }

        using var reader = new StreamReader(file);
        var fileContent = reader.ReadToEnd();

        return Ok();
    }

    private string GenerateSunatToken(int length)
    {
        const string chars = "0123456789abcdefghijklmnopqrstuvwxyz";
        char[] result = new char[length];
        Random random = new Random();

        for (int i = 0; i < length; i++)
        {
            result[i] = chars[random.Next(chars.Length)];
        }

        return new string(result);
    }
}
