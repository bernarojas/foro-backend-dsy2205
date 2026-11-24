#!/usr/bin/env bash
# =====================================================================
#  Carga database/02_script_foro.sql en la base de Oracle Cloud.
#
#  Usa el SQL*Plus de la imagen Docker de Oracle (no hay que instalar nada)
#  y toma la conexión del wallet (carpeta wallet/) y del archivo .env:
#  DB_SERVICIO, DB_USER y DB_PASSWORD.
#
#  Desde la raíz del repositorio (Git Bash, Linux o macOS):
#     bash database/cargar_en_oracle_cloud.sh
#
#  El script borra y vuelve a crear las tablas: deja los datos de prueba
#  en su estado inicial. Antes hay que crear el usuario FORO como ADMIN
#  (ver docs/ORACLE_CLOUD.md).
# =====================================================================
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
cd "$RAIZ"

[ -f .env ] || { echo "Falta el archivo .env (copiar .env.example y completarlo)"; exit 1; }
[ -f wallet/tnsnames.ora ] || { echo "Falta el wallet en la carpeta wallet/"; exit 1; }

# Lee solo las tres variables necesarias del .env, sin ejecutar el archivo.
leer() { grep -E "^$1=" .env | tail -1 | cut -d= -f2- | tr -d '\r'; }
DB_SERVICIO="$(leer DB_SERVICIO)"
DB_USER="$(leer DB_USER)"
DB_PASSWORD="$(leer DB_PASSWORD)"
[ -n "$DB_SERVICIO" ] && [ -n "$DB_USER" ] && [ -n "$DB_PASSWORD" ] || {
  echo "Completa DB_SERVICIO, DB_USER y DB_PASSWORD en .env"; exit 1; }

# Rutas que entiende Docker también desde Git Bash en Windows.
if command -v cygpath >/dev/null 2>&1; then
  WALLET="$(cygpath -m "$RAIZ/wallet")"
  SCRIPTS="$(cygpath -m "$RAIZ/database")"
else
  WALLET="$RAIZ/wallet"
  SCRIPTS="$RAIZ/database"
fi

echo "Cargando 02_script_foro.sql en $DB_SERVICIO como $DB_USER..."

# La clave viaja como variable de entorno al contenedor, no en la línea de comandos.
MSYS_NO_PATHCONV=1 docker run --rm -i --entrypoint bash \
  -e DB_SERVICIO="$DB_SERVICIO" -e DB_USER="$DB_USER" -e DB_PASSWORD="$DB_PASSWORD" \
  -e NLS_LANG=AMERICAN_AMERICA.AL32UTF8 \
  -v "$WALLET:/wallet:ro" -v "$SCRIPTS:/scripts:ro" \
  gvenzl/oracle-free:23-slim-faststart -c '
    # El sqlnet.ora del wallet apunta a "?/network/admin": se usa una copia que apunta a la carpeta real.
    cp -r /wallet /tmp/wallet
    sed -i "s#?/network/admin#/tmp/wallet#" /tmp/wallet/sqlnet.ora
    export TNS_ADMIN=/tmp/wallet
    printf "WHENEVER SQLERROR EXIT FAILURE\nCONNECT %s/\"%s\"@%s\nSET FEEDBACK OFF\n@/scripts/02_script_foro.sql\nEXIT\n" \
      "$DB_USER" "$DB_PASSWORD" "$DB_SERVICIO" | sqlplus -L -s /nolog
  '

echo "Listo: tablas y datos de prueba cargados en Oracle Cloud."
