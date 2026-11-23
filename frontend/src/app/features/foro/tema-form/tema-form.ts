import { Component, computed, effect, inject, input, numberAttribute, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { mensajeDe } from '../../../core/models/modelos';
import { ForoService } from '../../../core/services/foro.service';
import { InterfazService } from '../../../core/services/interfaz.service';
import { largo, mensajeDeError, obligatorio } from '../../../core/validators/validadores';

/** Formulario para publicar un tema nuevo o modificar uno propio (misma pantalla, dos rutas). */
@Component({
  selector: 'app-tema-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './tema-form.html',
})
export class TemaForm {
  protected readonly foro = inject(ForoService);
  private readonly interfaz = inject(InterfazService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  /** /temas/:id/editar → id del tema; en /temas/nuevo no viene. */
  readonly id = input(0, { transform: (valor: unknown) => numberAttribute(valor, 0) });
  /** /temas/nuevo?categoria=3 → categoría sugerida. */
  readonly categoria = input(0, { transform: (valor: unknown) => numberAttribute(valor, 0) });

  protected readonly form = this.fb.group({
    categoriaId: [0, [Validators.min(1)]],
    titulo: ['', [obligatorio, largo(5, 150)]],
    contenido: ['', [obligatorio, largo(10, 4000)]],
  });

  protected readonly esEdicion = computed(() => this.id() > 0);
  protected readonly tema = computed(() => (this.esEdicion() ? this.foro.tema(this.id()) : undefined));
  /** En edición: el tema existe, es del usuario y no está baneado. */
  protected readonly puedeEditar = computed(() => {
    const tema = this.tema();
    return tema !== undefined && this.foro.puedeModificar(tema);
  });
  protected readonly errorGeneral = signal<string | null>(null);

  private cargado = false;

  constructor() {
    // Rellena el formulario una sola vez con el tema a modificar o con la categoría sugerida.
    effect(() => {
      if (this.cargado) return;
      const tema = this.tema();
      if (this.esEdicion()) {
        if (tema) {
          this.form.setValue({ categoriaId: tema.categoriaId, titulo: tema.titulo, contenido: tema.contenido });
        }
      } else if (this.foro.categoria(this.categoria())) {
        this.form.controls.categoriaId.setValue(this.categoria());
      }
      this.cargado = true;
    });
  }

  protected error(campo: 'categoriaId' | 'titulo' | 'contenido'): string | null {
    return mensajeDeError(this.form.controls[campo]);
  }

  protected largoDe(campo: 'titulo' | 'contenido'): number {
    return this.form.controls[campo].value.trim().length;
  }

  protected guardar(): void {
    this.errorGeneral.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const datos = this.form.getRawValue();
    try {
      const tema = this.esEdicion() ? this.foro.modificarTema(this.id(), datos) : this.foro.publicarTema(datos);
      this.interfaz.exito(this.esEdicion() ? 'Los cambios quedaron guardados.' : 'Tu tema quedó publicado.');
      this.router.navigate(['/temas', tema.id]);
    } catch (e) {
      this.errorGeneral.set(mensajeDe(e));
    }
  }
}
