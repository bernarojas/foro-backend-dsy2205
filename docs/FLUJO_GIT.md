# Organización del trabajo en git

La pauta evalúa el uso de git y de herramientas colaborativas (criterio 1, 10 puntos). Este es el
flujo usado en el repositorio.

## Ramas

| Rama | Para qué |
|---|---|
| `main` | Lo entregable: siempre compila y pasa la colección de Postman |
| `develop` | Integración de las ramas de trabajo |
| `feature/base-de-datos` | Script de Oracle y Docker Compose |
| `feature/ms-usuarios` | Microservicio de usuarios, roles e inicio de sesión |
| `feature/ms-foro` | Microservicio del foro |
| `feature/postman-docs` | Colección de Postman, README y guion del video |

Cada rama `feature/*` sale de `develop` y vuelve a ella con un *merge* (o un Pull Request en GitHub).
Al terminar, `develop` se une a `main` y se etiqueta la entrega (`v1.0-semana2`).

## Mensajes de commit

Formato corto en español, con un prefijo que dice el tipo de cambio:

```
feat(ms-foro): búsqueda de temas por texto, categoría y autor
fix(ms-usuarios): un usuario bloqueado ya no puede usar su token
docs: guion del video de presentación
chore: Docker Compose con Oracle Free
```

## Herramientas colaborativas

- **GitHub**: repositorio, Pull Requests de cada `feature/*` hacia `develop`.
- **GitHub Projects** (tablero Kanban: Por hacer / En curso / Hecho) con una tarjeta por requisito del caso:
  CRUD de usuarios, inicio de sesión, roles, búsqueda de temas, publicación, comentarios,
  script Oracle, colección Postman, video.
- **Issues** enlazados a cada tarjeta y cerrados desde el Pull Request (`Closes #3`).

## Subir el repositorio a GitHub

1. Crear un repositorio vacío en GitHub (sin README), por ejemplo `foro-backend-dsy2205`.
2. En la carpeta del proyecto:

```bash
git remote add origin https://github.com/<tu-usuario>/foro-backend-dsy2205.git
git push -u origin main
git push origin develop feature/base-de-datos feature/ms-usuarios feature/ms-foro feature/postman-docs
git push origin --tags
```

3. Pegar el enlace del repositorio en el AVA junto con el .zip y el enlace del video.
