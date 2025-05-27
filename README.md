# Perucontrol

Este repositorio contiene tanto el backend y frontend
para el proyecto Perucontrol.

## Build Status

- `develop`: [![Build Status](https://jenkins.araozu.dev/buildStatus/icon?job=perucontrol%2Fperucontrol-ci%2Fdevelop)](https://jenkins.araozu.dev/job/perucontrol/job/perucontrol-ci/job/develop/)

- `backend-develop-deploy`: [![Build Status](https://jenkins.araozu.dev/buildStatus/icon?job=perucontrol%2Fdeploy-develop%2Fperucontrol-backend-develop-deploy)](https://jenkins.araozu.dev/view/perucontrol/job/perucontrol/job/deploy-develop/job/perucontrol-backend-develop-deploy/)

- `frontend-develop-deploy`: [![Build Status](https://jenkins.araozu.dev/buildStatus/icon?job=perucontrol%2Fdeploy-develop%2Fperucontrol-frontend-develop-deploy)](https://jenkins.araozu.dev/view/perucontrol/job/perucontrol/job/deploy-develop/job/perucontrol-frontend-develop-deploy/)

---

- `staging`: [![Build Status](https://jenkins.araozu.dev/buildStatus/icon?job=perucontrol-ci%2Fstaging)](https://jenkins.araozu.dev/view/perucontrol/job/perucontrol-ci/job/staging/)



## Husky

En la carpeta raiz, en `.husky` se encuentran los archivos
de configuración y scripts que ejecutan husky.
Se utiliza [Husky .NET](https://alirezanet.github.io/Husky.Net/)
en vez de la versión en javascript.

### Hooks

Los siguientes hooks se ejecutan con husky

- `commit-msg`: Valida que el mensaje del commit siga
  el formato de [Conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).
- `pre-commit`: En cada commit ejecuta linters y formateadores de código,
  en el back utiliza [Csharpier](https://csharpier.com/)
  y en el front [Eslint](https://eslint.org/).
- `pre-push`: En cada **push** compila tanto el frontend y backend,
  como primera barrera de proteccion.


## Backend

- [ASP.NET 9 Controllers](https://learn.microsoft.com/en-us/aspnet/core/web-api/?view=aspnetcore-9.0)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/) como ORM.
- [Postgres](https://www.postgresql.org/) como base de datos


## Plugins de VSCode

No es necesario instalar o usar Visual Studio.
Para usar VSCode solo se instala el plugin:
[C# Dev Kit](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csdevkit)


### Instalación

Se necesita tener instalado dotnet sdk 9.

#### Arch linux

```sh
yay -Syu dotnet-sdk-bin aspnet-runtime-bin
```

#### Windows + winget

```sh
winget install Microsoft.DotNet.SDK.9
winget install Microsoft.DotNet.DesktopRuntime.9
winget install Microsoft.DotNet.AspNetCore.9
```

#### Windows

En windows se instala dotnet desde la página web:
[https://dotnet.microsoft.com/en-us/download](https://dotnet.microsoft.com/en-us/download)


### Ejecución

Asumiendo que la base de datos ya está lista,
para levantar el backend se ejecuta:

```sh
dotnet watch run
```

### Swagger/OpenAPI

Una vez levantado el backend los endpoints de Swagger/OpenAPI se encuentran en
[http://localhost:5233/scalar/v1](http://localhost:5233/scalar/v1).

#### Autenticación en Swagger/OpenAPI

El backend utiliza Bearer auth y no cookies,
por lo que los endpoints de login y refresh
devuelven tokens jwt:

```json
{
  "accessToken": "contenido.del_token.jwt",
  "refreshToken": "contenido.del_token_refresh.jwt",
  "accessExpiresIn": 1,
  "refreshExpiresIn": 43200
}
```

Para utilizar el resto de endpoints se necesita colocar el `accessToken` en la cabecera
`Authorization` como `Bearer ${access_token}`.

Para evitar colocar el token varias veces, alternativamente se puede
iniciar sesión en el **frontend**, esto creará una cookie `pc_access_token`
que servirá como credencial en Swagger/OpenAPI.



### Migraciones

Para crear una migración:

```sh
dotnet ef migrations add "Nombre de la migración"
```

Esto solo crea los archivos de la migración. Para aplicarlos
a la base de datos se ejecuta:

```sh
dotnet ef database update
```

Tras este ultimo comando la BD esta lista.

Para reinicializar la base de datos en caso de errores
se ejecuta:

```sh
dotnet ef database drop
dotnet ef database update
```


## Frontend

- [Nextjs 15](https://nextjs.org/) (server components)
- [openapi-ts](https://openapi-ts.dev/)
- [pnpm](https://pnpm.io/)

### Instalación

- Instalar nodejs
- Una vez instalado nodejs, Instalar pnpm globalmente con los comandos:

```sh
npm i -g pnpm
pnpm setup
```

- Configurar la URL del backend en las variables de entorno.


### Ejecución

- Cada vez que el backend cambie es necesario ejecutar:

    ```sh
    pnpm run generate
    ```

    Esto generará endpoints y funciones para conectarse
    al backend

- Una vez ejecutado `generate`, levanta el frontend con
  `pnpm run dev`


## Pruebas

### E2E

Ver documentacion en carpeta backend


## New Features

### Appointment Data Duplication

A new endpoint has been added to duplicate all data from the previous appointment in the same project to the current appointment.

**Endpoint:** `POST /api/appointment/{id}/duplicate-from-previous`

**Description:** Duplicates all data from the previous appointment (ordered by DueDate) in the same project to the specified appointment. This includes:

- Operation sheets (ProjectOperationSheet)
- Rodent registers and areas (RodentRegister, RodentAreas)
- Certificates
- Treatment products and areas
- All reports (CompleteReport, Report1-4)
- Basic appointment properties (CompanyRepresentative, EnterTime, LeaveTime)

**Parameters:**
- `id` (path parameter): The GUID of the target appointment to populate with duplicated data

**Responses:**
- `200 OK`: Data successfully duplicated
- `404 Not Found`: Target appointment not found or no previous appointment exists in the project
- `400 Bad Request`: Error during duplication process

**Example Usage:**
```bash
curl -X POST "https://api.perucontrol.com/api/appointment/{appointment-id}/duplicate-from-previous" \
  -H "Authorization: Bearer {token}"
```

This feature is particularly useful for recurring appointments where most of the data remains the same between visits, saving significant time in data entry.

