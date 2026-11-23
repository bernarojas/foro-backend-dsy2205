import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EstadoPublicacion, TipoPublicacion, mensajeDe } from '../../core/models/modelos';
import { normalizar } from '../../core/services/foro.service';
import { InterfazService } from '../../core/services/interfaz.service';
import { ModeracionService, PublicacionModerable } from '../../core/services/moderacion.service';
import { HaceCuantoPipe } from '../../shared/compartidos';

/**
 * Panel de moderación (MODERADOR y ADMINISTRADOR): revisar temas y comentarios,
 * banear los que incumplen las normas, restaurarlos y consultar el historial.
 */
@Component({
  selector: 'app-moderacion',
  imports: [RouterLink, DatePipe, HaceCuantoPipe],
  templateUrl: './moderacion.html',
})
export class Moderacion {
  protected readonly moderacion = inject(ModeracionService);
  private readonly interfaz = inject(InterfazService);

  protected readonly pestana = signal<'publicaciones' | 'historial'>('publicaciones');

  // Filtros de la lista de publicaciones
  protected readonly tipo = signal<TipoPublicacion | ''>('');
  protected readonly estado = signal<EstadoPublicacion | ''>('');
  protected readonly texto = signal('');

  protected readonly publicaciones = computed(() => {
    const texto = normalizar(this.texto());
    return this.moderacion
      .publicaciones()
      .filter(
        (p) =>
          (this.tipo() === '' || p.tipo === this.tipo()) &&
          (this.estado() === '' || p.estado === this.estado()) &&
          (texto === '' ||
            normalizar(p.titulo).includes(texto) ||
            normalizar(p.contenido).includes(texto) ||
            normalizar(p.autorNombre).includes(texto)),
      );
  });

  protected valor(evento: Event): string {
    return (evento.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected quitarFiltros(): void {
    this.tipo.set('');
    this.estado.set('');
    this.texto.set('');
  }

  protected async banear(publicacion: PublicacionModerable): Promise<void> {
    const queEs = publicacion.tipo === 'TEMA' ? 'El tema' : 'El comentario';
    const motivo = await this.interfaz.confirmar({
      titulo: publicacion.tipo === 'TEMA' ? 'Banear tema' : 'Banear comentario',
      mensaje: `${queEs} de ${publicacion.autorNombre} dejará de verse en el foro.`,
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
    if (motivo === null) return;
    try {
      this.moderacion.banear(publicacion.tipo, publicacion.id, motivo);
      this.interfaz.exito('Publicación baneada. Quedó registrada en el historial.');
    } catch (e) {
      this.interfaz.error(mensajeDe(e));
    }
  }

  protected async restaurar(publicacion: PublicacionModerable): Promise<void> {
    const respuesta = await this.interfaz.confirmar({
      titulo: 'Restaurar publicación',
      mensaje: `La publicación de ${publicacion.autorNombre} volverá a verse en el foro.`,
      textoConfirmar: 'Restaurar',
    });
    if (respuesta === null) return;
    try {
      this.moderacion.restaurar(publicacion.tipo, publicacion.id);
      this.interfaz.exito('Publicación restaurada.');
    } catch (e) {
      this.interfaz.error(mensajeDe(e));
    }
  }
}
