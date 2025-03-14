# E2E testing

## Config

Primero necesitas instalar la utilidad de playwright:

```sh
dotnet tool install --global Microsoft.Playwright.CLI
```

Agrega la ruta de dotnet tools al path si es necesario


## Construir img de docker de playwright (CI)

Este repo tiene un archivo `Dockerfile`, el cual:

- Contiene playwright
- Contiene chromium
- Instala dotnet-9

Este dockerfile se compila a la imagen `digitales/playwright-dotnet9-noble`,
y esta imagen se utiliza para ejecutar las pruebas e2e en CI.

Esta images se debe construir y subir a la cuenta de dockerhub.

## Instalar navegador localmente

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

