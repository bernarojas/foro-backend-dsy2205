# Arquetipo Maven: microservicio del foro

`foro-microservicio-archetype` genera el esqueleto de un microservicio del Sistema de Foros con la
misma organización por capas de `ms-usuarios` y `ms-foro`. El microservicio `ms-moderacion` se generó
con este arquetipo.

Lo generado compila y arranca tal cual:

```
<artifactId>/
├── pom.xml                      # Spring Boot 3.3, Java 21, JPA, Validation, Oracle, JWT
├── Dockerfile · .dockerignore
└── src/main/
    ├── resources/application.properties   # puerto, Oracle y JWT por variables de entorno
    └── java/<package>/
        ├── <Clase>Application.java
        ├── config/WebConfig.java          # interceptor, sesión en los controladores y CORS
        ├── controller/EstadoController.java   # GET /api/estado
        ├── security/                      # valida el token que emite ms-usuarios
        ├── exception/                     # errores como JSON con su código HTTP
        ├── model/ · repository/ · service/ · dto/   # vacías, con un package-info.java que dice qué va
```

## Propiedades

| Propiedad | Obligatoria | Para qué |
|---|:-:|---|
| `groupId`, `artifactId`, `version`, `package` | sí | las de todo arquetipo Maven |
| `puerto` | sí | puerto HTTP del microservicio (`server.port`); 8081, 8082 y 8083 ya están en uso |
| `descripcion` | no | descripción del `pom.xml` |
| `claseAplicacion` | no | clase principal; por defecto sale del `artifactId` (`ms-moderacion` → `MsModeracionApplication`) |

## 1. Instalar el arquetipo

Desde la raíz del repositorio (requiere JDK 21 y Maven):

```bash
cd arquetipo/foro-microservicio-archetype
mvn install
```

Queda en el repositorio local de Maven (`~/.m2`). Al instalarlo se genera un proyecto de prueba
(`src/test/resources/projects/basico`), así que si una plantilla tiene un error la instalación falla.

## 2. Generar un microservicio

Desde la raíz del repositorio (se crea la carpeta `ms-moderacion/`):

```bash
mvn archetype:generate -B -DarchetypeCatalog=local \
  -DarchetypeGroupId=cl.duoc.foro \
  -DarchetypeArtifactId=foro-microservicio-archetype \
  -DarchetypeVersion=1.0.0 \
  -DgroupId=cl.duoc.foro \
  -DartifactId=ms-moderacion \
  -Dversion=1.0.0 \
  -Dpackage=cl.duoc.foro.moderacion \
  -Dpuerto=8083 \
  "-Ddescripcion=Microservicio de moderación: banear y restaurar temas y comentarios, con historial"
```

Sin `-B` Maven pregunta los valores uno por uno.

Para probarlo (con Oracle arriba: `docker compose up -d oracle`):

```bash
cd ms-moderacion
mvn spring-boot:run
# http://localhost:8083/api/estado
```

Después se copia el wrapper de Maven (`mvnw`, `mvnw.cmd` y `.mvn/`) desde otro microservicio y se
agrega el servicio a `docker-compose.yml`.

## Sin Maven instalado (con Docker)

Los mismos comandos dentro de la imagen de Maven, con un volumen para que el arquetipo instalado
siga ahí al generar. Desde la raíz del repositorio:

```bash
docker run --rm -v "$PWD:/repo" -v foro-m2:/root/.m2 \
  -w /repo/arquetipo/foro-microservicio-archetype maven:3.9-eclipse-temurin-21 mvn install

docker run --rm -v "$PWD:/repo" -v foro-m2:/root/.m2 \
  -w /repo maven:3.9-eclipse-temurin-21 mvn archetype:generate -B -DarchetypeCatalog=local \
  -DarchetypeGroupId=cl.duoc.foro ...   # los mismos parámetros del paso 2
```

En Git Bash de Windows hay que anteponer `MSYS_NO_PATHCONV=1` y escribir la ruta del repositorio
al estilo Windows (`C:/ruta/al/foro-backend:/repo`).

## Plantillas

Las plantillas están en `src/main/resources/archetype-resources/` y las propiedades y los archivos
que se copian, en `src/main/resources/META-INF/maven/archetype-metadata.xml`. El arquetipo procesa
las plantillas con Velocity, que usa `$` y `#`: donde el archivo generado necesita un `${...}` de
Spring o de Maven (por ejemplo `${DB_URL:...}`) la plantilla lo escribe como
`${symbol_dollar}{...}`, igual que hace `archetype:create-from-project`.
