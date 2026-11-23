import { Injectable, computed, inject, signal } from '@angular/core';
import { ErrorForo, NombreRol, Usuario } from '../models/modelos';
import { RolRepository, UsuarioRepository } from '../repositories/repositorios';

const CLAVE_SESION = 'tertulia.v1.sesion';

/**
 * Sesión del usuario: inicio y cierre de sesión, y recuperación de la contraseña.
 * Equivale a /api/auth del microservicio de usuarios.
 *
 * PATRÓN OBSERVER: `usuario` y `rol` son signals; la barra de navegación, las guardas
 * y las pantallas que los leen se actualizan solas cuando la sesión cambia.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usuarios = inject(UsuarioRepository);
  private readonly roles = inject(RolRepository);

  private readonly idSesion = signal<number | null>(leerSesion());

  /** Códigos de recuperación vigentes (correo -> código). Simula el correo que enviaría el BackEnd. */
  private readonly codigos = new Map<string, string>();

  /** El usuario con sesión iniciada, o null. Si un administrador bloquea o elimina la cuenta, la sesión se cae. */
  readonly usuario = computed<Usuario | null>(() => {
    const id = this.idSesion();
    if (id === null) return null;
    const usuario = this.usuarios.items().find((u) => u.id === id);
    return usuario && usuario.estado === 'ACTIVO' ? usuario : null;
  });

  readonly rol = computed<NombreRol | null>(() => {
    const usuario = this.usuario();
    return usuario ? (this.roles.items().find((r) => r.id === usuario.rolId)?.nombre ?? null) : null;
  });

  readonly haySesion = computed(() => this.usuario() !== null);
  readonly esAdministrador = computed(() => this.rol() === 'ADMINISTRADOR');
  /** Moderadores y administradores pueden banear, restaurar y eliminar publicaciones de otros. */
  readonly puedeModerar = computed(() => this.rol() === 'ADMINISTRADOR' || this.rol() === 'MODERADOR');

  iniciarSesion(email: string, password: string): Usuario {
    const usuario = this.usuarios.porEmail(email);
    if (!usuario || usuario.password !== password) {
      throw new ErrorForo('El correo o la contraseña no son correctos.');
    }
    if (usuario.estado === 'BLOQUEADO') {
      throw new ErrorForo('Tu cuenta está bloqueada. Escribe a un administrador para revisarla.');
    }
    this.abrirSesion(usuario.id);
    return usuario;
  }

  cerrarSesion(): void {
    this.idSesion.set(null);
    try {
      localStorage.removeItem(CLAVE_SESION);
    } catch {
      // sin almacenamiento: nada que borrar
    }
  }

  /** Deja la sesión abierta para un usuario recién registrado. */
  abrirSesion(idUsuario: number): void {
    this.idSesion.set(idUsuario);
    try {
      localStorage.setItem(CLAVE_SESION, String(idUsuario));
    } catch {
      // sin almacenamiento: la sesión dura hasta recargar
    }
  }

  /** El usuario de la sesión, o un error si no hay sesión. Lo usan los servicios antes de cada acción. */
  exigirSesion(): Usuario {
    const usuario = this.usuario();
    if (!usuario) throw new ErrorForo('Debes iniciar sesión para hacer esto.');
    return usuario;
  }

  // ---------------------------------------------------------------- Recuperar contraseña

  /**
   * Paso 1: genera un código de 6 dígitos para el correo. En producción llegaría por correo;
   * aquí se devuelve para mostrarlo en pantalla como "correo simulado".
   */
  solicitarCodigo(email: string): string {
    const usuario = this.usuarios.porEmail(email);
    if (!usuario) throw new ErrorForo('No hay ninguna cuenta registrada con ese correo.');
    if (usuario.estado === 'BLOQUEADO') {
      throw new ErrorForo('Esa cuenta está bloqueada: no se puede recuperar la contraseña.');
    }
    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    this.codigos.set(usuario.email.toLowerCase(), codigo);
    return codigo;
  }

  /** Paso 2: comprueba el código. */
  verificarCodigo(email: string, codigo: string): void {
    if (this.codigos.get(email.trim().toLowerCase()) !== codigo.trim()) {
      throw new ErrorForo('El código no es correcto. Revísalo o pide uno nuevo.');
    }
  }

  /** Paso 3: guarda la contraseña nueva. */
  restablecerClave(email: string, codigo: string, nueva: string): void {
    this.verificarCodigo(email, codigo);
    const usuario = this.usuarios.porEmail(email);
    if (!usuario) throw new ErrorForo('No hay ninguna cuenta registrada con ese correo.');
    if (usuario.password === nueva) {
      throw new ErrorForo('La contraseña nueva debe ser distinta de la anterior.');
    }
    this.usuarios.actualizar(usuario.id, { password: nueva });
    this.codigos.delete(usuario.email.toLowerCase());
  }
}

function leerSesion(): number | null {
  try {
    const id = Number(localStorage.getItem(CLAVE_SESION));
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}
