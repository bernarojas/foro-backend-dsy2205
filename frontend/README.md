# Tertulia · FrontEnd

Aplicación Angular del Sistema de Foros en Línea (DSY2205). La descripción completa, las pantallas,
los roles y los patrones están en el [README principal](../README.md).

## Ejecutar

Con Docker, desde la raíz del repositorio (queda en http://localhost:8084):

```bash
docker compose --profile apps up -d --build frontend
```

En modo desarrollo (Node 22 o superior; queda en http://localhost:4200):

```bash
npm install
npm start
```

Compilar para producción: `npm run build` (deja los archivos en `dist/foro-frontend/browser`).

## Conexión con el BackEnd

La pantalla `/admin/servicios` (solo administrador) llama a los microservicios en
`/servicios/usuarios`, `/servicios/foro` y `/servicios/moderacion`. En Docker los reenvía nginx a
cada contenedor (`nginx.conf`); con `npm start` lo hace `proxy.conf.json` hacia `localhost:8081`,
`8082` y `8083`. El resto de la aplicación trabaja con arreglos y funciona aunque el BackEnd esté abajo.

## Cuentas de prueba

Todas con la clave `Duoc2026!`: `admin@foro.cl` (administrador), `moderador@foro.cl` (moderador) y
`diego@foro.cl` (usuario). La pantalla "Ingresar" tiene botones que las rellenan.

## Organización

```
src/
├── styles.css           # identidad visual y ajustes por tamaño de pantalla
├── index.html
└── app/
    ├── app.routes.ts    # rutas con carga diferida y guardas por sesión y rol
    ├── core/
    │   ├── models/          # modelos
    │   ├── data/            # datos iniciales (arreglos)
    │   ├── repositories/    # patrón Repository sobre los arreglos
    │   ├── services/        # reglas de negocio y permisos
    │   ├── guards/          # acceso a las rutas
    │   └── validators/      # validaciones de formularios y sus mensajes
    ├── shared/              # barra de navegación, avisos, diálogo, avatar, lista de temas
    └── features/            # pantallas: auth, cuenta, foro, moderacion, admin
public/
├── logo.svg
└── imagenes/            # ilustraciones propias
```
