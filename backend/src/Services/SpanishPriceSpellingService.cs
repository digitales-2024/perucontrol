using System.Globalization;

namespace PeruControl.Services;

public class SpanishPriceSpellingService
{
    private static readonly Dictionary<string, string> Indices = new()
    {
        // Units
        { "0", "" },
        { "1", "UNO" },
        { "2", "DOS" },
        { "3", "TRES" },
        { "4", "CUATRO" },
        { "5", "CINCO" },
        { "6", "SEIS" },
        { "7", "SIETE" },
        { "8", "OCHO" },
        { "9", "NUEVE" },

        // Teens
        { "0X", "" },
        { "10", "DIEZ" },
        { "11", "ONCE" },
        { "12", "DOCE" },
        { "13", "TRECE" },
        { "14", "CATORCE" },
        { "15", "QUINCE" },
        { "16", "DIECISÉIS" },
        { "17", "DIECISIETE" },
        { "18", "DIECIOCHO" },
        { "19", "DIECINUEVE" },

        // Tens
        { "20", "VEINTE" },
        { "2X", "VEINTI" },
        { "30", "TREINTA" },
        { "3X", "TREINTA Y " },
        { "40", "CUARENTA" },
        { "4X", "CUARENTA Y " },
        { "50", "CINCUENTA" },
        { "5X", "CINCUENTA Y " },
        { "60", "SESENTA" },
        { "6X", "SESENTA Y " },
        { "70", "SETENTA" },
        { "7X", "SETENTA Y " },
        { "80", "OCHENTA" },
        { "8X", "OCHENTA Y " },
        { "90", "NOVENTA" },
        { "9X", "NOVENTA Y " },

        // Hundreds
        { "000", "" },
        { "100", "CIEN" },
        { "1XX", "CIENTO " },
        { "200", "DOSCIENTOS" },
        { "2XX", "DOSCIENTOS " },
        { "300", "TRESCIENTOS" },
        { "3XX", "TRESCIENTOS " },
        { "400", "CUATROCIENTOS" },
        { "4XX", "CUATROCIENTOS " },
        { "500", "QUINIENTOS" },
        { "5XX", "QUINIENTOS " },
        { "600", "SEISCIENTOS" },
        { "6XX", "SEISCIENTOS " },
        { "700", "SETECIENTOS" },
        { "7XX", "SETECIENTOS " },
        { "800", "OCHOCIENTOS" },
        { "8XX", "OCHOCIENTOS " },
        { "900", "NOVECIENTOS" },
        { "9XX", "NOVECIENTOS " },

        // Special cases
        { "1000", "UN MIL" },
    };

    /// <summary>
    /// Given a number n, returns it as a string with 2 decimals.
    /// E.g.: 120 -> "120.00", 85.5 -> "85.50"
    /// </summary>
    public static string TwoDecimals(decimal n)
    {
        return n.ToString("F2", CultureInfo.InvariantCulture);
    }

    private static string NumberToText(string n)
    {
        // Remove whitespaces before processing
        n = n.Replace(" ", "");

        // If the number is zero
        if (n == "0")
        {
            return "CERO";
        }

        // Remove leading zeros
        n = n.TrimStart('0');

        // If after removing zeros it's empty (was all zeros)
        if (string.IsNullOrEmpty(n))
        {
            return "";
        }

        // If the exact number is defined, use it
        if (Indices.ContainsKey(n))
        {
            return Indices[n];
        }

        // Tens
        if (n.Length == 2)
        {
            // Here we assume the number is a ten and a variable unit,
            // for example 22, 43, 87.
            var decena = n[0].ToString();
            var unidad = n[1].ToString();
            var prefijoDecena = Indices.GetValueOrDefault(decena + "X", "");
            var sufijoUnidad = Indices.GetValueOrDefault(unidad, "");

            return prefijoDecena + sufijoUnidad;
        }

        // Hundreds
        else if (n.Length == 3)
        {
            var centena = n.Substring(0, 1);
            var resto = n.Substring(1);

            // If the remainder are pure zeros
            if (resto == "00")
            {
                return Indices.GetValueOrDefault(centena + "00", "");
            }

            var prefijoCentena = Indices.GetValueOrDefault(centena + "XX", "");
            var sufijo = NumberToText(resto);
            return prefijoCentena + sufijo;
        }

        // Thousands (4-6 digits)
        else if (n.Length >= 4 && n.Length <= 6)
        {
            var len = n.Length;
            var firstSplit = len - 3;
            var millares = n.Substring(0, firstSplit);
            var unidades = n.Substring(firstSplit);

            // If units are "000", only return "millares MIL"
            if (unidades == "000")
            {
                if (millares == "1")
                {
                    return "MIL";
                }
                return $"{NumberToText(millares)} MIL";
            }

            // Special case for "1000" followed by another number
            if (millares == "1")
            {
                return $"MIL {NumberToText(unidades)}";
            }

            return $"{NumberToText(millares)} MIL {NumberToText(unidades)}";
        }

        // Millions (7-9 digits)
        else if (n.Length >= 7 && n.Length <= 9)
        {
            var len = n.Length;
            var firstSplit = len - 6;
            var millones = n.Substring(0, firstSplit);
            var resto = n.Substring(firstSplit);

            // If remainder are pure zeros, only return "millones MILLONES"
            if (int.Parse(resto) == 0)
            {
                if (millones == "1")
                {
                    return "UN MILLÓN";
                }
                return $"{NumberToText(millones)} MILLONES";
            }

            // Special case for "1" million
            if (millones == "1")
            {
                return $"UN MILLÓN {NumberToText(resto)}";
            }

            return $"{NumberToText(millones)} MILLONES {NumberToText(resto)}";
        }

        return "----";
    }

    /// <summary>
    /// Transforms a number into its spelling using words.
    /// 320000 -> "TRES CIENTOS VEINTE MIL CON 00/100"
    /// </summary>
    public static string SpellPricing(decimal price)
    {
        var newPrice = TwoDecimals(price);
        var parts = newPrice.Split('.');
        var whole = parts[0];
        var centimos = parts[1];

        return $"{NumberToText(whole)} CON {centimos}/100";
    }

    /// <summary>
    /// Transforms a number into its spelling using words, including taxes.
    /// 320000 -> "TRES CIENTOS VEINTE MIL CON 00/100"
    /// </summary>
    public static string SpellPricingWithTaxes(decimal price)
    {
        var newPrice = TwoDecimals(price);
        var parts = newPrice.Split('.');
        var whole = parts[0];
        var centimos = parts[1];

        return $"{NumberToText(whole)} CON {centimos}/100";
    }

    /// <summary>
    /// Transforms a number into its spelling using words for budget purposes.
    /// </summary>
    public static string SpellPricingBudget(decimal price)
    {
        var newPrice = TwoDecimals(price);
        var parts = newPrice.Split('.');
        var whole = parts[0];
        var centimos = parts[1];

        return $"{NumberToText(whole)} CON {centimos}/100 NUEVOS SOLES";
    }
}
