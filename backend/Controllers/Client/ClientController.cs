using System.Net;
using System.Text.RegularExpressions;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PeruControl.Model;

namespace PeruControl.Controllers;

[Authorize]
public class ClientController(DatabaseContext db, ILogger<ClientController> logger)
    : AbstractCrudController<Client, ClientCreateDTO, ClientPatchDTO>(db)
{
    [EndpointSummary("Get all")]
    [HttpGet]
    public override async Task<ActionResult<IEnumerable<Client>>> GetAll()
    {
        return await _context.Clients.Include(c => c.ClientLocations).ToListAsync();
    }

    [EndpointSummary("Get one by ID")]
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public override async Task<ActionResult<Client>> GetById(Guid id)
    {
        var entity = await _context
            .Clients.Include(c => c.ClientLocations)
            .FirstOrDefaultAsync(c => c.Id == id);
        return entity == null ? NotFound() : Ok(entity);
    }

    [HttpGet("search-by-ruc/{ruc}")]
    [EndpointSummary("Get business data by RUC")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SunatQueryResponse>> SearchByRuc(string ruc)
    {
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

            // Second request, actually fetching SUNAT data
            var sunatToken = GenerateSunatToken(52);
            var formData = new Dictionary<string, string>
            {
                { "accion", "consPorRuc" },
                { "razSoc", "" },
                { "nroRuc", ruc },
                { "nrodoc", "" },
                { "token", sunatToken },
                { "contexto", "ti-it" },
                { "modo", "1" },
                { "rbtnTipo", "1" },
                { "search1", ruc },
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
            var doc = new HtmlDocument();
            doc.LoadHtml(finalHtml);

            // .list-group : div containing the values
            var listGroupElements = doc.DocumentNode.SelectNodes(
                "//*[@class='list-group']//*[@class='list-group-item']"
            );
            if (listGroupElements == null)
            {
                return NotFound("RUC no encontrado");
            }

            var values = listGroupElements.Select(x => ProcessSunatRow(x));

            var returnData = new SunatQueryResponse();
            foreach (var (title, value) in values)
            {
                switch (title)
                {
                    case "Número de RUC:":
                    {
                        // value = "20493096436 - TAMATAMA S.A.C."
                        var name = value.Substring(value.IndexOf("-") + 1).Trim();
                        returnData.RazonSocial = name;
                        break;
                    }
                    case "Nombre Comercial:":
                    {
                        returnData.Name = value;
                        break;
                    }
                    case "Domicilio Fiscal:":
                    {
                        returnData.FiscalAddress = value;
                        break;
                    }
                }
            }

            return Ok(returnData);
        }
        catch (HttpRequestException ex)
        {
            logger.LogDebug($"HTTP Error when fetching SUNAT: {ex.StatusCode} - {ex.Message}");
            return NotFound();
        }
    }

    // receives an html node with shape:
    // <div class="list-group-item">
    //     <div class="row">
    //         <div class="col-sm-5">
    //             <h4>
    //                 TEXT 1
    //         <div class="col-sm-7">
    //             <h4>
    //                 TEXT 2
    //
    // and returns (TEXT1, TEXT2)
    private (string, string) ProcessSunatRow(HtmlNode node)
    {
        logger.LogDebug($"Processing SUNAT row");
        var h4Node = node.SelectSingleNode(".//div[@class='row']/div[@class='col-sm-5']/h4");
        if (h4Node == null)
        {
            logger.LogDebug($"exit: left h4 not found");
            return ("", "");
        }
        var titleStr = TrimInsideAndAround(h4Node.InnerText);

        // Try to get a child p
        var pNode = node.SelectSingleNode(".//div[@class='row']/div[@class='col-sm-7']/p");
        if (pNode != null)
        {
            return (titleStr, TrimInsideAndAround(pNode.InnerText));
        }

        // Try to get a child h4
        var rightNode = node.SelectSingleNode(".//div[@class='row']/div[@class='col-sm-7']/h4");
        if (rightNode != null)
        {
            return (titleStr, TrimInsideAndAround(rightNode.InnerText));
        }

        logger.LogDebug($"exit: right not found");
        return (titleStr, "");
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

    private string TrimInsideAndAround(string input)
    {
        input = input.Trim();
        input = Regex.Replace(input, "&aacute;", "á");
        input = Regex.Replace(input, "&eacute;", "é");
        input = Regex.Replace(input, "&iacute;", "í");
        input = Regex.Replace(input, "&oacute;", "ó");
        input = Regex.Replace(input, "&uacute;", "ú");
        input = Regex.Replace(input, @"\s+", " ");
        return input;
    }
}

public class SunatQueryResponse
{
    public string? RazonSocial { get; set; }
    public string? Name { get; set; }
    public string? FiscalAddress { get; set; }
}
