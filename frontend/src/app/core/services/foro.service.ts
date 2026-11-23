import { Injectable, computed, inject } from '@angular/core';
import { Categoria, Comentario, ErrorForo, Tema } from '../models/modelos';
import {
  CategoriaRepository,
  ComentarioRepository,
  TemaRepository,
  UsuarioRepository,
} from '../repositories/repositorios';
import { AuthService } from './auth.service';

/** Un tema con lo que la pantalla necesita mostrar a su lado. */
export interface TemaVista extends Tema {
  categoria: Categoria | undefined;
  autorColor: string;
  /** Comentarios publicados (los baneados no cuentan). */
  comentarios: number;
  /** Fecha del último comentario publicado, o la del tema si nadie ha comentado. */
  ultimaActividad: string;
}

export interface ComentarioVista extends Comentario {
  autorColor: string;
}

export interface CategoriaVista extends Categoria {
  temas: number;
  comentarios: number;
  ultimaPublicacion: string | null;
}

export type OrdenTemas = 'recientes' | 'actividad' | 'comentados' | 'antiguos';

export interface FiltroTemas {
  texto?: string;
  categoriaId?: number | null;
  autorId?: number | null;
  orden?: OrdenTemas;
}

export interface DatosTema {
  categoriaId: number;
  titulo: string;
  contenido: string;
}

export interface DatosCategoria {
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
}

const COLOR_SIN_CUENTA = '#8a8f9c';

/**
 * Búsqueda, visualización, publicación y comentarios de temas, más las categorías.
 * Equivale al microservicio del foro (/api/categorias, /api/temas, /api/comentarios).
 *
 * PATRÓN FACADE: las pantallas hablan solo con este servicio; él coordina los
 * repositorios de temas, comentarios, categorías y usuarios, y aplica los permisos.
 */
@Injectable({ providedIn: 'root' })
export class ForoService {
  private readonly categoriasRepo = inject(CategoriaRepository);
  private readonly temasRepo = inject(TemaRepository);
  private readonly comentariosRepo = inject(ComentarioRepository);
  private readonly usuariosRepo = inject(UsuarioRepository);
  private readonly auth = inject(AuthService);

  // ---------------------------------------------------------------- Lecturas (signals calculados)

  /** Todos los temas, en cualquier estado, listos para mostrar. */
  readonly todosLosTemas = computed<TemaVista[]>(() => {
    const categorias = this.categoriasRepo.items();
    const usuarios = this.usuariosRepo.items();
    const comentarios = this.comentariosRepo.items().filter((c) => c.estado === 'PUBLICADO');
    return this.temasRepo.items().map((tema) => {
      const delTema = comentarios.filter((c) => c.temaId === tema.id);
      const ultima = delTema.reduce((max, c) => (c.fechaCreacion > max ? c.fechaCreacion : max), tema.fechaCreacion);
      return {
        ...tema,
        categoria: categorias.find((c) => c.id === tema.categoriaId),
        autorColor: usuarios.find((u) => u.id === tema.autorId)?.color ?? COLOR_SIN_CUENTA,
        comentarios: delTema.length,
        ultimaActividad: ultima,
      };
    });
  });

  /** Lo que ve cualquier visitante: solo los temas publicados. */
  readonly temasPublicados = computed(() => this.todosLosTemas().filter((t) => t.estado === 'PUBLICADO'));

  /** Categorías con su cantidad de temas, comentarios y última publicación. */
  readonly categorias = computed<CategoriaVista[]>(() => {
    const temas = this.temasPublicados();
    return this.categoriasRepo.items().map((categoria) => {
      const suyos = temas.filter((t) => t.categoriaId === categoria.id);
      return {
        ...categoria,
        temas: suyos.length,
        comentarios: suyos.reduce((suma, t) => suma + t.comentarios, 0),
        ultimaPublicacion: suyos.reduce<string | null>(
          (max, t) => (max === null || t.ultimaActividad > max ? t.ultimaActividad : max),
          null,
        ),
      };
    });
  });

  readonly totales = computed(() => ({
    temas: this.temasPublicados().length,
    comentarios: this.temasPublicados().reduce((suma, t) => suma + t.comentarios, 0),
    miembros: this.usuariosRepo.items().filter((u) => u.estado === 'ACTIVO').length,
    categorias: this.categoriasRepo.items().length,
  }));

  categoria(id: number): CategoriaVista | undefined {
    return this.categorias().find((c) => c.id === id);
  }

  /** Búsqueda por texto (título o contenido), categoría y autor, con el orden pedido. */
  buscar(filtro: FiltroTemas = {}): TemaVista[] {
    const texto = normalizar(filtro.texto ?? '');
    const encontrados = this.temasPublicados().filter(
      (tema) =>
        (!filtro.categoriaId || tema.categoriaId === filtro.categoriaId) &&
        (!filtro.autorId || tema.autorId === filtro.autorId) &&
        (texto === '' || normalizar(tema.titulo).includes(texto) || normalizar(tema.contenido).includes(texto)),
    );
    return ordenar(encontrados, filtro.orden ?? 'recientes');
  }

  masComentados(limite = 5): TemaVista[] {
    return ordenar(this.temasPublicados(), 'comentados').slice(0, limite);
  }

  /** Un tema en cualquier estado. La pantalla decide con `puedeVer` si lo muestra. */
  tema(id: number): TemaVista | undefined {
    return this.todosLosTemas().find((t) => t.id === id);
  }

  /** Un tema baneado solo lo ven su autor y el equipo de moderación. */
  puedeVer(tema: Tema): boolean {
    return tema.estado === 'PUBLICADO' || this.esAutor(tema) || this.auth.puedeModerar();
  }

  comentariosDe(temaId: number): ComentarioVista[] {
    const usuarios = this.usuariosRepo.items();
    return this.comentariosRepo
      .items()
      .filter((c) => c.temaId === temaId)
      .sort((a, b) => a.fechaCreacion.localeCompare(b.fechaCreacion))
      .map((c) => ({ ...c, autorColor: usuarios.find((u) => u.id === c.autorId)?.color ?? COLOR_SIN_CUENTA }));
  }

  /** Temas del usuario de la sesión, incluidos los baneados. */
  misTemas(): TemaVista[] {
    const yo = this.auth.usuario();
    return yo ? ordenar(this.todosLosTemas().filter((t) => t.autorId === yo.id), 'recientes') : [];
  }

  /** Comentarios del usuario de la sesión, con el título del tema donde los escribió. */
  misComentarios(): (Comentario & { temaTitulo: string })[] {
    const yo = this.auth.usuario();
    if (!yo) return [];
    const temas = this.temasRepo.items();
    return this.comentariosRepo
      .items()
      .filter((c) => c.autorId === yo.id)
      .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion))
      .map((c) => ({ ...c, temaTitulo: temas.find((t) => t.id === c.temaId)?.titulo ?? 'Tema eliminado' }));
  }

  // ---------------------------------------------------------------- Permisos

  esAutor(publicacion: { autorId: number }): boolean {
    return this.auth.usuario()?.id === publicacion.autorId;
  }

  /** Modificar: solo el autor, y solo si la publicación no está baneada. */
  puedeModificar(publicacion: Tema | Comentario): boolean {
    return this.esAutor(publicacion) && publicacion.estado === 'PUBLICADO';
  }

  /** Eliminar: el autor, un moderador o un administrador. */
  puedeEliminar(publicacion: { autorId: number }): boolean {
    return this.esAutor(publicacion) || this.auth.puedeModerar();
  }

  // ---------------------------------------------------------------- Temas

  publicarTema(datos: DatosTema): Tema {
    const yo = this.auth.exigirSesion();
    this.exigirCategoria(datos.categoriaId);
    return this.temasRepo.crear({
      categoriaId: datos.categoriaId,
      autorId: yo.id,
      autorNombre: yo.nombre,
      titulo: datos.titulo.trim(),
      contenido: datos.contenido.trim(),
      estado: 'PUBLICADO',
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: null,
    });
  }

  modificarTema(id: number, datos: DatosTema): Tema {
    this.auth.exigirSesion();
    const tema = this.exigirTema(id);
    if (!this.esAutor(tema)) throw new ErrorForo('Solo el autor puede modificar el tema.');
    if (tema.estado === 'BANEADO') throw new ErrorForo('Un tema baneado no se puede modificar.');
    this.exigirCategoria(datos.categoriaId);
    return (
      this.temasRepo.actualizar(id, {
        categoriaId: datos.categoriaId,
        titulo: datos.titulo.trim(),
        contenido: datos.contenido.trim(),
        fechaActualizacion: new Date().toISOString(),
      }) ?? tema
    );
  }

  /** Elimina el tema y sus comentarios (igual que el ON DELETE CASCADE de Oracle). */
  eliminarTema(id: number): void {
    this.auth.exigirSesion();
    const tema = this.exigirTema(id);
    if (!this.puedeEliminar(tema)) throw new ErrorForo('No tienes permiso para eliminar este tema.');
    this.comentariosRepo.eliminarDonde((c) => c.temaId === id);
    this.temasRepo.eliminar(id);
  }

  // ---------------------------------------------------------------- Comentarios

  comentar(temaId: number, contenido: string): Comentario {
    const yo = this.auth.exigirSesion();
    const tema = this.exigirTema(temaId);
    if (tema.estado === 'BANEADO') throw new ErrorForo('No se puede comentar un tema baneado.');
    return this.comentariosRepo.crear({
      temaId,
      autorId: yo.id,
      autorNombre: yo.nombre,
      contenido: contenido.trim(),
      estado: 'PUBLICADO',
      fechaCreacion: new Date().toISOString(),
    });
  }

  modificarComentario(id: number, contenido: string): void {
    this.auth.exigirSesion();
    const comentario = this.exigirComentario(id);
    if (!this.esAutor(comentario)) throw new ErrorForo('Solo el autor puede modificar el comentario.');
    if (comentario.estado === 'BANEADO') throw new ErrorForo('Un comentario baneado no se puede modificar.');
    this.comentariosRepo.actualizar(id, { contenido: contenido.trim() });
  }

  eliminarComentario(id: number): void {
    this.auth.exigirSesion();
    const comentario = this.exigirComentario(id);
    if (!this.puedeEliminar(comentario)) throw new ErrorForo('No tienes permiso para eliminar este comentario.');
    this.comentariosRepo.eliminar(id);
  }

  // ---------------------------------------------------------------- Categorías (solo ADMINISTRADOR)

  crearCategoria(datos: DatosCategoria): Categoria {
    this.exigirAdministrador();
    this.exigirNombreLibre(datos.nombre);
    return this.categoriasRepo.crear({ ...datos, nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim() });
  }

  modificarCategoria(id: number, datos: DatosCategoria): void {
    this.exigirAdministrador();
    this.exigirCategoria(id);
    this.exigirNombreLibre(datos.nombre, id);
    this.categoriasRepo.actualizar(id, { ...datos, nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim() });
  }

  eliminarCategoria(id: number): void {
    this.exigirAdministrador();
    this.exigirCategoria(id);
    if (this.temasRepo.items().some((t) => t.categoriaId === id)) {
      throw new ErrorForo('La categoría tiene temas: muévelos o elimínalos antes de borrarla.');
    }
    if (this.categoriasRepo.items().length <= 5) {
      throw new ErrorForo('El foro debe mantener al menos 5 categorías.');
    }
    this.categoriasRepo.eliminar(id);
  }

  // ---------------------------------------------------------------- Reglas

  private exigirAdministrador(): void {
    this.auth.exigirSesion();
    if (!this.auth.esAdministrador()) throw new ErrorForo('Solo un administrador puede hacer esto.');
  }

  private exigirCategoria(id: number): Categoria {
    const categoria = this.categoriasRepo.porId(id);
    if (!categoria) throw new ErrorForo('La categoría no existe.');
    return categoria;
  }

  private exigirNombreLibre(nombre: string, idActual?: number): void {
    const buscado = normalizar(nombre);
    if (this.categoriasRepo.items().some((c) => c.id !== idActual && normalizar(c.nombre) === buscado)) {
      throw new ErrorForo('Ya existe una categoría con ese nombre.');
    }
  }

  private exigirTema(id: number): Tema {
    const tema = this.temasRepo.porId(id);
    if (!tema) throw new ErrorForo('El tema no existe.');
    return tema;
  }

  private exigirComentario(id: number): Comentario {
    const comentario = this.comentariosRepo.porId(id);
    if (!comentario) throw new ErrorForo('El comentario no existe.');
    return comentario;
  }
}

/** Minúsculas y sin tildes, para que "programacion" encuentre "Programación". */
export function normalizar(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function ordenar(temas: TemaVista[], orden: OrdenTemas): TemaVista[] {
  const copia = [...temas];
  switch (orden) {
    case 'actividad':
      return copia.sort((a, b) => b.ultimaActividad.localeCompare(a.ultimaActividad));
    case 'comentados':
      return copia.sort((a, b) => b.comentarios - a.comentarios || b.fechaCreacion.localeCompare(a.fechaCreacion));
    case 'antiguos':
      return copia.sort((a, b) => a.fechaCreacion.localeCompare(b.fechaCreacion));
    default:
      return copia.sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));
  }
}
