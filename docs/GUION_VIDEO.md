# Guion para la presentación en Kaltura (8 a 9 minutos)

La pauta pide mostrar **funcionamiento, características, diseño y funcionalidades con Postman**, y
**verificar en tiempo real** que la información queda guardada en Oracle. El video debe durar entre
7 y 10 minutos.

## Antes de grabar

- [ ] `docker compose --profile apps up -d --build` (o los dos microservicios desde el IDE).
- [ ] Ejecutar `database/02_script_foro.sql` para partir con los datos limpios.
- [ ] Postman abierto con la colección importada y la carpeta "0. Inicio de sesión" sin ejecutar.
- [ ] SQL Developer (o la consola de Oracle Cloud) conectado como `FORO`, con esta consulta lista:

```sql
SELECT 'FORO_ROL' TABLA, COUNT(*) REGISTROS FROM FORO_ROL
UNION ALL SELECT 'FORO_USUARIO', COUNT(*) FROM FORO_USUARIO
UNION ALL SELECT 'FORO_CATEGORIA', COUNT(*) FROM FORO_CATEGORIA
UNION ALL SELECT 'FORO_TEMA', COUNT(*) FROM FORO_TEMA
UNION ALL SELECT 'FORO_COMENTARIO', COUNT(*) FROM FORO_COMENTARIO;
```

- [ ] El IDE abierto en el proyecto y el repositorio de GitHub en el navegador.

## Guion

| Tiempo | Qué mostrar | Qué decir |
|---|---|---|
| 0:00 a 0:40 | Portada / README | Presentarse, el caso (Sistema de Foros en Línea) y qué dos microservicios se hicieron: usuarios con inicio de sesión, y foro con búsqueda, publicación y comentarios. |
| 0:40 a 1:40 | Diagrama del README y el IDE | **Diseño**: dos proyectos Spring Boot independientes (puertos 8081 y 8082), una base Oracle, cada microservicio dueño de sus tablas. Mostrar las capas: controller, service, repository, model, dto. |
| 1:40 a 2:30 | `02_script_foro.sql` y SQL Developer | **Base de datos**: las 5 tablas, llaves y restricciones; ejecutar la consulta de conteo (3, 5, 6, 7, 9 registros). Seis categorías y tres roles. |
| 2:30 a 3:00 | `application.properties` | Conexión a Oracle por variables de entorno y la clave JWT compartida. |
| 3:00 a 4:00 | Postman, carpeta 0 | **Inicio de sesión**: login del administrador (mostrar el token y el rol), clave incorrecta (401) y cuenta bloqueada (403). Explicar que el token guarda id, nombre y rol, y que lo valida también ms-foro. |
| 4:00 a 5:15 | Postman, carpetas 1 y 2 | **CRUD de usuarios y roles**: registrar a Pedro (POST), listar con filtros (GET), modificar (PUT) y un USUARIO intentando cambiarse el rol (403). **Pausa en SQL Developer**: mostrar a Pedro en `FORO_USUARIO` con la clave encriptada. El administrador lo bloquea y su token deja de servir. Eliminar (DELETE) y volver a consultar en Oracle. |
| 5:15 a 6:00 | Postman, carpeta 3 | **Categorías**: estadística por categoría (consulta con agrupación), crear como ADMINISTRADOR y como USUARIO (403), no se puede borrar una categoría con temas (409). |
| 6:00 a 7:30 | Postman, carpeta 4 | **Foro**: búsqueda por texto, por categoría y por autor; los más comentados; ver un tema con sus comentarios. Publicar un tema con el token de Diego (el autor sale del token). **Pausa en Oracle**: el tema nuevo en `FORO_TEMA`. Modificarlo, y Valentina intentando modificarlo (403). |
| 7:30 a 8:30 | Postman, carpeta 5 | **Comentarios**: Valentina comenta; Diego no puede editar ni borrar ese comentario (403); el MODERADOR sí lo elimina. El autor elimina su tema. **Consulta final en Oracle**: los conteos vuelven a 3, 5, 6, 7, 9. |
| 8:30 a 9:00 | GitHub | Repositorio, ramas por microservicio y commits. Cierre. |

## Frases útiles

- "El microservicio del foro no le pregunta nada al de usuarios: valida la firma del token con la misma clave."
- "Los permisos se revisan en la capa de servicio, no solo en el controlador: un USUARIO que llame directo a la API igual recibe 403."
- "Todos los errores salen en JSON con el código HTTP correcto: 400, 401, 403, 404 o 409."
- "Las claves se guardan con BCrypt; la API nunca las devuelve."
