import { Component, computed, effect, inject, input, numberAttribute } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { merge } from 'rxjs';
import { ForoService, OrdenTemas } from '../../../core/services/foro.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { largo, mensajeDeError } from '../../../core/validators/validadores';
import { ListaTemas } from '../../../shared/lista-temas';

const ORDENES: OrdenTemas[] = ['recientes', 'actividad', 'comentados', 'antiguos'];

/**
 * Búsqueda de temas por texto, categoría y autor.
 * Los filtros viajan en la dirección (/buscar?q=spring&categoria=1) para poder compartir el enlace.
 */
@Component({
  selector: 'app-buscar',
  imports: [ReactiveFormsModule, RouterLink, ListaTemas],
  templateUrl: './buscar.html',
})
export class Buscar {
  protected readonly foro = inject(ForoService);
  private readonly usuarios = inject(UsuarioService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  // Parámetros de la dirección
  readonly q = input('', { transform: (valor: unknown) => (typeof valor === 'string' ? valor : '') });
  readonly categoria = input(0, { transform: (valor: unknown) => numberAttribute(valor, 0) });
  readonly autor = input(0, { transform: (valor: unknown) => numberAttribute(valor, 0) });
  readonly orden = input<OrdenTemas, unknown>('recientes', {
    transform: (valor) => (ORDENES.includes(valor as OrdenTemas) ? (valor as OrdenTemas) : 'recientes'),
  });

  protected readonly form = this.fb.group({
    texto: ['', [largo(2, 80)]],
    categoriaId: [0],
    autorId: [0],
    orden: ['recientes' as OrdenTemas],
  });

  /** Solo quienes han publicado al menos un tema aparecen en el filtro de autor. */
  protected readonly autores = computed(() =>
    this.usuarios
      .listado()
      .filter((u) => this.foro.temasPublicados().some((t) => t.autorId === u.id))
      .sort((a, b) => a.nombre.localeCompare(b.nombre)),
  );

  protected readonly resultados = computed(() =>
    this.foro.buscar({ texto: this.q(), categoriaId: this.categoria(), autorId: this.autor(), orden: this.orden() }),
  );

  protected readonly hayFiltros = computed(() => this.q() !== '' || this.categoria() > 0 || this.autor() > 0);

  constructor() {
    // Cuando cambia la dirección (por ejemplo, al buscar desde la barra), el formulario se pone al día.
    effect(() => {
      this.form.setValue(
        { texto: this.q(), categoriaId: this.categoria(), autorId: this.autor(), orden: this.orden() },
        { emitEvent: false },
      );
    });

    // Al elegir una categoría, un autor o un orden se busca de inmediato; el texto espera al botón.
    const { categoriaId, autorId, orden } = this.form.controls;
    merge(categoriaId.valueChanges, autorId.valueChanges, orden.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.buscar());
  }

  protected errorTexto(): string | null {
    return mensajeDeError(this.form.controls.texto);
  }

  protected buscar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { texto, categoriaId, autorId, orden } = this.form.getRawValue();
    this.router.navigate(['/buscar'], {
      queryParams: {
        q: texto.trim() || null,
        categoria: Number(categoriaId) || null,
        autor: Number(autorId) || null,
        orden: orden === 'recientes' ? null : orden,
      },
    });
  }

  protected limpiar(): void {
    this.form.reset();
    this.router.navigate(['/buscar']);
  }
}
