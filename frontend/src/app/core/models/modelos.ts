/**
 * Modelos del foro. Tienen los mismos campos que las tablas de Oracle
 * (FORO_ROL, FORO_USUARIO, FORO_CATEGORIA, FORO_TEMA, FORO_COMENTARIO, FORO_MODERACION)
 * para que más adelante el FrontEnd pueda conectarse a los microservicios sin cambiar las pantallas.
 */

export type NombreRol = 'ADMINISTRADOR' | 'MODERADOR' | 'USUARIO';
export type EstadoUsuario = 'ACTIVO' | 'BLOQUEADO';
export type EstadoPublicacion = 'PUBLICADO' | 'BANEADO';
export type TipoPublicacion = 'TEMA' | 'COMENTARIO';
export type AccionModerar = 'BANEAR' | 'RESTAURAR';

export interface Rol {
  id: number;
  nombre: NombreRol;
  descripcion: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  /** En esta entrega los datos viven en arreglos del navegador; en el BackEnd la clave se guarda con BCrypt. */
  password: string;
  rolId: number;
  estado: EstadoUsuario;
  fechaRegistro: string;
  biografia: string;
  /** Color del avatar con las iniciales. */
  color: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  /** Clase de Bootstrap Icons, por ejemplo "bi-controller". */
  icono: string;
  color: string;
}

export interface Tema {
  id: number;
  categoriaId: number;
  autorId: number;
  autorNombre: string;
  titulo: string;
  contenido: string;
  estado: EstadoPublicacion;
  fechaCreacion: string;
  fechaActualizacion: string | null;
}

export interface Comentario {
  id: number;
  temaId: number;
  autorId: number;
  autorNombre: string;
  contenido: string;
  estado: EstadoPublicacion;
  fechaCreacion: string;
}

export interface RegistroModeracion {
  id: number;
  tipo: TipoPublicacion;
  publicacionId: number;
  /** Título del tema o comienzo del comentario, para que el historial se entienda aunque se borre la publicación. */
  referencia: string;
  accion: AccionModerar;
  motivo: string;
  moderadorId: number;
  moderadorNombre: string;
  fecha: string;
}

/** Error de una regla de negocio: el mensaje se muestra tal cual en la pantalla. */
export class ErrorForo extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorForo';
  }
}

export function mensajeDe(error: unknown): string {
  return error instanceof ErrorForo ? error.message : 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}
