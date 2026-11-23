import { Injectable, computed, inject } from '@angular/core';
import { COLORES_AVATAR } from '../data/datos-iniciales';
import { ErrorForo, EstadoUsuario, NombreRol, Rol, Usuario } from '../models/modelos';
import {
  ComentarioRepository,
  RolRepository,
  TemaRepository,
  UsuarioRepository,
} from '../repositories/repositorios';
import { AuthService } from './auth.service';

export interface UsuarioConRol extends Usuario {
  rol: NombreRol;
  temas: number;
  comentarios: number;
}

export interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
  /** Solo lo puede indicar un administrador; el registro público siempre crea un USUARIO. */
  rolId?: number;
}

export interface DatosPerfil {
  nombre: string;
  email: string;
  biografia: string;
  color: string;
}

/**
 * Control de usuarios (crear, modificar, eliminar) y sus reglas.
 * Equivale a /api/usuarios y /api/roles del microservicio de usuarios.
 */
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly usuarios = inject(UsuarioRepository);
  private readonly roles = inject(RolRepository);
  private readonly temas = inject(TemaRepository);
  private readonly comentarios = inject(ComentarioRepository);
  private readonly auth = inject(AuthService);

  readonly listaRoles = this.roles.items;

  /** Todos los usuarios con su rol y cuánto han publicado. */
  readonly listado = computed<UsuarioConRol[]>(() => {
    const roles = this.roles.items();
    const temas = this.temas.items();
    const comentarios = this.comentarios.items();
    return this.usuarios.items().map((usuario) => ({
      ...usuario,
      rol: roles.find((r) => r.id === usuario.rolId)?.nombre ?? 'USUARIO',
      temas: temas.filter((t) => t.autorId === usuario.id).length,
      comentarios: comentarios.filter((c) => c.autorId === usuario.id).length,
    }));
  });

  /** Cuántos usuarios hay por rol (activos y bloqueados). */
  readonly resumenPorRol = computed(() =>
    this.roles.items().map((rol) => {
      const delRol = this.usuarios.items().filter((u) => u.rolId === rol.id);
      return {
        rol,
        total: delRol.length,
        activos: delRol.filter((u) => u.estado === 'ACTIVO').length,
        bloqueados: delRol.filter((u) => u.estado === 'BLOQUEADO').length,
      };
    }),
  );

  porId(id: number): UsuarioConRol | undefined {
    return this.listado().find((u) => u.id === id);
  }

  rolDe(usuario: Usuario): Rol | undefined {
    return this.roles.porId(usuario.rolId);
  }

  // ---------------------------------------------------------------- Crear

  /** Registro público, o alta hecha por un administrador (que sí puede elegir el rol). */
  registrar(datos: DatosRegistro): Usuario {
    const email = datos.email.trim().toLowerCase();
    if (this.usuarios.porEmail(email)) {
      throw new ErrorForo('Ya existe una cuenta con ese correo.');
    }
    let rolId = this.idDeRol('USUARIO');
    if (datos.rolId !== undefined && datos.rolId !== rolId) {
      if (!this.auth.esAdministrador()) {
        throw new ErrorForo('Solo un administrador puede crear cuentas con otro rol.');
      }
      if (!this.roles.porId(datos.rolId)) throw new ErrorForo('El rol indicado no existe.');
      rolId = datos.rolId;
    }
    const cantidad = this.usuarios.items().length;
    return this.usuarios.crear({
      nombre: datos.nombre.trim(),
      email,
      password: datos.password,
      rolId,
      estado: 'ACTIVO',
      fechaRegistro: new Date().toISOString(),
      biografia: '',
      color: COLORES_AVATAR[cantidad % COLORES_AVATAR.length],
    });
  }

  // ---------------------------------------------------------------- Modificar

  /** El usuario de la sesión modifica sus propios datos. */
  actualizarPerfil(datos: DatosPerfil): Usuario {
    const yo = this.auth.exigirSesion();
    const email = datos.email.trim().toLowerCase();
    const otro = this.usuarios.porEmail(email);
    if (otro && otro.id !== yo.id) {
      throw new ErrorForo('Ese correo ya lo usa otra cuenta.');
    }
    const nombre = datos.nombre.trim();
    const actualizado = this.usuarios.actualizar(yo.id, {
      nombre,
      email,
      biografia: datos.biografia.trim(),
      color: datos.color,
    });
    if (nombre !== yo.nombre) {
      // El nombre del autor va copiado en cada publicación (igual que en Oracle): se actualiza también ahí.
      this.temas.actualizarDonde((t) => t.autorId === yo.id, { autorNombre: nombre });
      this.comentarios.actualizarDonde((c) => c.autorId === yo.id, { autorNombre: nombre });
    }
    return actualizado ?? yo;
  }

  cambiarClave(actual: string, nueva: string): void {
    const yo = this.auth.exigirSesion();
    if (yo.password !== actual) throw new ErrorForo('La contraseña actual no es correcta.');
    if (actual === nueva) throw new ErrorForo('La contraseña nueva debe ser distinta de la actual.');
    this.usuarios.actualizar(yo.id, { password: nueva });
  }

  /** Solo ADMINISTRADOR. */
  cambiarRol(idUsuario: number, rolId: number): void {
    this.exigirAdministrador();
    const usuario = this.exigirUsuario(idUsuario);
    if (!this.roles.porId(rolId)) throw new ErrorForo('El rol indicado no existe.');
    if (usuario.rolId === rolId) return;
    if (this.esUltimoAdministradorActivo(usuario)) {
      throw new ErrorForo('Debe quedar al menos un administrador activo.');
    }
    this.usuarios.actualizar(idUsuario, { rolId });
  }

  /** Solo ADMINISTRADOR. Una cuenta bloqueada no puede iniciar sesión. */
  cambiarEstado(idUsuario: number, estado: EstadoUsuario): void {
    const yo = this.exigirAdministrador();
    const usuario = this.exigirUsuario(idUsuario);
    if (usuario.estado === estado) return;
    if (estado === 'BLOQUEADO') {
      if (usuario.id === yo.id) throw new ErrorForo('No puedes bloquear tu propia cuenta.');
      if (this.esUltimoAdministradorActivo(usuario)) {
        throw new ErrorForo('Debe quedar al menos un administrador activo.');
      }
    }
    this.usuarios.actualizar(idUsuario, { estado });
  }

  // ---------------------------------------------------------------- Eliminar

  /** El usuario elimina su propia cuenta confirmando su contraseña. */
  eliminarMiCuenta(password: string): void {
    const yo = this.auth.exigirSesion();
    if (yo.password !== password) throw new ErrorForo('La contraseña no es correcta.');
    if (this.esUltimoAdministradorActivo(yo)) {
      throw new ErrorForo('Eres el único administrador activo: nombra a otro antes de eliminar tu cuenta.');
    }
    this.usuarios.eliminar(yo.id);
    this.auth.cerrarSesion();
  }

  /** Solo ADMINISTRADOR. Las publicaciones del usuario quedan en el foro con su nombre. */
  eliminar(idUsuario: number): void {
    const yo = this.exigirAdministrador();
    const usuario = this.exigirUsuario(idUsuario);
    if (usuario.id === yo.id) {
      throw new ErrorForo('Para eliminar tu propia cuenta usa la pantalla "Mi perfil".');
    }
    if (this.esUltimoAdministradorActivo(usuario)) {
      throw new ErrorForo('Debe quedar al menos un administrador activo.');
    }
    this.usuarios.eliminar(idUsuario);
  }

  // ---------------------------------------------------------------- Reglas

  private idDeRol(nombre: NombreRol): number {
    const rol = this.roles.items().find((r) => r.nombre === nombre);
    if (!rol) throw new ErrorForo(`No existe el rol ${nombre}.`);
    return rol.id;
  }

  private exigirAdministrador(): Usuario {
    const yo = this.auth.exigirSesion();
    if (!this.auth.esAdministrador()) {
      throw new ErrorForo('Solo un administrador puede hacer esto.');
    }
    return yo;
  }

  private exigirUsuario(id: number): Usuario {
    const usuario = this.usuarios.porId(id);
    if (!usuario) throw new ErrorForo('El usuario no existe.');
    return usuario;
  }

  private esUltimoAdministradorActivo(usuario: Usuario): boolean {
    const idAdmin = this.idDeRol('ADMINISTRADOR');
    if (usuario.rolId !== idAdmin || usuario.estado !== 'ACTIVO') return false;
    return this.usuarios.items().filter((u) => u.rolId === idAdmin && u.estado === 'ACTIVO').length === 1;
  }
}
