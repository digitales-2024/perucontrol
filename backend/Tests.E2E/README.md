# E2E testing

## Config

Primero necesitas instalar la utilidad de playwright:

```sh
dotnet tool install --global Microsoft.Playwright.CLI
```

Agrega la ruta de dotnet tools al path si es necesario


## Instalar navegador

Este proyecto utiliza chromium.

```sh
playwright install chromium
```

## Ejecutar pruebas

```sh
dotnet test
```

## Ejecutar pruebas visualmente

```sh
BROWSER=chromium PWDEBUG=1 dotnet test
```

