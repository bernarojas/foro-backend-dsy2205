import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { COLORES_AVATAR } from '../../../core/data/datos-iniciales';
import { mensajeDe } from '../../../core/models/modelos';
import { AuthService } from '../../../core/services/auth.service';
import { InterfazService } from '../../../core/services/interfaz.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import {
  claveSegura,
  correo,
  distintoDe,
  igualA,
  largo,
  mensajeDeError,
  nombrePersona,
  obligatorio,
} from '../../../core/validators/validadores';
import { Avatar, EtiquetaRol, RequisitosClave } from '../../../shared/compartidos';

/** Modificación de perfil: datos personales, contraseña y eliminación de la cuenta. */
@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, Avatar, EtiquetaRol, RequisitosClave],
  templateUrl: './perfil.html',
})
export class Perfil {
  protected readonly auth = inject(AuthService);
  private readonly usuarios = inject(UsuarioService);
  private readonly interfaz = inject(InterfazService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly colores = COLORES_AVATAR;

  /** El usuario de la sesión con su rol y sus cifras. */
  protected readonly yo = computed(() => {
    const usuario = this.auth.usuario();
    return usuario ? this.usuarios.porId(usuario.id) : undefined;
  });

  protected readonly formDatos = this.fb.group({
    nombre: ['', [obligatorio, nombrePersona, largo(3, 100)]],
    email: ['', [obligatorio, correo, largo(5, 120)]],
    biografia: ['', [largo(0, 200)]],
    color: [COLORES_AVATAR[0]],
  });

  protected readonly formClave = this.fb.group({
    actual: ['', [obligatorio]],
    nueva: ['', [obligatorio, claveSegura, distintoDe('actual')]],
    confirmar: ['', [obligatorio, igualA('nueva')]],
  });

  protected readonly errorDatos = signal<string | null>(null);
  protected readonly errorClave = signal<string | null>(null);
  protected readonly verClave = signal(false);

  private cargado = false;

  constructor() {
    // Rellena el formulario con los datos actuales una sola vez.
    effect(() => {
      const usuario = this.auth.usuario();
      if (usuario && !this.cargado) {
        this.cargado = true;
        this.cargarDatos();
      }
    });

    const { actual, nueva, confirmar } = this.formClave.controls;
    actual.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => nueva.updateValueAndValidity());
    nueva.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => confirmar.updateValueAndValidity());
  }

  protected errorDe(campo: keyof typeof this.formDatos.controls): string | null {
    return mensajeDeError(this.formDatos.controls[campo]);
  }

  protected errorDeClave(campo: keyof typeof this.formClave.controls): string | null {
    return mensajeDeError(this.formClave.controls[campo]);
  }

  protected elegirColor(color: string): void {
    this.formDatos.controls.color.setValue(color);
    this.formDatos.controls.color.markAsDirty();
  }

  protected cargarDatos(): void {
    const usuario = this.auth.usuario();
    if (!usuario) return;
    this.formDatos.reset({
      nombre: usuario.nombre,
      email: usuario.email,
      biografia: usuario.biografia,
      color: usuario.color,
    });
    this.errorDatos.set(null);
  }

  protected guardarDatos(): void {
    this.errorDatos.set(null);
    if (this.formDatos.invalid) {
      this.formDatos.markAllAsTouched();
      return;
    }
    try {
      this.usuarios.actualizarPerfil(this.formDatos.getRawValue());
      this.cargarDatos();
      this.interfaz.exito('Tu perfil quedó actualizado.');
    } catch (e) {
      this.errorDatos.set(mensajeDe(e));
    }
  }

  protected cambiarClave(): void {
    this.errorClave.set(null);
    if (this.formClave.invalid) {
      this.formClave.markAllAsTouched();
      return;
    }
    const { actual, nueva } = this.formClave.getRawValue();
    try {
      this.usuarios.cambiarClave(actual, nueva);
      this.formClave.reset();
      this.interfaz.exito('Contraseña cambiada.');
    } catch (e) {
      this.errorClave.set(mensajeDe(e));
    }
  }

  protected async eliminarCuenta(): Promise<void> {
    const clave = await this.interfaz.confirmar({
      titulo: 'Eliminar mi cuenta',
      mensaje:
        'Tu cuenta se eliminará para siempre y no podrás volver a ingresar con ella. Tus temas y comentarios seguirán en el foro con tu nombre.',
      textoConfirmar: 'Eliminar mi cuenta',
      peligro: true,
      campo: { etiqueta: 'Escribe tu contraseña para confirmar', tipo: 'clave', minimo: 1, maximo: 60 },
    });
    if (clave === null) return;
    try {
      this.usuarios.eliminarMiCuenta(clave);
      this.interfaz.info('Tu cuenta fue eliminada. Gracias por haber sido parte de Tertulia.');
      this.router.navigate(['/']);
    } catch (e) {
      this.interfaz.error(mensajeDe(e));
    }
  }
}
