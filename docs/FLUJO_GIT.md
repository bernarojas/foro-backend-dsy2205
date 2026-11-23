# Organización del trabajo en git

La pauta evalúa el uso de git y de herramientas colaborativas (criterio 1). Este es el flujo usado
en el repositorio.

## Ramas

| Rama | Para qué |
|---|---|
| `main` | Lo entregable: siempre compila y pasa la colección de Postman |
| `develop` | Integración de las ramas de trabajo |

Semana 2 (BackEnd, etiqueta `v1.0-semana2`):

| Rama | Para qué |
|---|---|
| `feature/base-de-datos` | Script de Oracle y Docker Compose |
| `feature/ms-usuarios` | Microservicio de usuarios, roles e inicio de sesión |
| `feature/ms-foro` | Microservicio del foro |
| `feature/postman-docs` | Colección de Postman, README y guion del video |

Semana 5 (FrontEnd, arquetipo, moderación y Docker, etiquetas `v2.0-semana5` y `v2.1-semana5`):

| Rama | Para qué |
|---|---|
| `feature/arquetipo` | Arquetipo Maven de los microservicios |
| `feature/ms-moderacion` | Microservicio de moderación generado con el arquetipo, su tabla y sus pruebas de Postman |
| `feature/frontend-angular` | Aplicación Angular: pantallas, validaciones, roles y datos en arreglos |
| `feature/docker-nube` | Docker del FrontEnd, compose con Oracle Cloud y documentación |
| `feature/conexion-backend` | Pantalla "Conexión con el BackEnd" (FrontEnd → microservicios → Oracle por la red de Docker) y ajuste a Docker Desktop local con Oracle Cloud |

Cada rama `feature/*` sale de `develop` y vuelve a ella con un *merge* (o un Pull Request en GitHub).
Al terminar, `develop` se une a `main` y se etiqueta la entrega.

## Mensajes de commit

Formato corto en español, con un prefijo que dice el tipo de cambio:

```
feat(frontend): panel de moderación con baneo, restauración e historial
feat(ms-moderacion): estrategias de moderación para temas y comentarios
fix(ms-usuarios): un usuario bloqueado ya no puede usar su token
docs: guion del video de presentación
chore: Docker Compose con Oracle Cloud
```

## Herramientas colaborativas

- **GitHub**: repositorio, Pull Requests de cada `feature/*` hacia `develop`.
- **GitHub Projects** (tablero Kanban: Por hacer / En curso / Hecho) con una tarjeta por requisito del caso:
  pantallas del FrontEnd, validaciones, roles, arquetipo, microservicio de moderación, Docker, Oracle
  Cloud, colección Postman, video.
- **Issues** enlazados a cada tarjeta y cerrados desde el Pull Request (`Closes #3`).

## Subir los cambios a GitHub

Repositorio: https://github.com/bernarojas/foro-backend-dsy2205

```bash
git push origin main develop
git push origin feature/arquetipo feature/ms-moderacion feature/frontend-angular feature/docker-nube feature/conexion-backend
git push origin --tags
```

Después, pegar el enlace del repositorio en el AVA junto con el .zip y el enlace del video.
