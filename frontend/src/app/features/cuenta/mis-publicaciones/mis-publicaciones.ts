import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mensajeDe } from '../../../core/models/modelos';
import { ForoService } from '../../../core/services/foro.service';
import { InterfazService } from '../../../core/services/interfaz.service';
import { HaceCuantoPipe } from '../../../shared/compartidos';
import { ListaTemas } from '../../../shared/lista-temas';

/** Los temas y comentarios del usuario de la sesión, incluidos los que fueron baneados. */
@Component({
  selector: 'app-mis-publicaciones',
  imports: [RouterLink, ListaTemas, HaceCuantoPipe],
  templateUrl: './mis-publicaciones.html',
})
export class MisPublicaciones {
  private readonly foro = inject(ForoService);
  private readonly interfaz = inject(InterfazService);

  protected readonly pestana = signal<'temas' | 'comentarios'>('temas');
  protected readonly temas = computed(() => this.foro.misTemas());
  protected readonly comentarios = computed(() => this.foro.misComentarios());

  protected async eliminarComentario(id: number): Promise<void> {
    const respuesta = await this.interfaz.confirmar({
      titulo: 'Eliminar comentario',
      mensaje: 'Tu comentario se eliminará del tema. Esta acción no se puede deshacer.',
      textoConfirmar: 'Eliminar',
      peligro: true,
    });
    if (respuesta === null) return;
    try {
      this.foro.eliminarComentario(id);
      this.interfaz.exito('Comentario eliminado.');
    } catch (e) {
      this.interfaz.error(mensajeDe(e));
    }
  }
}
