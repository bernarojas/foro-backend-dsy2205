#!/bin/bash
# Lo ejecuta la imagen gvenzl/oracle-free solo la PRIMERA vez que crea la base.
# El usuario FORO ya lo creó la imagen (APP_USER); aquí se crean sus tablas y datos.
set -e
# Para que las tildes y la ñ del script lleguen bien a la base
export NLS_LANG=AMERICAN_AMERICA.AL32UTF8
echo "Creando tablas del foro..."
sqlplus -s "${APP_USER}/${APP_USER_PASSWORD}@//localhost:1521/FREEPDB1" @/scripts/02_script_foro.sql <<SQL
EXIT
SQL
