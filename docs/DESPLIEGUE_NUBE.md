# Despliegue en la nube: Docker + Oracle Cloud

Qué queda al terminar:

- El **FrontEnd** y los **tres microservicios** corriendo en contenedores Docker en un servidor con
  dirección pública.
- Los microservicios conectados a una base **Oracle Cloud** (Autonomous Database) mediante su wallet.

```
 Internet ──► servidor con Docker (IP pública)
              ├── foro-frontend       :80
              ├── foro-ms-usuarios    :8081 ─┐
              ├── foro-ms-foro        :8082 ─┼──► Oracle Cloud · Autonomous Database (wallet)
              └── foro-ms-moderacion  :8083 ─┘
```

Se usa `docker-compose.cloud.yml`, que es igual al de desarrollo pero sin la base local.

## 1. Base de datos en Oracle Cloud

1. En la consola de Oracle Cloud: **Oracle Database → Autonomous Database → Create** (tipo
   *Transaction Processing*, opción *Always Free*). Anotar el nombre de la base, por ejemplo `forodb`.
2. Abrir **Database Actions → SQL** como `ADMIN` y crear el usuario (es la variante que está comentada
   al final de `database/01_crear_usuario.sql`):

   ```sql
   CREATE USER FORO IDENTIFIED BY "Foro_Duoc_2026" QUOTA UNLIMITED ON DATA;
   GRANT CREATE SESSION, CREATE TABLE, CREATE SEQUENCE, CREATE VIEW TO FORO;
   ```

   Conviene usar una clave propia en vez de la de desarrollo; es la que después va en `.env`.
3. Conectarse como `FORO` (con SQL Developer y el wallet, o habilitando el usuario en Database
   Actions) y ejecutar `database/02_script_foro.sql`. Al final muestra los conteos:
   3, 5, 6, 7, 9 y 2 registros.
4. En la página de la base: **Database connection → Download wallet**. Se descarga
   `Wallet_forodb.zip`.

## 2. Servidor con Docker

Sirve cualquier servidor Linux con dirección pública (por ejemplo una instancia EC2 de AWS con
Ubuntu, 2 GB de RAM o más).

1. Abrir en el firewall o *security group* los puertos **80, 8081, 8082 y 8083** (TCP).
2. Instalar Docker:

   ```bash
   curl -fsSL https://get.docker.com | sudo sh
   sudo usermod -aG docker $USER      # y volver a entrar por SSH
   ```

3. Traer el proyecto:

   ```bash
   git clone https://github.com/bernarojas/foro-backend-dsy2205.git
   cd foro-backend-dsy2205
   ```

4. Copiar el wallet al servidor y descomprimirlo en la carpeta `wallet/` del proyecto
   (esa carpeta está en `.gitignore`: las credenciales no van al repositorio):

   ```bash
   # desde el computador local
   scp Wallet_forodb.zip usuario@IP_PUBLICA:~/foro-backend-dsy2205/

   # en el servidor
   sudo apt-get install -y unzip
   unzip Wallet_forodb.zip -d wallet
   ```

5. Crear el archivo `.env` a partir del ejemplo y completarlo:

   ```bash
   cp .env.example .env
   nano .env
   ```

   | Variable | Valor |
   |---|---|
   | `DB_SERVICIO` | el servicio del wallet, por ejemplo `forodb_high` (están en `wallet/tnsnames.ora`) |
   | `DB_USER` | `FORO` |
   | `DB_PASSWORD` | la clave del usuario `FORO` |
   | `JWT_SECRET` | una frase de 32 caracteres o más; es la misma para los tres microservicios |

6. Construir y levantar:

   ```bash
   docker compose -f docker-compose.cloud.yml up -d --build
   docker compose -f docker-compose.cloud.yml ps
   ```

   La primera construcción tarda varios minutos (descarga Maven y Node).

## 3. Comprobar

| Qué | Dirección |
|---|---|
| FrontEnd | `http://IP_PUBLICA/` |
| ms-usuarios | `http://IP_PUBLICA:8081/api/roles` |
| ms-foro | `http://IP_PUBLICA:8082/api/categorias` |
| ms-moderacion | `http://IP_PUBLICA:8083/api/estado` |

En Postman, cambiar las variables de la colección `baseUsuarios`, `baseForo` y `baseModeracion` por
`http://IP_PUBLICA:8081/api`, `:8082/api` y `:8083/api`, y ejecutar la colección completa.

Para ver que los datos quedan en Oracle Cloud: consultar las tablas desde **Database Actions → SQL**
mientras se ejecutan las solicitudes de Postman.

## Si algo falla

| Síntoma | Causa habitual |
|---|---|
| `ORA-12154` o "could not resolve the connect identifier" | `DB_SERVICIO` no coincide con un nombre de `wallet/tnsnames.ora`, o el wallet no quedó en `wallet/` |
| `ORA-01017` | usuario o clave de la base incorrectos en `.env` |
| El microservicio se reinicia en bucle | ver el motivo con `docker logs foro-ms-usuarios` |
| La página abre pero la API no responde desde fuera | falta abrir los puertos 8081 a 8083 en el firewall |
| El token de un microservicio no sirve en otro | `JWT_SECRET` distinto entre contenedores (deben compartir el mismo `.env`) |

Actualizar después de un cambio: `git pull && docker compose -f docker-compose.cloud.yml up -d --build`.
