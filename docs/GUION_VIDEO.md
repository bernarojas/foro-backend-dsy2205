# Guion para la presentación en Kaltura (9 a 10 minutos)

La pauta de la Semana 5 pide mostrar en el video: **despliegue en la nube, ejecución mediante la URL
pública, conexión con Oracle Cloud, funcionamiento, características, diseño y funcionalidades de
todas las opciones, tanto del FrontEnd como del BackEnd** (este último con Postman), además de los
**patrones y el arquetipo**. Debe durar entre 7 y 10 minutos y mostrar todo en tiempo real.

## Antes de grabar

- [ ] Todo desplegado en la nube según `docs/DESPLIEGUE_NUBE.md` y respondiendo en la IP pública.
- [ ] Ejecutar `database/02_script_foro.sql` en Oracle Cloud para partir con los datos limpios.
- [ ] En el FrontEnd, ingresar como administrador y usar **Restablecer datos de ejemplo**; cerrar sesión.
- [ ] Postman con la colección importada, las variables `baseUsuarios`, `baseForo` y `baseModeracion`
      apuntando a la IP pública, y la carpeta "0. Inicio de sesión" sin ejecutar.
- [ ] Consola de Oracle Cloud abierta en **Database Actions → SQL** como `FORO`, con esta consulta lista:

```sql
SELECT 'FORO_ROL' TABLA, COUNT(*) REGISTROS FROM FORO_ROL
UNION ALL SELECT 'FORO_USUARIO', COUNT(*) FROM FORO_USUARIO
UNION ALL SELECT 'FORO_CATEGORIA', COUNT(*) FROM FORO_CATEGORIA
UNION ALL SELECT 'FORO_TEMA', COUNT(*) FROM FORO_TEMA
UNION ALL SELECT 'FORO_COMENTARIO', COUNT(*) FROM FORO_COMENTARIO
UNION ALL SELECT 'FORO_MODERACION', COUNT(*) FROM FORO_MODERACION;
```

- [ ] Una terminal conectada por SSH al servidor, el IDE abierto en el proyecto y el repositorio de
      GitHub en el navegador.
- [ ] El navegador con las herramientas de desarrollo listas para cambiar el tamaño de pantalla (F12 →
      modo dispositivo).

## Guion

| Tiempo | Qué mostrar | Qué decir |
|---|---|---|
| 0:00 a 0:30 | README en GitHub | Presentarse y el caso: Sistema de Foros en Línea, "Tertulia". FrontEnd en Angular, tres microservicios Spring Boot, Oracle Cloud y todo en Docker. |
| 0:30 a 1:20 | Terminal SSH: `docker compose -f docker-compose.cloud.yml ps` · `docker-compose.cloud.yml` | **Despliegue en la nube**: cuatro contenedores (frontend y tres microservicios) en el servidor. Mostrar el archivo compose y que la conexión a Oracle Cloud va por el wallet y las variables de `.env`. |
| 1:20 a 1:50 | Navegador en `http://IP_PUBLICA/` y `http://IP_PUBLICA:8081/api/roles` | **URL pública**: el FrontEnd y un microservicio respondiendo desde internet. |
| 1:50 a 2:40 | FrontEnd: portada, una categoría, buscar "spring", abrir un tema | **Diseño**: nombre, logo, colores e ilustraciones propias. Categorías (6), búsqueda por texto, categoría y autor, tema con sus comentarios. Sin sesión se puede leer, no publicar. |
| 2:40 a 3:10 | F12 → celular, tablet, escritorio | **Tres tamaños de pantalla** con la grilla de 12 columnas: 1, 2 y 3 columnas de categorías; menú desplegable y tablas apiladas en celular. |
| 3:10 a 4:10 | Registro, luego Recuperar contraseña | **Registro** con validaciones: dejar campos vacíos, correo mal escrito, y la contraseña con sus 7 requisitos marcándose. Crear la cuenta. Cerrar sesión y **recuperar contraseña**: correo, código simulado, contraseña nueva. |
| 4:10 a 5:00 | Ingresar como Usuario (botón de prueba) | **Rol USUARIO**: publicar un tema (mostrar validaciones), comentar, modificar y eliminar lo propio. **Perfil**: cambiar nombre, color y contraseña. |
| 5:00 a 5:50 | Ingresar como Moderador | **Rol MODERADOR**: el menú cambia. Banear un comentario desde el tema (motivo obligatorio), ver el panel de moderación, restaurar y el historial. Intentar entrar a `/admin/usuarios`: no tiene permiso. |
| 5:50 a 6:30 | Ingresar como Administrador | **Rol ADMINISTRADOR**: usuarios (cambiar rol, bloquear, crear), categorías (crear una con ícono y color). Reglas: no se puede quitar al último administrador. |
| 6:30 a 7:10 | IDE: `frontend/src/app/core` y `arquetipo/` | **Patrones y arquetipo**: en el FrontEnd, Repository sobre arreglos, servicios Singleton como fachada, signals (Observer). En el BackEnd, el arquetipo Maven con las capas y `ms-moderacion` generado desde él; Strategy en la moderación. |
| 7:10 a 8:00 | Postman, carpetas 0 a 2 · Oracle Cloud | **BackEnd con Postman**: login (token y rol), registrar un usuario (POST). **Pausa en Oracle Cloud**: el usuario nuevo en `FORO_USUARIO` con la clave encriptada. Modificar y eliminar. |
| 8:00 a 8:50 | Postman, carpetas 4 y 5 · Oracle Cloud | **ms-foro**: buscar, publicar un tema con el token de Diego, comentar. **Pausa en Oracle Cloud**: el tema en `FORO_TEMA`. |
| 8:50 a 9:40 | Postman, carpeta 6 · Oracle Cloud | **ms-moderacion**: un USUARIO intenta banear (403); el moderador banea con motivo; el tema deja de verse en ms-foro (404); el historial en `FORO_MODERACION`; restaurar. Ejecutar la consulta de conteos. |
| 9:40 a 10:00 | GitHub: ramas y commits | Trabajo en git con ramas por funcionalidad. Cierre. |

Si el tiempo queda justo, la colección completa también se puede mostrar con el **Runner** de
Postman (93 solicitudes, 211 verificaciones) en vez de solicitud por solicitud.

## Frases útiles

- "El FrontEnd y el BackEnd funcionan por separado en esta entrega: el FrontEnd maneja la información con arreglos dentro de repositorios, así que conectarlo después solo cambia esa capa."
- "Cada servicio de Angular equivale a un microservicio: usuarios, foro y moderación."
- "Los permisos están en dos lugares: las guardas deciden quién entra a cada pantalla y los servicios vuelven a revisar el rol antes de cada acción."
- "Los tres microservicios validan el mismo token; ninguno necesita llamar a otro."
- "El microservicio de moderación nació del arquetipo: por eso tiene las mismas capas, la misma seguridad y el mismo formato de errores que los otros dos."
- "Con Strategy, moderar otro tipo de publicación sería agregar una clase, sin tocar el servicio."
