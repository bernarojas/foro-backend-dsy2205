# Sistema de Foros en Línea: Backend

Actividad sumativa **"Programando nuestro BackEnd"** (Desarrollo Full Stack III, DSY2205, Semana 2).

Backend de un foro en línea con **dos microservicios Spring Boot** sobre una base de datos **Oracle**.
Se pueden probar con la colección de **Postman** incluida.

| Microservicio | Puerto | Qué hace |
|---|---|---|
| `ms-usuarios` | 8081 | Control de usuarios (crear, modificar, eliminar), roles e **inicio de sesión** |
| `ms-foro` | 8082 | **Búsqueda, visualización, publicación y comentarios** de temas del foro, más sus categorías |

```
             Postman / frontend
                │            │
   POST /api/auth/login      │  Authorization: Bearer <token>
                │            │
                ▼            ▼
      ┌──────────────┐   ┌──────────────┐
      │ ms-usuarios  │   │   ms-foro    │   Los dos validan el mismo token (JWT):
      │    :8081     │   │    :8082     │   ms-foro no necesita llamar a ms-usuarios.
      └──────┬───────┘   └──────┬───────┘
             │ JPA              │ JPA
             ▼                  ▼
      ┌─────────────────────────────────────┐
      │ Oracle · esquema FORO                │
      │ FORO_ROL, FORO_USUARIO               │  ← ms-usuarios
      │ FORO_CATEGORIA, FORO_TEMA,           │
      │ FORO_COMENTARIO                      │  ← ms-foro
      └─────────────────────────────────────┘
```

De los tres microservicios del caso se desarrollaron los dos primeros (el de moderación queda para
la siguiente entrega: las tablas ya traen el estado `BANEADO` y los dos microservicios lo respetan).

---

## Tecnologías

- Java 21, Spring Boot 3.3 (Web, Data JPA, Validation)
- Oracle Database (driver `ojdbc11`; funciona con Oracle Free/XE local o con Oracle Cloud y wallet)
- JWT (`jjwt`) para la sesión y BCrypt para las claves
- Maven (incluye `mvnw`, no hace falta tener Maven instalado)
- Docker Compose para levantar Oracle y los microservicios en local
- Postman para las pruebas

## Estructura

```
foro-backend/
├── database/
│   ├── 01_crear_usuario.sql      # crea el usuario/esquema FORO (como SYSTEM o ADMIN)
│   └── 02_script_foro.sql        # tablas + datos de prueba (como FORO)
├── ms-usuarios/                  # microservicio de usuarios e inicio de sesión
├── ms-foro/                      # microservicio del foro
├── postman/Foro-DSY2205.postman_collection.json
├── docs/
│   ├── GUION_VIDEO.md            # guion para la presentación en Kaltura (7 a 10 min)
│   └── FLUJO_GIT.md              # cómo se organizó el trabajo en git
├── docker/initdb/01_tablas.sh    # carga el script al crear la base en Docker
└── docker-compose.yml
```

Cada microservicio sigue la misma organización por capas:

```
cl.duoc.foro.<servicio>
├── controller   # endpoints REST (GET, POST, PUT, DELETE)
├── service      # reglas de negocio y permisos por rol
├── repository   # acceso a Oracle con Spring Data JPA (+ consultas JPQL)
├── model        # entidades mapeadas a las tablas
├── dto          # lo que entra y sale en JSON (con validaciones)
├── security     # validación del token JWT
├── exception    # errores como JSON con el código HTTP correcto
└── config       # configuración web
```

## Base de datos

Un esquema `FORO` con cinco tablas. Cada microservicio solo usa las suyas:

| Microservicio | Tabla | Registros de prueba |
|---|---|---|
| ms-usuarios | `FORO_ROL` | 3 (ADMINISTRADOR, MODERADOR, USUARIO) |
| ms-usuarios | `FORO_USUARIO` | 5 (uno bloqueado) |
| ms-foro | `FORO_CATEGORIA` | 6 (Programación, Videojuegos, Cine y Series, Deportes, Música, Tecnología y Hardware) |
| ms-foro | `FORO_TEMA` | 7 |
| ms-foro | `FORO_COMENTARIO` | 9 |

Entre los dos microservicios **no hay llaves foráneas**: el tema y el comentario guardan el id y el nombre
del autor que vienen en el token. Así cada microservicio funciona aunque el otro esté abajo.

## Roles y privilegios

| Acción | USUARIO | MODERADOR | ADMINISTRADOR |
|---|:-:|:-:|:-:|
| Registrarse, iniciar sesión, editar o eliminar su cuenta | ✔ | ✔ | ✔ |
| Ver la lista de usuarios y el resumen por rol | | ✔ | ✔ |
| Cambiar rol o bloquear una cuenta, eliminar cuentas ajenas | | | ✔ |
| Crear, modificar y eliminar roles y categorías | | | ✔ |
| Buscar y ver temas y comentarios (también sin sesión) | ✔ | ✔ | ✔ |
| Publicar temas y comentar | ✔ | ✔ | ✔ |
| Modificar sus propios temas y comentarios | ✔ | ✔ | ✔ |
| Eliminar temas y comentarios de otros | | ✔ | ✔ |

Reglas extra: una cuenta **bloqueada** no puede iniciar sesión y su token deja de servir en ms-usuarios;
siempre queda al menos un ADMINISTRADOR activo; los tres roles del sistema no se pueden borrar ni
renombrar; un rol o una categoría en uso no se puede borrar.

### Usuarios de prueba

Todos con la clave **`Duoc2026!`**

| Correo | Rol |
|---|---|
| admin@foro.cl | ADMINISTRADOR |
| moderador@foro.cl | MODERADOR |
| diego@foro.cl | USUARIO |
| valentina@foro.cl | USUARIO |
| matias@foro.cl | USUARIO (bloqueado) |

---

## Cómo ejecutarlo

### Opción A: todo con Docker (lo más rápido)

Requiere Docker Desktop.

```bash
docker compose --profile apps up -d --build
```

La primera vez Oracle tarda alrededor de un minuto: crea el usuario `FORO` y ejecuta
`database/02_script_foro.sql`. Después:

- ms-usuarios: http://localhost:8081/api/roles
- ms-foro: http://localhost:8082/api/categorias

Para conectarse a la base con SQL Developer: host `localhost`, puerto `1521`, servicio `FREEPDB1`,
usuario `FORO`, clave `Foro_Duoc_2026`.

Para volver los datos a su estado inicial basta con ejecutar otra vez `02_script_foro.sql`.

### Opción B: Oracle en Docker y los microservicios desde el IDE

Requiere JDK 21.

```bash
docker compose up -d oracle
cd ms-usuarios && ./mvnw spring-boot:run      # en Windows: mvnw.cmd spring-boot:run
cd ms-foro && ./mvnw spring-boot:run
```

### Opción C: Oracle Cloud (Autonomous Database) con wallet

1. En Oracle Cloud ejecutar `database/01_crear_usuario.sql` como `ADMIN` (usar la variante con
   `QUOTA UNLIMITED ON DATA` que está comentada al final) y luego `02_script_foro.sql` como `FORO`.
2. Descargar el wallet y descomprimirlo, por ejemplo en `C:/wallet/foro`.
3. Antes de levantar cada microservicio, definir las variables de entorno:

```bash
DB_URL=jdbc:oracle:thin:@<nombre_base>_high?TNS_ADMIN=C:/wallet/foro
DB_USER=FORO
DB_PASSWORD=Foro_Duoc_2026
```

(En IntelliJ: Run → Edit Configurations → Environment variables.)

### Configuración

| Variable | Valor por defecto | Para qué |
|---|---|---|
| `DB_URL` | `jdbc:oracle:thin:@//localhost:1521/FREEPDB1` | conexión a Oracle |
| `DB_USER` / `DB_PASSWORD` | `FORO` / `Foro_Duoc_2026` | usuario de la base |
| `JWT_SECRET` | una clave de desarrollo | firma del token; **la misma en los dos microservicios** |
| `JWT_HORAS` | `8` | duración de la sesión |
| `SHOW_SQL` | `false` | `true` muestra en consola el SQL que se ejecuta en Oracle |

---

## Endpoints

Los endpoints marcados con 🔒 requieren la cabecera `Authorization: Bearer <token>`.
El token se obtiene con `POST /api/auth/login`.

### ms-usuarios (http://localhost:8081)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Inicio de sesión: devuelve el token y los datos del usuario |
| GET 🔒 | `/api/auth/me` | La cuenta de la sesión actual |
| GET 🔒 | `/api/usuarios?texto=&rol=&estado=` | Listar y filtrar usuarios (ADMINISTRADOR, MODERADOR) |
| GET 🔒 | `/api/usuarios/resumen-roles` | Cuántos usuarios hay por rol, activos y bloqueados |
| GET 🔒 | `/api/usuarios/{id}` | Ver una cuenta (la propia, o ADMINISTRADOR/MODERADOR) |
| POST | `/api/usuarios` | Registrarse (un ADMINISTRADOR puede indicar `rolId`) |
| PUT 🔒 | `/api/usuarios/{id}` | Modificar (la propia; rol y estado solo ADMINISTRADOR) |
| DELETE 🔒 | `/api/usuarios/{id}` | Eliminar (la propia, o ADMINISTRADOR) |
| GET | `/api/roles` · `/api/roles/{id}` | Listar y ver roles |
| POST · PUT · DELETE 🔒 | `/api/roles` · `/api/roles/{id}` | Administrar roles (ADMINISTRADOR) |

### ms-foro (http://localhost:8082)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/categorias` · `/api/categorias/{id}` | Categorías con cantidad de temas, comentarios y última publicación |
| POST · PUT · DELETE 🔒 | `/api/categorias` · `/api/categorias/{id}` | Administrar categorías (ADMINISTRADOR) |
| GET | `/api/temas?texto=&categoriaId=&autorId=` | Buscar temas (texto en el título o el contenido) |
| GET | `/api/temas/mas-comentados?limite=5` | Los temas con más comentarios |
| GET 🔒 | `/api/temas/mios` | Los temas del usuario de la sesión |
| GET | `/api/temas/{id}` | Ver un tema completo con sus comentarios |
| POST 🔒 | `/api/temas` | Publicar un tema |
| PUT 🔒 | `/api/temas/{id}` | Modificar un tema (el autor) |
| DELETE 🔒 | `/api/temas/{id}` | Eliminar un tema (el autor, MODERADOR o ADMINISTRADOR) |
| GET | `/api/temas/{id}/comentarios` | Comentarios de un tema |
| POST 🔒 | `/api/temas/{id}/comentarios` | Comentar un tema |
| GET | `/api/comentarios/{id}` | Ver un comentario |
| PUT 🔒 | `/api/comentarios/{id}` | Modificar un comentario (el autor) |
| DELETE 🔒 | `/api/comentarios/{id}` | Eliminar un comentario (el autor, MODERADOR o ADMINISTRADOR) |

### Respuestas de error

Todos los errores salen en JSON con la misma forma y el código HTTP que corresponde:

```json
{
  "fecha": "2026-11-02T13:45:10.123",
  "status": 400,
  "error": "Bad Request",
  "mensaje": "Hay datos inválidos en la solicitud",
  "ruta": "/api/temas",
  "campos": { "titulo": "El título debe tener entre 5 y 150 caracteres" }
}
```

| Código | Cuándo |
|---|---|
| 200 / 201 / 204 | Consulta correcta / creado / eliminado |
| 400 | Datos inválidos |
| 401 | Falta el token, es inválido o expiró, o el correo o la clave son incorrectos |
| 403 | El rol no tiene permiso, o la cuenta está bloqueada |
| 404 | No existe |
| 409 | Conflicto: correo o nombre repetido, rol o categoría en uso, último administrador |

## Pruebas con Postman

1. Importar `postman/Foro-DSY2205.postman_collection.json`.
2. Ejecutar la carpeta **0. Inicio de sesión**: guarda los tokens en variables de la colección.
3. Ejecutar el resto de las carpetas en orden, o toda la colección con el **Runner**.

Cada solicitud trae pruebas automáticas (código HTTP y contenido). La colección completa son
60 solicitudes y 126 verificaciones, y al terminar deja la base como estaba, así que se puede repetir.
