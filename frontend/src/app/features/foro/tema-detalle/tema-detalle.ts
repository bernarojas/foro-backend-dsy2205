import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, numberAttribute, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { mensajeDe } from '../../../core/models/modelos';
import { AuthService } from '../../../core/services/auth.service';
import { ComentarioVista, ForoService } from '../../../core/services/foro.service';
import { InterfazService } from '../../../core/services/interfaz.service';
import { ModeracionService } from '../../../core/services/moderacion.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { largo, mensajeDeError, obligatorio } from '../../../core/validators/validadores';
import { Avatar, EtiquetaRol, HaceCuantoPipe } from '../../../shared/compartidos';

const LARGO_MAXIMO = 2000;

/** Un tema con sus comentarios: comentar, modificar, eliminar y (según el rol) banear o restaurar. */
@Component({
  selector: 'app-tema-detalle',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, Avatar, EtiquetaRol, HaceCuantoPipe],
  templateUrl: './tema-detalle.html',
})
export class TemaDetalle {
  protected readonly foro = inject(ForoService);
  protected readonly auth = inject(AuthService);
  private readonly moderacion = inject(ModeracionService);
  private readonly usuarios = inject(UsuarioService);
  private readonly interfaz = inject(InterfazService);
  private readonly router = inject(Router);

  /** Viene de la ruta /temas/:id */
  readonly id = input.required({ transform: numberAttribute });

  protected readonly largoMaximo = LARGO_MAXIMO;

  protected readonly tema = computed(() => {
    const tema = this.foro.tema(this.id());
    return tema && this.foro.puedeVer(tema) ? tema : undefined;
  });
  protected readonly comentarios = computed(() => this.foro.comentariosDe(this.id()));
  protected readonly publicados = computed(() => this.comentarios().filter((c) => c.estado === 'PUBLICADO').length);
  protected readonly autor = computed(() => {
    const tema = this.tema();
    return tema ? this.usuarios.porId(tema.autorId) : undefined;
  });
  protected readonly motivoBaneo = computed(() => this.moderacion.ultimoMotivo('TEMA', this.id()));
  /** Otros temas de la misma categoría, para seguir leyendo. */
  protected readonly relacionados = computed(() => {
    const tema = this.tema();
    if (!tema) return [];
    return this.foro
      .buscar({ categoriaId: tema.categoriaId, orden: 'actividad' })
      .filter((t) => t.id !== tema.id)
      .slice(0, 4);
  });

  /** Comentario nuevo */
  protected readonly nuevo = new FormControl('', { nonNullable: true, validators: [obligatorio, largo(2, LARGO_MAXIMO)] });
  /** Comentario que se está modificando */
  protected readonly edicion = new FormControl('', { nonNullable: true, validators: [obligatorio, largo(2, LARGO_MAXIMO)] });
  protected readonly editando = signal<number | null>(null);

  protected error(control: FormControl<string>): string | null {
    return mensajeDeError(control);
  }

  /** Un comentario baneado solo muestra su texto a su autor y al equipo de moderación. */
  protected puedeLeer(comentario: ComentarioVista): boolean {
    return comentario.estado === 'PUBLICADO' || this.foro.esAutor(comentario) || this.auth.puedeModerar();
  }

  protected motivoDe(comentario: ComentarioVista): string | null {
    return this.moderacion.ultimoMotivo('COMENTARIO', comentario.id);
  }

  // ---------------------------------------------------------------- Comentarios

  protected comentar(): void {
    if (this.nuevo.invalid) {
      this.nuevo.markAsTouched();
      return;
    }
    try {
      this.foro.comentar(this.id(), this.nuevo.value);
      this.nuevo.reset();
      this.interfaz.exito('Tu comentario quedó publicado.');
    } catch (e) {
      this.interfaz.error(mensajeDe(e));
    }
  }

  protected empezarEdicion(comentario: ComentarioVista): void {
    this.edicion.reset(comentario.contenido);
    this.editando.set(comentario.id);
  }

  protected cancelarEdicion(): void {
    this.editando.set(null);
  }

  protected guardarEdicion(): void {
    const id = this.editando();
    if (id === null) return;
    if (this.edicion.invalid) {
      this.edicion.markAsTouched();
      return;
    }
    try {
      this.foro.modificarComentario(id, this.edicion.value);
      this.editando.set(null);
      this.interfaz.exito('Comentario modificado.');
    } catch (e) {
      this.interfaz.error(mensajeDe(e));
    }
  }

  protected async eliminarComentario(comentario: ComentarioVista): Promise<void> {
    const respuesta = await this.interfaz.confirmar({
      titulo: 'Eliminar comentario',
      mensaje: `Se eliminará el comentario de ${comentario.autorNombre}. Esta acción no se puede deshacer.`,
      textoConfirmar: 'Eliminar',
      peligro: true,
    });
    if (respuesta === null) return;
    this.intentar(() => this.foro.eliminarComentario(comentario.id), 'Comentario eliminado.');
  }

  protected async banearComentario(comentario: ComentarioVista): Promise<void> {
    const motivo = await this.pedirMotivo('Banear comentario', `El comentario de ${comentario.autorNombre} dejará de verse en el foro.`);
    if (motivo === null) return;
    this.intentar(() => this.moderacion.banear('COMENTARIO', comentario.id, motivo), 'Comentario baneado. Quedó registrado en el historial.');
  }

  protected restaurarComentario(comentario: ComentarioVista): void {
    this.intentar(() => this.moderacion.restaurar('COMENTARIO', comentario.id), 'Comentario restaurado.');
  }

  // ---------------------------------------------------------------- Tema

  protected async eliminarTema(): Promise<void> {
    const tema = this.tema();
    if (!tema) return;
    const respuesta = await this.interfaz.confirmar({
      titulo: 'Eliminar tema',
      mensaje: `Se eliminará "${tema.titulo}" junto con sus ${tema.comentarios} respuestas. Esta acción no se puede deshacer.`,
      textoConfirmar: 'Eliminar tema',
      peligro: true,
    });
    if (respuesta === null) return;
    try {
      this.foro.eliminarTema(tema.id);
      this.interfaz.exito('Tema eliminado.');
      this.router.navigate(['/categorias', tema.categoriaId]);
    } catch (e) {
      this.interfaz.error(mensajeDe(e));
    }
  }

  protected async banearTema(): Promise<void> {
    const tema = this.tema();
    if (!tema) return;
    const motivo = await this.pedirMotivo('Banear tema', `"${tema.titulo}" dejará de verse en el foro y no se podrá comentar.`);
    if (motivo === null) return;
    this.intentar(() => this.moderacion.banear('TEMA', tema.id, motivo), 'Tema baneado. Quedó registrado en el historial.');
  }

  protected restaurarTema(): void {
    this.intentar(() => this.moderacion.restaurar('TEMA', this.id()), 'Tema restaurado: vuelve a verse en el foro.');
  }

  // ---------------------------------------------------------------- Apoyo

  private pedirMotivo(titulo: string, mensaje: string): Promise<string | null> {
    return this.interfaz.confirmar({
      titulo,
      mensaje,
      textoConfirmar: 'Banear',
      peligro: true,
      campo: {
        etiqueta: 'Motivo (lo verá el autor)',
        tipo: 'texto',
        minimo: 10,
        maximo: 300,
        ayuda: 'Indica qué norma del foro incumple. Entre 10 y 300 caracteres.',
      },
    });
  }

  private intentar(accion: () => void, mensajeExito: string): void {
    try {
      accion();
      this.interfaz.exito(mensajeExito);
    } catch (e) {
      this.interfaz.error(mensajeDe(e));
    }
  }
}
