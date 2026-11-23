import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { mensajeDe } from '../../../core/models/modelos';
import { AuthService } from '../../../core/services/auth.service';
import { InterfazService } from '../../../core/services/interfaz.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import {
  claveSegura,
  correo,
  debeAceptar,
  igualA,
  largo,
  mensajeDeError,
  nombrePersona,
  obligatorio,
} from '../../../core/validators/validadores';
import { RequisitosClave } from '../../../shared/compartidos';

/** Registro de usuarios. Toda cuenta nueva parte con el rol USUARIO. */
@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, RequisitosClave],
  templateUrl: './registro.html',
})
export class Registro {
  private readonly usuarios = inject(UsuarioService);
  private readonly auth = inject(AuthService);
  private readonly interfaz = inject(InterfazService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    nombre: ['', [obligatorio, nombrePersona, largo(3, 100)]],
    email: ['', [obligatorio, correo, largo(5, 120)]],
    password: ['', [obligatorio, claveSegura]],
    confirmar: ['', [obligatorio, igualA('password')]],
    aceptaNormas: [false, [debeAceptar]],
  });

  protected readonly errorGeneral = signal<string | null>(null);
  protected readonly verClave = signal(false);

  constructor() {
    // Si cambia la contraseña, se vuelve a revisar que la confirmación coincida.
    this.form.controls.password.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.confirmar.updateValueAndValidity());
  }

  protected error(campo: keyof typeof this.form.controls): string | null {
    return mensajeDeError(this.form.controls[campo]);
  }

  protected registrar(): void {
    this.errorGeneral.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { nombre, email, password } = this.form.getRawValue();
    try {
      const usuario = this.usuarios.registrar({ nombre, email, password });
      this.auth.abrirSesion(usuario.id);
      this.interfaz.exito(`¡Te damos la bienvenida a Tertulia, ${usuario.nombre}!`);
      this.router.navigate(['/']);
    } catch (e) {
      this.errorGeneral.set(mensajeDe(e));
    }
  }
}
