import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { COLORES_AVATAR, ICONOS_CATEGORIA } from '../../../core/data/datos-iniciales';
import { mensajeDe } from '../../../core/models/modelos';
import { CategoriaVista, ForoService } from '../../../core/services/foro.service';
import { InterfazService } from '../../../core/services/interfaz.service';
import { largo, mensajeDeError, obligatorio } from '../../../core/validators/validadores';

/** Administración de categorías (solo ADMINISTRADOR): crear, modificar y eliminar. */
@Component({
  selector: 'app-admin-categorias',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './categorias.html',
})
export class AdminCategorias {
  protected readonly foro = inject(ForoService);
  private readonly interfaz = inject(InterfazService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly iconos = ICONOS_CATEGORIA;
  protected readonly colores = COLORES_AVATAR;

  /** null: formulario cerrado · 0: categoría nueva · otro número: id de la categoría que se modifica. */
  protected readonly editando = signal<number | null>(null);
  protected readonly errorGeneral = signal<string | null>(null);

  protected readonly form = this.fb.group({
    nombre: ['', [obligatorio, largo(3, 60)]],
    descripcion: ['', [obligatorio, largo(10, 250)]],
    icono: [ICONOS_CATEGORIA[0]],
    color: [COLORES_AVATAR[1]],
  });

  protected error(campo: 'nombre' | 'descripcion'): string | null {
    return mensajeDeError(this.form.controls[campo]);
  }

  protected nueva(): void {
    this.form.reset();
    this.errorGeneral.set(null);
    this.editando.set(0);
  }

  protected modificar(categoria: CategoriaVista): void {
    this.form.reset({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      icono: categoria.icono,
      color: categoria.color,
    });
    this.errorGeneral.set(null);
    this.editando.set(categoria.id);
  }

  protected cerrar(): void {
    this.editando.set(null);
  }

  protected guardar(): void {
    this.errorGeneral.set(null);
    const id = this.editando();
    if (id === null) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const datos = this.form.getRawValue();
    try {
      if (id === 0) {
        this.foro.crearCategoria(datos);
        this.interfaz.exito(`Se creó la categoría "${datos.nombre.trim()}".`);
      } else {
        this.foro.modificarCategoria(id, datos);
        this.interfaz.exito('Categoría modificada.');
      }
      this.editando.set(null);
    } catch (e) {
      this.errorGeneral.set(mensajeDe(e));
    }
  }

  protected async eliminar(categoria: CategoriaVista): Promise<void> {
    const respuesta = await this.interfaz.confirmar({
      titulo: 'Eliminar categoría',
      mensaje: `Se eliminará la categoría "${categoria.nombre}". Solo se puede eliminar si no tiene temas.`,
      textoConfirmar: 'Eliminar',
      peligro: true,
    });
    if (respuesta === null) return;
    try {
      this.foro.eliminarCategoria(categoria.id);
      if (this.editando() === categoria.id) this.editando.set(null);
      this.interfaz.exito('Categoría eliminada.');
    } catch (e) {
      this.interfaz.error(mensajeDe(e));
    }
  }
}
