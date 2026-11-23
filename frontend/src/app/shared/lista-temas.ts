import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TemaVista } from '../core/services/foro.service';
import { Avatar, HaceCuantoPipe } from './compartidos';

/** Lista de temas: la usan la portada, la página de una categoría, la búsqueda y "Mis publicaciones". */
@Component({
  selector: 'app-lista-temas',
  imports: [RouterLink, Avatar, HaceCuantoPipe],
  template: `
    <ul class="lista-temas">
      @for (tema of temas(); track tema.id) {
        <li class="tema-fila">
          <app-avatar [nombre]="tema.autorNombre" [color]="tema.autorColor" />
          <div class="flex-grow-1" style="min-width: 0">
            <a class="tema-titulo" [routerLink]="['/temas', tema.id]">{{ tema.titulo }}</a>
            @if (tema.estado === 'BANEADO') {
              <span class="badge estado-baneado ms-1"><i class="bi bi-slash-circle"></i> Baneado</span>
            }
            <div class="tema-meta">
              @if (mostrarCategoria() && tema.categoria; as categoria) {
                <a class="etiqueta-categoria" [style.color]="categoria.color" [routerLink]="['/categorias', categoria.id]">
                  <i class="bi" [class]="categoria.icono"></i> {{ categoria.nombre }}
                </a>
              }
              <span><i class="bi bi-person"></i> {{ tema.autorNombre }}</span>
              <span [title]="tema.fechaCreacion"><i class="bi bi-clock"></i> {{ tema.fechaCreacion | haceCuanto }}</span>
              @if (tema.comentarios > 0) {
                <span class="d-none d-md-inline">Última respuesta {{ tema.ultimaActividad | haceCuanto }}</span>
              }
            </div>
          </div>
          <div class="tema-conteo" [attr.aria-label]="tema.comentarios + ' comentarios'">
            <strong>{{ tema.comentarios }}</strong>
            {{ tema.comentarios === 1 ? 'respuesta' : 'respuestas' }}
          </div>
        </li>
      }
    </ul>
  `,
})
export class ListaTemas {
  readonly temas = input.required<TemaVista[]>();
  readonly mostrarCategoria = input(true);
}
