import { Injectable, computed, inject } from '@angular/core';
import {
  AccionModerar,
  ErrorForo,
  EstadoPublicacion,
  RegistroModeracion,
  TipoPublicacion,
  Usuario,
} from '../models/modelos';
import { ComentarioRepository, ModeracionRepository, TemaRepository } from '../repositories/repositorios';
import { AuthService } from './auth.service';

/** Una publicación (tema o comentario) vista desde el panel de moderación. */
export interface PublicacionModerable {
  tipo: TipoPublicacion;
  id: number;
  /** Para un comentario, el tema donde está. */
  temaId: number;
  titulo: string;
  contenido: string;
  autorNombre: string;
  estado: EstadoPublicacion;
  fecha: string;
  /** Motivo del último baneo, si está baneada. */
  motivo: string | null;
}

/**
 * Gestión de publicaciones y comentarios por parte del equipo de moderación:
 * banear lo que incumple las normas, restaurarlo y dejar registro de cada acción.
 * Equivale al microservicio de moderación (/api/moderacion).
 */
@Injectable({ providedIn: 'root' })
export class ModeracionService {
  private readonly temas = inject(TemaRepository);
  private readonly comentarios = inject(ComentarioRepository);
  private readonly registros = inject(ModeracionRepository);
  private readonly auth = inject(AuthService);

  /** Historial completo, de lo más nuevo a lo más antiguo. */
  readonly historial = computed<RegistroModeracion[]>(() =>
    [...this.registros.items()].sort((a, b) => b.fecha.localeCompare(a.fecha)),
  );

  /** Temas y comentarios en cualquier estado, de lo más nuevo a lo más antiguo. */
  readonly publicaciones = computed<PublicacionModerable[]>(() => {
    const temas = this.temas.items();
    const deTemas: PublicacionModerable[] = temas.map((t) => ({
      tipo: 'TEMA',
      id: t.id,
      temaId: t.id,
      titulo: t.titulo,
      contenido: t.contenido,
      autorNombre: t.autorNombre,
      estado: t.estado,
      fecha: t.fechaCreacion,
      motivo: t.estado === 'BANEADO' ? this.ultimoMotivo('TEMA', t.id) : null,
    }));
    const deComentarios: PublicacionModerable[] = this.comentarios.items().map((c) => ({
      tipo: 'COMENTARIO',
      id: c.id,
      temaId: c.temaId,
      titulo: temas.find((t) => t.id === c.temaId)?.titulo ?? 'Tema eliminado',
      contenido: c.contenido,
      autorNombre: c.autorNombre,
      estado: c.estado,
      fecha: c.fechaCreacion,
      motivo: c.estado === 'BANEADO' ? this.ultimoMotivo('COMENTARIO', c.id) : null,
    }));
    return [...deTemas, ...deComentarios].sort((a, b) => b.fecha.localeCompare(a.fecha));
  });

  readonly resumen = computed(() => {
    const temas = this.temas.items();
    const comentarios = this.comentarios.items();
    const porModerador = new Map<string, number>();
    for (const registro of this.registros.items()) {
      porModerador.set(registro.moderadorNombre, (porModerador.get(registro.moderadorNombre) ?? 0) + 1);
    }
    return {
      temasPublicados: temas.filter((t) => t.estado === 'PUBLICADO').length,
      temasBaneados: temas.filter((t) => t.estado === 'BANEADO').length,
      comentariosPublicados: comentarios.filter((c) => c.estado === 'PUBLICADO').length,
      comentariosBaneados: comentarios.filter((c) => c.estado === 'BANEADO').length,
      acciones: this.registros.items().length,
      porModerador: [...porModerador.entries()]
        .map(([nombre, acciones]) => ({ nombre, acciones }))
        .sort((a, b) => b.acciones - a.acciones),
    };
  });

  /** Motivo del último baneo de una publicación (para mostrarlo en el aviso del tema o comentario). */
  ultimoMotivo(tipo: TipoPublicacion, id: number): string | null {
    const baneos = this.registros
      .items()
      .filter((r) => r.tipo === tipo && r.publicacionId === id && r.accion === 'BANEAR')
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
    return baneos[0]?.motivo ?? null;
  }

  banear(tipo: TipoPublicacion, id: number, motivo: string): void {
    const texto = motivo.trim();
    if (texto.length < 10) {
      throw new ErrorForo('Explica el motivo del baneo con al menos 10 caracteres.');
    }
    this.cambiarEstado(tipo, id, 'BANEAR', texto);
  }

  restaurar(tipo: TipoPublicacion, id: number, motivo = ''): void {
    this.cambiarEstado(tipo, id, 'RESTAURAR', motivo.trim() || 'Restaurado tras la revisión.');
  }

  private cambiarEstado(tipo: TipoPublicacion, id: number, accion: AccionModerar, motivo: string): void {
    const moderador = this.exigirModerador();
    const nuevoEstado: EstadoPublicacion = accion === 'BANEAR' ? 'BANEADO' : 'PUBLICADO';
    let referencia: string;

    if (tipo === 'TEMA') {
      const tema = this.temas.porId(id);
      if (!tema) throw new ErrorForo('El tema no existe.');
      if (tema.estado === nuevoEstado) throw new ErrorForo(`El tema ya está ${nuevoEstado.toLowerCase()}.`);
      this.temas.actualizar(id, { estado: nuevoEstado });
      referencia = tema.titulo;
    } else {
      const comentario = this.comentarios.porId(id);
      if (!comentario) throw new ErrorForo('El comentario no existe.');
      if (comentario.estado === nuevoEstado) {
        throw new ErrorForo(`El comentario ya está ${nuevoEstado.toLowerCase()}.`);
      }
      this.comentarios.actualizar(id, { estado: nuevoEstado });
      referencia = comentario.contenido.length > 60 ? `${comentario.contenido.slice(0, 60)}…` : comentario.contenido;
    }

    this.registros.crear({
      tipo,
      publicacionId: id,
      referencia,
      accion,
      motivo,
      moderadorId: moderador.id,
      moderadorNombre: moderador.nombre,
      fecha: new Date().toISOString(),
    });
  }

  private exigirModerador(): Usuario {
    const yo = this.auth.exigirSesion();
    if (!this.auth.puedeModerar()) {
      throw new ErrorForo('Solo moderadores y administradores pueden hacer esto.');
    }
    return yo;
  }
}
