import { Routes } from '@angular/router';
import { conRol, conSesion, soloInvitados } from './core/guards/guardas';

/**
 * Rutas de la aplicación. Cada página se carga solo cuando se visita (lazy loading)
 * y las guardas deciden quién puede entrar según la sesión y el rol.
 */
export const routes: Routes = [
  // --- Públicas: se pueden ver sin iniciar sesión
  { path: '', title: 'Tertulia · Foro', loadComponent: () => import('./features/foro/inicio/inicio').then((m) => m.Inicio) },
  { path: 'categorias/:id', title: 'Categoría · Tertulia', loadComponent: () => import('./features/foro/categoria/categoria').then((m) => m.CategoriaPagina) },
  { path: 'buscar', title: 'Buscar temas · Tertulia', loadComponent: () => import('./features/foro/buscar/buscar').then((m) => m.Buscar) },
  { path: 'normas', title: 'Normas del foro · Tertulia', loadComponent: () => import('./features/foro/normas/normas').then((m) => m.Normas) },

  // --- Cuenta
  { path: 'ingresar', title: 'Ingresar · Tertulia', canActivate: [soloInvitados], loadComponent: () => import('./features/auth/ingresar/ingresar').then((m) => m.Ingresar) },
  { path: 'registro', title: 'Crear cuenta · Tertulia', canActivate: [soloInvitados], loadComponent: () => import('./features/auth/registro/registro').then((m) => m.Registro) },
  { path: 'recuperar', title: 'Recuperar contraseña · Tertulia', canActivate: [soloInvitados], loadComponent: () => import('./features/auth/recuperar/recuperar').then((m) => m.Recuperar) },
  { path: 'perfil', title: 'Mi perfil · Tertulia', canActivate: [conSesion], loadComponent: () => import('./features/cuenta/perfil/perfil').then((m) => m.Perfil) },
  { path: 'mis-publicaciones', title: 'Mis publicaciones · Tertulia', canActivate: [conSesion], loadComponent: () => import('./features/cuenta/mis-publicaciones/mis-publicaciones').then((m) => m.MisPublicaciones) },

  // --- Temas (publicar y modificar piden sesión)
  { path: 'temas/nuevo', title: 'Nuevo tema · Tertulia', canActivate: [conSesion], loadComponent: () => import('./features/foro/tema-form/tema-form').then((m) => m.TemaForm) },
  { path: 'temas/:id/editar', title: 'Modificar tema · Tertulia', canActivate: [conSesion], loadComponent: () => import('./features/foro/tema-form/tema-form').then((m) => m.TemaForm) },
  { path: 'temas/:id', title: 'Tema · Tertulia', loadComponent: () => import('./features/foro/tema-detalle/tema-detalle').then((m) => m.TemaDetalle) },

  // --- Moderación: MODERADOR y ADMINISTRADOR
  { path: 'moderacion', title: 'Moderación · Tertulia', canActivate: [conRol('MODERADOR', 'ADMINISTRADOR')], loadComponent: () => import('./features/moderacion/moderacion').then((m) => m.Moderacion) },

  // --- Administración: solo ADMINISTRADOR
  { path: 'admin/usuarios', title: 'Usuarios · Tertulia', canActivate: [conRol('ADMINISTRADOR')], loadComponent: () => import('./features/admin/usuarios/usuarios').then((m) => m.AdminUsuarios) },
  { path: 'admin/servicios', title: 'Conexión con el BackEnd · Tertulia', canActivate: [conRol('ADMINISTRADOR')], loadComponent: () => import('./features/admin/servicios/servicios').then((m) => m.AdminServicios) },
  { path: 'admin/categorias', title: 'Categorías · Tertulia', canActivate: [conRol('ADMINISTRADOR')], loadComponent: () => import('./features/admin/categorias/categorias').then((m) => m.AdminCategorias) },

  { path: '**', title: 'Página no encontrada · Tertulia', loadComponent: () => import('./features/no-encontrada/no-encontrada').then((m) => m.NoEncontrada) },
];
