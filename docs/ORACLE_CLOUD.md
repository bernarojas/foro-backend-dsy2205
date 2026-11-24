# Docker Desktop con la base en Oracle Cloud

Como se indicó en el curso, la solución se ejecuta en **Docker Desktop local**. La base de datos es
una **Oracle Cloud Autonomous Database**, a la que los microservicios se conectan con su wallet.

```
 Docker Desktop (este computador)                          Oracle Cloud
 ┌──────────────────────────────────────────────┐
 │ foro-frontend :8084 (nginx)                  │
 │    └─ /servicios/... ─┐                      │
 │ foro-ms-usuarios   :8081 ◄┤                   │
 │ foro-ms-foro       :8082 ◄┤ ── wallet (TLS) ──┼──► Autonomous Database · esquema FORO
 │ foro-ms-moderacion :8083 ◄┘                   │
 └──────────────────────────────────────────────┘
```

Se usa `docker-compose.oracle-cloud.yml`, que es igual a `docker-compose.yml` pero sin la base local.
Probado contra una Autonomous Database *Siempre gratis* (19c, región Santiago, con mTLS): los tres
microservicios conectan con el wallet y la colección de Postman pasa completa.

## 1. Crear la base en Oracle Cloud

1. En la consola de Oracle Cloud: **Oracle Database → Autonomous Database → Create** (tipo
   *Transaction Processing*, opción *Always Free*). Anotar el nombre de la base, por ejemplo `forodb`.
2. Abrir **Database Actions → SQL** como `ADMIN` y crear el usuario (es la variante que está comentada
   al final de `database/01_crear_usuario.sql`):

   ```sql
   CREATE USER FORO IDENTIFIED BY "Foro_Duoc_2026" QUOTA UNLIMITED ON DATA;
   GRANT CREATE SESSION, CREATE TABLE, CREATE SEQUENCE, CREATE VIEW TO FORO;
   ```

   Conviene usar una clave propia en vez de la de desarrollo; es la que después va en `.env`.
3. En la página de la base: **Conexión de base de datos → Descargar wallet**. Pide una contraseña para
   el wallet, que el proyecto no usa. Se descarga `Wallet_forodb.zip`.

Las tablas y los datos de prueba se cargan después, desde el computador (paso 2.3).

## 2. Preparar el proyecto

1. Descomprimir el wallet en la carpeta `wallet/` del proyecto (está en `.gitignore`: las
   credenciales no van al repositorio). En PowerShell:

   ```powershell
   Expand-Archive Wallet_forodb.zip -DestinationPath wallet
   ```

2. Crear el archivo `.env` a partir del ejemplo y completarlo:

   ```powershell
   Copy-Item .env.example .env
   notepad .env
   ```

   | Variable | Valor |
   |---|---|
   | `DB_SERVICIO` | el servicio del wallet terminado en `_tp`, por ejemplo `forodb_tp` (están en `wallet/tnsnames.ora`) |
   | `DB_USER` | `FORO` |
   | `DB_PASSWORD` | la clave del usuario `FORO` |
   | `JWT_SECRET` | una frase de 32 caracteres o más; es la misma para los tres microservicios |

3. Cargar las tablas y los datos de prueba en Oracle Cloud. El script usa el SQL*Plus de la imagen
   Docker de Oracle, el wallet y el `.env`, así que no hay que instalar nada. Desde Git Bash:

   ```bash
   bash database/cargar_en_oracle_cloud.sh
   ```

   Al final muestra los conteos: 3, 5, 6, 7, 9 y 2 registros. Se puede volver a ejecutar para dejar
   los datos en su estado inicial (por ejemplo, antes de grabar el video). También sirve pegar
   `database/02_script_foro.sql` en SQL Developer conectado como `FORO`.

## 3. Levantar

Si estaba corriendo la versión con la base local, primero bajarla:

```powershell
docker compose --profile apps down
docker compose -f docker-compose.oracle-cloud.yml up -d --build
docker compose -f docker-compose.oracle-cloud.yml ps
```

Los microservicios tardan entre 20 y 40 segundos en conectarse a Oracle Cloud la primera vez.

## 4. Comprobar

| Qué | Dónde |
|---|---|
| FrontEnd | http://localhost:8084 |
| Comunicación FrontEnd → BackEnd → Oracle | ingresar como `admin@foro.cl` y abrir **menú de la cuenta → Conexión con el BackEnd** |
| ms-usuarios | http://localhost:8081/api/roles |
| ms-foro | http://localhost:8082/api/categorias |
| ms-moderacion | http://localhost:8083/api/estado |
| Que usa Oracle Cloud | `docker exec foro-ms-usuarios printenv DB_URL` muestra `...@forodb_tp?TNS_ADMIN=/wallet` |

En Postman se ejecuta la colección completa sin cambios (apunta a `localhost`). Para ver que los datos
quedan en Oracle Cloud: en **Acciones de base de datos → SQL** (como `ADMIN`) elegir el esquema `FORO`
en el navegador de la izquierda, o consultar con el prefijo del esquema (`SELECT * FROM FORO.FORO_TEMA`)
mientras se ejecutan las solicitudes.

Para volver a la base local: `docker compose -f docker-compose.oracle-cloud.yml down` y
`docker compose --profile apps up -d`.

## Si algo falla

| Síntoma | Causa habitual |
|---|---|
| `ORA-12154` o "could not resolve the connect identifier" | `DB_SERVICIO` no coincide con un nombre de `wallet/tnsnames.ora`, o el wallet no quedó en `wallet/` (los archivos deben estar directamente ahí, no en una subcarpeta) |
| `NoClassDefFoundError: oracle/security/crypto/core/AuthenticationException` | faltan las librerías del wallet: los `pom.xml` deben incluir `oraclepki`, `osdt_core` y `osdt_cert` (ya están en los tres microservicios y en el arquetipo) |
| `ORA-01017` | usuario o clave de la base incorrectos en `.env` |
| `ORA-28000` | la cuenta `FORO` quedó bloqueada en Oracle Cloud (desbloquearla como `ADMIN`) |
| El microservicio se reinicia en bucle | ver el motivo con `docker logs foro-ms-usuarios` |
| "Sin respuesta" en la pantalla Conexión con el BackEnd | el microservicio todavía está arrancando o se cayó: `docker compose -f docker-compose.oracle-cloud.yml ps` |
| El token de un microservicio no sirve en otro | `JWT_SECRET` distinto entre contenedores (deben compartir el mismo `.env`) |
| La base queda "Aprovisionando" en un porcentaje bajo por mucho rato | la región no tiene capacidad gratuita en ese momento: crearla de nuevo (en nuestro caso funcionó con la versión 19c) o intentarlo más tarde |
| La base no responde después de unos días | las bases *Always Free* se detienen si no se usan: iniciarla en la consola de Oracle Cloud |

## Opcional: un servidor con dirección pública

El mismo archivo sirve en cualquier servidor Linux con Docker (por ejemplo una instancia EC2):
clonar el repositorio, copiar `wallet/` y `.env`, abrir los puertos 8081 a 8084 y ejecutar el mismo
`docker compose -f docker-compose.oracle-cloud.yml up -d --build`. Con `FRONTEND_PORT=80` en `.env`
el FrontEnd queda en `http://IP_PUBLICA/`.
