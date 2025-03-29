# Documentacion básica de C# y ASP.NET

ASP.NET core controllers API 9.0

https://dotnet.microsoft.com/en-us/apps/aspnet

## Tipos de APIs en aspnet

- Minimal - Parecido a express
- Controllers - Parecido a Nestjs, estructurado, completo

- [aspnet core 9 api](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/apis?view=aspnetcore-9.0)
- [aspnet controllers](https://learn.microsoft.com/en-us/aspnet/core/web-api/?view=aspnetcore-9.0)
- [tutorial para crear proyecto nuevo](https://learn.microsoft.com/en-us/aspnet/core/tutorials/first-web-api?view=aspnetcore-9.0)

## Creación del proyecto

> Reemplazar `MyApp` con el nombre del proyecto, por ejemplo `Trazo`.

Con Docker, ejecutar el comando:

```sh
docker run --rm -v $(pwd):/app mcr.microsoft.com/dotnet/sdk:9.0 sh -c "cd /app && dotnet new webapi --use-controllers -o MyApp && chown -R $(id -u):$(id -g) MyApp"
```

para crear un proyecto nuevo, vacio, sin tener que instalar ningun programa.


## Ejecutar el proyecto mediante Docker

En `Deployment/docker-compose.local.yml` esta el archivo docker compose para levantar todo el backend.

Para ejecutarlo:

- Dentro de la carpeta `src` ejecutar (nótese que no hay parametro -d):

```sh
docker-compose -f Deployment/docker-compose.local.yml up
```

- Esto levantará el backend, postgres y pgadmin.
- Dejar el terminal abierto.
- En otro terminal, ejecutar `docker exec -it aspnet-acide-dev sh` para entrar al contenedor.
- Entraras a un contenedor vacio, listo para iniciar el proyecto.
- Dentro ejecuta `dotnet-ef database update` para aplicar las migraciones.
- Luego, ejecuta `dotnet watch run` para iniciar la aplicacion.
- Ahora puedes acceder al backend desde afuera, en `http://localhost:5233`.
- La interfaz de openapi esta en `http://localhost:5233/scalar/v1`

El frontend se puede conectar normalmente a `http://localhost:5233`.


## Swagger/OpenAPI

Dotnet soporta OpenAPI sin ninguna configuración. Para agregar una interfaz
donde ver los endpoints y ejecutarlos, instala
[ScalarUI](https://github.com/scalar/scalar/blob/main/integrations/aspnetcore/README.md).


## Login

### Usuario/contraseña de admin por defecto

Se establecen en el seeder, archivo `Model/DatabaseSeeder.cs`

- Usuario: `admin@admin.com`
- Contraseña: `Acide2025/1`


## Crear Entidades


## Crear Migraciones

Luego de crear entitades en la carpeta `Model`, crea una migración con
el comando:
```sh
dotnet ef migrations add NombreDeLaMigracion
```

## Aplicar Migraciones

Cuando hayan migraciones pendientes, utiliza el sig. comando para
aplicarlas en la base de datos:
```sh
dotnet ef database update
```





