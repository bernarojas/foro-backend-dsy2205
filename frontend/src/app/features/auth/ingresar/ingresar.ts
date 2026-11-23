import { Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CLAVE_DE_PRUEBA } from '../../../core/data/datos-iniciales';
import { mensajeDe } from '../../../core/models/modelos';
import { AuthService } from '../../../core/services/auth.service';
import { InterfazService } from '../../../core/services/interfaz.service';
import { correo, largo, mensajeDeError, obligatorio } from '../../../core/validators/validadores';

/** Inicio de sesión. */
@Component({
  selector: 'app-ingresar',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './ingresar.html',
})
export class Ingresar {
  private readonly auth = inject(AuthService);
  private readonly interfaz = inject(InterfazService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  /** /ingresar?volver=/temas/nuevo → a dónde ir después de ingresar. */
  readonly volver = input('', { transform: (valor: unknown) => (typeof valor === 'string' ? valor : '') });

  protected readonly form = this.fb.group({
    email: ['', [obligatorio, correo, largo(5, 120)]],
    password: ['', [obligatorio]],
  });

  protected readonly errorGeneral = signal<string | null>(null);
  protected readonly verClave = signal(false);

  /** Cuentas de ejemplo para probar cada rol sin tener que escribir. */
  protected readonly cuentasDemo = [
    { rol: 'Administrador', email: 'admin@foro.cl' },
    { rol: 'Moderador', email: 'moderador@foro.cl' },
    { rol: 'Usuario', email: 'diego@foro.cl' },
  ];

  protected error(campo: 'email' | 'password'): string | null {
    return mensajeDeError(this.form.controls[campo]);
  }

  protected usarDemo(email: string): void {
    this.form.setValue({ email, password: CLAVE_DE_PRUEBA });
    this.errorGeneral.set(null);
  }

  protected ingresar(): void {
    this.errorGeneral.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    try {
      const usuario = this.auth.iniciarSesion(email, password);
      this.interfaz.exito(`¡Hola de nuevo, ${usuario.nombre}!`);
      // Solo se vuelve a rutas internas ("/algo"), nunca a otra página web.
      const destino = this.volver().startsWith('/') && !this.volver().startsWith('//') ? this.volver() : '/';
      this.router.navigateByUrl(destino);
    } catch (e) {
      this.errorGeneral.set(mensajeDe(e));
      this.form.controls.password.reset();
    }
  }
}
