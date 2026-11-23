import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ForoService } from '../../../core/services/foro.service';
import { HaceCuantoPipe } from '../../../shared/compartidos';
import { ListaTemas } from '../../../shared/lista-temas';

/** Portada del foro: buscador, categorías, conversaciones recientes y temas más comentados. */
@Component({
  selector: 'app-inicio',
  imports: [RouterLink, ListaTemas, HaceCuantoPipe],
  templateUrl: './inicio.html',
})
export class Inicio {
  protected readonly foro = inject(ForoService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly recientes = computed(() => this.foro.buscar({ orden: 'actividad' }).slice(0, 6));
  protected readonly masComentados = computed(() => this.foro.masComentados(5));

  protected buscar(evento: Event, campo: HTMLInputElement): void {
    evento.preventDefault();
    const texto = campo.value.trim();
    this.router.navigate(['/buscar'], { queryParams: texto ? { q: texto } : {} });
  }
}
