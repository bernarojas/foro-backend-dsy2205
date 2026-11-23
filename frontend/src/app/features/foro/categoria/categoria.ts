import { Component, computed, inject, input, numberAttribute, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ForoService, OrdenTemas } from '../../../core/services/foro.service';
import { ListaTemas } from '../../../shared/lista-temas';

/** Temas de una categoría, con el orden que elija el visitante. */
@Component({
  selector: 'app-categoria',
  imports: [RouterLink, ListaTemas],
  templateUrl: './categoria.html',
})
export class CategoriaPagina {
  protected readonly foro = inject(ForoService);
  protected readonly auth = inject(AuthService);

  /** Viene de la ruta /categorias/:id */
  readonly id = input.required({ transform: numberAttribute });

  protected readonly orden = signal<OrdenTemas>('actividad');
  protected readonly categoria = computed(() => this.foro.categoria(this.id()));
  protected readonly temas = computed(() => this.foro.buscar({ categoriaId: this.id(), orden: this.orden() }));

  protected cambiarOrden(evento: Event): void {
    this.orden.set((evento.target as HTMLSelectElement).value as OrdenTemas);
  }
}
