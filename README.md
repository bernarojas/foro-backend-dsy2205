# Tertulia · Sistema de Foros en Línea

Actividad sumativa **"Desarrollando nuestro proyecto bajo lineamientos empresariales"**
(Desarrollo Full Stack III, DSY2205, Semana 5). Continúa la entrega de la Semana 2.

Aplicación Full Stack de un foro en línea:

| Parte | Tecnología | Puerto local | Qué hace |
|---|---|---|---|
| `frontend` | Angular 22 + Bootstrap 5 | 8084 | La aplicación web **Tertulia**: todas las pantallas, validaciones y reglas de negocio, con los datos en arreglos |
| `ms-usuarios` | Spring Boot 3.3 | 8081 | Control de usuarios (crear, modificar, eliminar), roles e **inicio de sesión** |
| `ms-foro` | Spring Boot 3.3 | 8082 | **Búsqueda, visualización, publicación y comentarios** de temas, más sus categorías |
| `ms-moderacion` | Spring Boot 3.3 | 8083 | **Gestión de publicaciones y comentarios** por el equipo de moderación: banear, restaurar e historial |
| `arquetipo` | Maven Archetype | | El arquetipo con el que se generan los microservicios |
| `database` | Oracle | 1521 | Script de la base (usuario `FORO`, 6 tablas y datos de prueba) |

En esta entrega **el FrontEnd y el BackEnd funcionan por separado**, como pide la actividad: el FrontEnd
maneja la información con arreglos y el BackEnd se prueba con Postman.

```
        Navegador                                Postman
            │                                       │
            ▼                          Authorization: Bearer <token>
   ┌─────────────────┐            ┌────────────┬────────────┬───────────────┐
   │ frontend :8084  │            │ms-usuarios │  ms-foro   │ ms-moderacion │
   │ Angular + nginx │            │   :8081    │   :8082    │     :8083     │
   │ datos: arreglos │            └─────┬──────┴─────┬──────┴───────┬───────┘
   └─────────────────┘                  │ JPA        │ JPA          │ JPA
                                        ▼            ▼              ▼
                                  ┌───────────────────────────────────────┐
                                  │ Oracle · esquema FORO                 │
                                  │ FORO_ROL, FORO_USUARIO      ← usuarios│
                                  │ FORO_CATEGORIA, FORO_TEMA,            │
                                  │ FORO_COMENTARIO             ← foro    │
                                  │ FORO_MODERACION             ← moderac.│
                                  └───────────────────────────────────────┘
```

Los tres microservicios validan el mismo token (JWT) que entrega `ms-usuarios` al iniciar sesión:
ninguno necesita llamar a otro.

---

## Estructura del repositorio

```
foro-backend/
├── frontend/                     # aplicación Angular (Tertulia)
├── arquetipo/                    # arquetipo Maven de los microservicios + cómo usarlo
├── ms-usuarios/                  # microservicio de usuarios e inicio de sesión
├── ms-foro/                      # microservicio del foro
├── ms-moderacion/                # microservicio de moderación (generado con el arquetipo)
├── database/
│   ├── 01_crear_usuario.sql      # crea el usuario/esquema FORO (como SYSTEM o ADMIN)
│   └── 02_script_foro.sql        # tablas + datos de prueba (como FORO)
├── postman/Foro-DSY2205.postman_collection.json
├── docs/
│   ├── DESPLIEGUE_NUBE.md        # Docker en la nube + Oracle Cloud, paso a paso
│   ├── GUION_VIDEO.md            # guion para la presentación en Kaltura (7 a 10 min)
│   └── FLUJO_GIT.md              # cómo se organizó el trabajo en git
├── docker-compose.yml            # todo en local: Oracle + 3 microservicios + frontend
├── docker-compose.cloud.yml      # nube: 3 microservicios + frontend contra Oracle Cloud
└── .env.example                  # variables del despliegue en la nube
```

---

## Cómo ejecutarlo

Requiere Docker Desktop. Desde la raíz del repositorio:

```bash
docker compose --profile apps up -d --build
```

La primera vez Oracle tarda alrededor de un minuto (crea el usuario `FORO` y ejecuta el script).
Los microservicios quedan listos unos 15 segundos después de arrancar.

- FrontEnd: http://localhost:8084
- ms-usuarios: http://localhost:8081/api/roles
- ms-foro: http://localhost:8082/api/categorias
- ms-moderacion: http://localhost:8083/api/estado

Si el puerto 8084 está ocupado: `FRONTEND_PORT=8090 docker compose --profile apps up -d`.

Para la nube (Docker en un servidor + Oracle Cloud) ver [docs/DESPLIEGUE_NUBE.md](docs/DESPLIEGUE_NUBE.md).

### Usuarios de prueba

Sirven en el FrontEnd y en el BackEnd. Todos con la clave **`Duoc2026!`**

| Correo | Rol |
|---|---|
| admin@foro.cl | ADMINISTRADOR |
| moderador@foro.cl | MODERADOR |
| diego@foro.cl | USUARIO |
| valentina@foro.cl | USUARIO |
| matias@foro.cl | USUARIO (bloqueado) |

En la pantalla "Ingresar" hay tres botones que rellenan el formulario con una cuenta de cada rol.

---

## FrontEnd (carpeta `frontend/`)

Angular 22 (componentes independientes, signals, formularios reactivos, rutas con carga diferida),
HTML, CSS, Bootstrap 5.3 (grilla de 12 columnas y su JavaScript para los menús) y Bootstrap Icons.

Para trabajar en él sin Docker (Node 22 o superior):

```bash
cd frontend
npm install
npm start          # http://localhost:4200
```

### Pantallas

| Pantalla | Ruta | Quién entra |
|---|---|---|
| Portada: buscador, categorías, actividad reciente, más comentados | `/` | todos |
| Temas de una categoría | `/categorias/:id` | todos |
| Búsqueda por texto, categoría, autor y orden | `/buscar` | todos |
| Tema con sus comentarios | `/temas/:id` | todos |
| Normas del foro | `/normas` | todos |
| **Inicio de sesión** | `/ingresar` | sin sesión |
| **Registro de usuarios** | `/registro` | sin sesión |
| **Recuperar contraseña** (correo → código → contraseña nueva) | `/recuperar` | sin sesión |
| **Modificación de perfil** (datos, contraseña, eliminar cuenta) | `/perfil` | con sesión |
| Mis publicaciones | `/mis-publicaciones` | con sesión |
| Publicar y modificar un tema | `/temas/nuevo`, `/temas/:id/editar` | con sesión |
| Panel de moderación: banear, restaurar, historial | `/moderacion` | MODERADOR, ADMINISTRADOR |
| Usuarios: crear, cambiar rol, bloquear, eliminar | `/admin/usuarios` | ADMINISTRADOR |
| Categorías: crear, modificar, eliminar | `/admin/categorias` | ADMINISTRADOR |

### Roles y privilegios

| Acción | Visitante | USUARIO | MODERADOR | ADMINISTRADOR |
|---|:-:|:-:|:-:|:-:|
| Leer y buscar temas y comentarios | ✔ | ✔ | ✔ | ✔ |
| Registrarse, iniciar sesión, recuperar contraseña | ✔ | | | |
| Publicar temas y comentar; modificar y eliminar lo propio | | ✔ | ✔ | ✔ |
| Modificar su perfil, cambiar su contraseña, eliminar su cuenta | | ✔ | ✔ | ✔ |
| Banear y restaurar temas y comentarios; ver el historial | | | ✔ | ✔ |
| Eliminar temas y comentarios de otros | | | ✔ | ✔ |
| Administrar cuentas (rol, bloqueo, alta, baja) y categorías | | | | ✔ |

Reglas extra: una cuenta bloqueada no puede iniciar sesión; siempre queda al menos un administrador
activo; un tema baneado solo lo ven su autor y el equipo de moderación, y no acepta comentarios; un
comentario baneado se muestra como "retirado por moderación"; no se puede eliminar una categoría con
temas y el foro mantiene al menos 5 categorías.

### Validaciones

Todos los formularios validan cada campo y muestran el mensaje bajo el campo
(`core/validators/validadores.ts`): obligatorios, largos mínimo y máximo, formato de correo, nombres
solo con letras, correo y nombre de categoría sin repetir, código de 6 dígitos, aceptar las normas.

La **contraseña** tiene 7 validaciones de seguridad, que se van marcando mientras se escribe:
mínimo 8 caracteres, máximo 20, una mayúscula, una minúscula, un número, un carácter especial y
sin espacios. Además debe repetirse igual y, al cambiarla, ser distinta de la anterior.

### Tres tamaños de pantalla

Diseño adaptable sobre la grilla de 12 columnas de Bootstrap:

| Tamaño | Ancho | Ejemplos |
|---|---|---|
| Celular | menos de 768px | una columna, menú desplegable, tablas como tarjetas apiladas |
| Tablet | 768px a 991px | categorías en 2 columnas, formularios en 2 columnas |
| Escritorio | 992px o más | categorías en 3 columnas, contenido 8/12 + lateral 4/12, tablas completas |

### Patrón de diseño del FrontEnd

La aplicación está organizada por capas, con estos patrones:

| Patrón | Dónde | Para qué |
|---|---|---|
| **Repository** | `core/repositories/` | Un repositorio por colección (usuarios, roles, categorías, temas, comentarios, moderación) con las operaciones de un CRUD sobre un **arreglo**. El resto de la aplicación no sabe dónde viven los datos: para conectar el BackEnd bastará con cambiar los repositorios por llamadas HTTP |
| **Singleton + inyección de dependencias** | `@Injectable({ providedIn: 'root' })` | Una sola instancia de cada repositorio y servicio: toda la aplicación comparte los mismos datos |
| **Facade (capa de servicios)** | `core/services/` | `AuthService`, `UsuarioService`, `ForoService` y `ModeracionService` reúnen las reglas de negocio y los permisos; las pantallas solo hablan con ellos. Cada uno equivale a un microservicio |
| **Observer** | signals (`signal`, `computed`) | Las pantallas se actualizan solas cuando cambian los datos o la sesión |
| **MVVM** | `features/` | Cada pantalla es un componente: la plantilla HTML es la vista y la clase es su modelo de vista |

```
frontend/src/app/
├── core/
│   ├── models/          # modelos (mismos campos que las tablas de Oracle)
│   ├── data/            # datos iniciales: los arreglos
│   ├── repositories/    # patrón Repository sobre los arreglos
│   ├── services/        # reglas de negocio y permisos por rol
│   ├── guards/          # quién puede entrar a cada ruta
│   └── validators/      # validaciones de los formularios y sus mensajes
├── shared/              # barra de navegación, avisos, diálogo, avatar, lista de temas
└── features/            # las pantallas: auth, cuenta, foro, moderacion, admin
```

Los datos parten de los arreglos de `core/data/datos-iniciales.ts` (los mismos registros de prueba
que el script de Oracle, más algunos extra). Los cambios se guardan también en el almacenamiento del
navegador para que no se pierdan al recargar; el administrador puede volver a los datos de ejemplo
desde su menú ("Restablecer datos de ejemplo").

---

## BackEnd

- Java 21, Spring Boot 3.3 (Web, Data JPA, Validation), Maven (cada microservicio incluye `mvnw`)
- Oracle Database (driver `ojdbc11`; funciona con Oracle Free local o con Oracle Cloud y wallet)
- JWT (`jjwt`) para la sesión y BCrypt para las claves
- Respuestas y errores siempre en JSON, con el código HTTP que corresponde

### Arquetipo

Los microservicios siguen el arquetipo de `arquetipo/foro-microservicio-archetype`
(ver [arquetipo/README.md](arquetipo/README.md)). Genera un microservicio que compila y arranca tal
cual, con esta organización por capas:

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

`ms-moderacion` se generó con el arquetipo:

```bash
cd arquetipo/foro-microservicio-archetype && mvn install && cd ../..
mvn archetype:generate -B -DarchetypeCatalog=local \
  -DarchetypeGroupId=cl.duoc.foro -DarchetypeArtifactId=foro-microservicio-archetype -DarchetypeVersion=1.0.0 \
  -DgroupId=cl.duoc.foro -DartifactId=ms-moderacion -Dversion=1.0.0 \
  -Dpackage=cl.duoc.foro.moderacion -Dpuerto=8083
```

### Patrón de diseño en los microservicios

- **Capas** Controller → Service → Repository con **DTO**, en los tres.
- **Strategy** en `ms-moderacion` (`service/estrategia/`): moderar un tema y moderar un comentario son
  la misma operación sobre tablas distintas. `EstrategiaModeracion` es la interfaz,
  `EstrategiaModeracionTema` y `EstrategiaModeracionComentario` sus implementaciones, y
  `ModeracionService` elige la estrategia según el tipo de publicación, sin `if` por tipo.

### Base de datos

Un esquema `FORO` con seis tablas. Cada microservicio es dueño de las suyas:

| Microservicio | Tabla | Registros de prueba |
|---|---|---|
| ms-usuarios | `FORO_ROL` | 3 (ADMINISTRADOR, MODERADOR, USUARIO) |
| ms-usuarios | `FORO_USUARIO` | 5 (uno bloqueado) |
| ms-foro | `FORO_CATEGORIA` | 6 (Programación, Videojuegos, Cine y Series, Deportes, Música, Tecnología y Hardware) |
| ms-foro | `FORO_TEMA` | 7 |
| ms-foro | `FORO_COMENTARIO` | 9 |
| ms-moderacion | `FORO_MODERACION` | 2 (historial de baneos y restauraciones) |

Entre microservicios **no hay llaves foráneas**: el tema, el comentario y el registro de moderación
guardan el id y el nombre de la persona que vienen en el token. `ms-moderacion` solo cambia la columna
`ESTADO` (`PUBLICADO` / `BANEADO`) de temas y comentarios, y `ms-foro` deja de mostrar lo baneado.

Para conectarse con SQL Developer en local: host `localhost`, puerto `1521`, servicio `FREEPDB1`,
usuario `FORO`, clave `Foro_Duoc_2026`. Para volver los datos a su estado inicial basta con ejecutar
otra vez `02_script_foro.sql`.

### Configuración

| Variable | Valor por defecto | Para qué |
|---|---|---|
| `DB_URL` | `jdbc:oracle:thin:@//localhost:1521/FREEPDB1` | conexión a Oracle |
| `DB_USER` / `DB_PASSWORD` | `FORO` / `Foro_Duoc_2026` | usuario de la base |
| `JWT_SECRET` | una clave de desarrollo | firma del token; **la misma en los tres microservicios** |
| `JWT_HORAS` | `8` | duración de la sesión |
| `SHOW_SQL` | `false` | `true` muestra en consola el SQL que se ejecuta en Oracle |

Con Oracle Cloud: `DB_URL=jdbc:oracle:thin:@<nombre_base>_high?TNS_ADMIN=<carpeta del wallet>`.

### Endpoints

Los marcados con 🔒 requieren la cabecera `Authorization: Bearer <token>`.
El token se obtiene con `POST /api/auth/login`.

**ms-usuarios (http://localhost:8081)**

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

**ms-foro (http://localhost:8082)**

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

**ms-moderacion (http://localhost:8083)** · todo `/api/moderacion` exige MODERADOR o ADMINISTRADOR

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/estado` | Nombre del servicio y hora (viene del arquetipo) |
| GET 🔒 | `/api/moderacion/temas?estado=&texto=` | Temas para revisión, incluidos los baneados |
| PUT 🔒 | `/api/moderacion/temas/{id}/banear` | Banea el tema; cuerpo `{"motivo": "..."}` obligatorio |
| PUT 🔒 | `/api/moderacion/temas/{id}/restaurar` | Lo vuelve a publicar (motivo opcional) |
| GET 🔒 | `/api/moderacion/comentarios?estado=&texto=` | Comentarios para revisión, con el tema donde están |
| PUT 🔒 | `/api/moderacion/comentarios/{id}/banear` | Banea el comentario; motivo obligatorio |
| PUT 🔒 | `/api/moderacion/comentarios/{id}/restaurar` | Lo vuelve a publicar |
| GET 🔒 | `/api/moderacion/historial?tipo=&accion=&moderadorId=&publicacionId=` | Historial de acciones, lo más reciente primero |
| GET 🔒 | `/api/moderacion/resumen` | Publicados y baneados por tipo, y acciones por moderador |

### Respuestas de error

Todos los errores salen en JSON con la misma forma:

```json
{
  "fecha": "2026-11-23T13:45:10.123",
  "status": 400,
  "error": "Bad Request",
  "mensaje": "Hay datos inválidos en la solicitud",
  "ruta": "/api/moderacion/temas/4/banear",
  "campos": { "motivo": "El motivo es obligatorio" }
}
```

| Código | Cuándo |
|---|---|
| 200 / 201 / 204 | Consulta correcta / creado / eliminado |
| 400 | Datos inválidos |
| 401 | Falta el token, es inválido o expiró, o el correo o la clave son incorrectos |
| 403 | El rol no tiene permiso, o la cuenta está bloqueada |
| 404 | No existe |
| 409 | Conflicto: correo o nombre repetido, rol o categoría en uso, último administrador, publicación ya baneada o ya publicada |

### Pruebas con Postman

1. Importar `postman/Foro-DSY2205.postman_collection.json`.
2. Ejecutar la carpeta **0. Inicio de sesión**: guarda los tokens en variables de la colección.
3. Ejecutar el resto de las carpetas en orden, o toda la colección con el **Runner**.

Cada solicitud trae pruebas automáticas (código HTTP y contenido). La colección completa son
**93 solicitudes y 211 verificaciones** sobre los tres microservicios, y al terminar deja los temas y
comentarios como estaban, así que se puede repetir. Para probar contra la nube basta con cambiar las
variables `baseUsuarios`, `baseForo` y `baseModeracion` de la colección.

También se puede correr desde la consola: `npx newman run postman/Foro-DSY2205.postman_collection.json`.
