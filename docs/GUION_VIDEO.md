# Guion para la presentación en Kaltura (9 a 10 minutos)

El video debe durar entre 7 y 10 minutos y mostrar todo en tiempo real. Cubre lo que pide la pauta
de la Semana 5 y lo que reforzó el profesor en el anuncio de la sesión 5:

- **Docker**: construcción y ejecución con imágenes y contenedores en **Docker Desktop local**,
  comprobando la **comunicación entre FrontEnd, BackEnd y base de datos**.
- **Oracle Cloud**: los microservicios conectados a la base en la nube.
- **FrontEnd**: diseño, tres tamaños de pantalla, todas las pantallas y validaciones, dos o más roles.
- **BackEnd con Postman**: los tres microservicios, sus operaciones REST y la persistencia en Oracle.
- **Arquetipo Maven** (construcción y uso), **patrones de diseño** y **Git**.

## Antes de grabar

- [ ] Base de Oracle Cloud creada, wallet en `wallet/` y `.env` completo (`docs/ORACLE_CLOUD.md`).
- [ ] Ejecutar `database/02_script_foro.sql` en Oracle Cloud para partir con los datos limpios.
- [ ] `docker compose -f docker-compose.oracle-cloud.yml up -d --build` y esperar a que los cuatro
      contenedores estén arriba.
- [ ] En el FrontEnd, ingresar como administrador y usar **Restablecer datos de ejemplo**; cerrar sesión.
- [ ] Postman con la colección importada y la carpeta "0. Inicio de sesión" sin ejecutar.
- [ ] Consola de Oracle Cloud abierta en **Database Actions → SQL** como `FORO`, con esta consulta lista:

```sql
SELECT 'FORO_ROL' TABLA, COUNT(*) REGISTROS FROM FORO_ROL
UNION ALL SELECT 'FORO_USUARIO', COUNT(*) FROM FORO_USUARIO
UNION ALL SELECT 'FORO_CATEGORIA', COUNT(*) FROM FORO_CATEGORIA
UNION ALL SELECT 'FORO_TEMA', COUNT(*) FROM FORO_TEMA
UNION ALL SELECT 'FORO_COMENTARIO', COUNT(*) FROM FORO_COMENTARIO
UNION ALL SELECT 'FORO_MODERACION', COUNT(*) FROM FORO_MODERACION;
```

- [ ] Docker Desktop abierto en la pestaña **Containers**, una terminal en la carpeta del proyecto,
      el IDE abierto y el repositorio de GitHub en el navegador.
- [ ] El navegador con las herramientas de desarrollo listas para cambiar el tamaño de pantalla (F12 →
      modo dispositivo).

## Guion

| Tiempo | Qué mostrar | Qué decir |
|---|---|---|
| 0:00 a 0:30 | README en GitHub | Presentarse y el caso: Sistema de Foros en Línea, "Tertulia". FrontEnd en Angular, tres microservicios Spring Boot, base en Oracle Cloud y todo en contenedores Docker. |
| 0:30 a 1:30 | IDE: `Dockerfile` de un microservicio y del frontend, `docker-compose.oracle-cloud.yml` · Terminal: `docker compose -f docker-compose.oracle-cloud.yml ps` · Docker Desktop | **Docker**: cada parte tiene su imagen (Maven compila y un JRE ejecuta; Node compila Angular y nginx lo sirve). Compose levanta los cuatro contenedores en una red y les pasa la conexión a Oracle Cloud: el wallet montado en `/wallet` y las variables de `.env`. `docker exec foro-ms-usuarios printenv DB_URL` muestra que apunta a Oracle Cloud. |
| 1:30 a 2:15 | FrontEnd como administrador: **Conexión con el BackEnd** | **Comunicación FrontEnd → BackEnd → Oracle**: los tres microservicios en línea con datos leídos de la base. Iniciar sesión real con `admin@foro.cl` y mostrar el token y las consultas protegidas; con `diego@foro.cl` responde 403. El registro de peticiones HTTP. Explicar que nginx reenvía `/servicios/...` al contenedor de cada microservicio. |
| 2:15 a 3:00 | FrontEnd sin sesión: portada, una categoría, buscar "spring", abrir un tema | **Diseño**: nombre, logo, colores e ilustraciones propias. Seis categorías, búsqueda por texto, categoría y autor, tema con sus comentarios. Sin sesión se puede leer, no publicar. El resto del FrontEnd trabaja con arreglos, como pide la actividad. |
| 3:00 a 3:30 | F12 → celular, tablet, escritorio | **Tres tamaños de pantalla** con la grilla de 12 columnas: 1, 2 y 3 columnas de categorías; menú desplegable y tablas apiladas en celular y tablet. |
| 3:30 a 4:30 | Registro, luego Recuperar contraseña | **Registro** con validaciones: campos vacíos, correo mal escrito y la contraseña con sus 7 requisitos marcándose. Crear la cuenta. Cerrar sesión y **recuperar contraseña**: correo, código simulado, contraseña nueva. |
| 4:30 a 5:15 | Ingresar como Usuario (botón de prueba) | **Rol USUARIO**: publicar un tema (mostrar validaciones), comentar, modificar y eliminar lo propio. **Perfil**: cambiar nombre, color y contraseña. |
| 5:15 a 5:55 | Ingresar como Moderador | **Rol MODERADOR**: el menú cambia. Banear un comentario (motivo obligatorio), panel de moderación, restaurar e historial. Intentar entrar a `/admin/usuarios`: no tiene permiso. |
| 5:55 a 6:30 | Ingresar como Administrador | **Rol ADMINISTRADOR**: usuarios (cambiar rol, bloquear, crear) y categorías (crear una con ícono y color). No se puede quitar al último administrador. |
| 6:30 a 7:15 | IDE: `frontend/src/app/core` y `arquetipo/` | **Patrones y arquetipo**: en el FrontEnd, Repository sobre arreglos, servicios Singleton como fachada y signals (Observer). En el BackEnd, el arquetipo Maven con las capas, cómo se instala (`mvn install`) y cómo se generó `ms-moderacion` (`mvn archetype:generate`); Strategy en la moderación. |
| 7:15 a 8:05 | Postman, carpetas 0 a 2 · Oracle Cloud | **BackEnd con Postman**: login (token y rol), registrar un usuario (POST). **Pausa en Oracle Cloud**: el usuario nuevo en `FORO_USUARIO` con la clave encriptada. Modificar y eliminar. |
| 8:05 a 8:50 | Postman, carpetas 4 y 5 · Oracle Cloud | **ms-foro**: buscar, publicar un tema con el token de Diego, comentar. **Pausa en Oracle Cloud**: el tema en `FORO_TEMA`. |
| 8:50 a 9:35 | Postman, carpeta 6 · Oracle Cloud | **ms-moderacion**: un USUARIO intenta banear (403); el moderador banea con motivo; el tema deja de verse en ms-foro (404); el historial en `FORO_MODERACION`; restaurar. Ejecutar la consulta de conteos. |
| 9:35 a 10:00 | GitHub: ramas, commits y etiquetas | **Git**: `main`, `develop` y una rama `feature/*` por funcionalidad, unidas con merge; etiquetas por entrega. Cierre. |

Si el tiempo queda justo, la colección completa también se puede mostrar con el **Runner** de
Postman (93 solicitudes, 211 verificaciones) en vez de solicitud por solicitud.

## Frases útiles

- "Primero comprobé que todo funcionara fuera de Docker; después construí una imagen por componente y al final los uní con Docker Compose."
- "El FrontEnd maneja la información con arreglos dentro de repositorios, como pide la actividad; esta pantalla de conexión es la que demuestra que los contenedores se hablan entre sí y con Oracle."
- "Cada servicio de Angular equivale a un microservicio: usuarios, foro y moderación."
- "Los permisos están en dos lugares: las guardas deciden quién entra a cada pantalla y los servicios vuelven a revisar el rol antes de cada acción."
- "Los tres microservicios validan el mismo token; ninguno necesita llamar a otro."
- "El microservicio de moderación nació del arquetipo: por eso tiene las mismas capas, la misma seguridad y el mismo formato de errores que los otros dos."
- "Con Strategy, moderar otro tipo de publicación sería agregar una clase, sin tocar el servicio."
