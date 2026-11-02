-- =====================================================================
--  Sistema de Foros en Línea - Desarrollo Full Stack III (DSY2205)
--  Paso 1: crear el usuario (esquema) de la aplicación.
--
--  Ejecutar UNA vez conectado como SYSTEM (Oracle local / Docker) o
--  como ADMIN (Oracle Cloud - Autonomous Database).
--  En Oracle Free / XE conectarse a la base pluggable (FREEPDB1 / XEPDB1),
--  no a la raíz del contenedor.
-- =====================================================================

CREATE USER FORO IDENTIFIED BY "Foro_Duoc_2026"
  DEFAULT TABLESPACE USERS
  QUOTA UNLIMITED ON USERS;

GRANT CREATE SESSION, CREATE TABLE, CREATE SEQUENCE, CREATE VIEW TO FORO;

-- En Oracle Cloud (Autonomous) el tablespace se llama DATA:
--   CREATE USER FORO IDENTIFIED BY "Foro_Duoc_2026" QUOTA UNLIMITED ON DATA;
--   GRANT CREATE SESSION, CREATE TABLE, CREATE SEQUENCE, CREATE VIEW TO FORO;
