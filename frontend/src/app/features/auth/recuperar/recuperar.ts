import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { mensajeDe } from '../../../core/models/modelos';
import { AuthService } from '../../../core/services/auth.service';
import { InterfazService } from '../../../core/services/interfaz.service';
import { claveSegura, correo, igualA, largo, mensajeDeError, obligatorio } from '../../../core/validators/validadores';
import { RequisitosClave } from '../../../shared/compartidos';

/**
 * Recuperar contraseña en tres pasos: correo → código → contraseña nueva.
 * Como no hay servidor de correo, el código se muestra en pantalla como "correo simulado".
 */
@Component({
  selector: 'app-recuperar',
  imports: [ReactiveFormsModule, RouterLink, RequisitosClave],
  templateUrl: './recuperar.html',
})
export class Recuperar {
  private readonly auth = inject(AuthService);
  private readonly interfaz = inject(InterfazService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly paso = signal<1 | 2 | 3>(1);
  protected readonly errorGeneral = signal<string | null>(null);
  /** Código del "correo simulado". */
  protected readonly codigoEnviado = signal('');
  protected readonly verClave = signal(false);

  protected readonly formCorreo = this.fb.group({
    email: ['', [obligatorio, correo, largo(5, 120)]],
  });

  protected readonly formCodigo = this.fb.group({
    codigo: ['', [obligatorio, Validators.pattern(/^\s*\d{6}\s*$/)]],
  });

  protected readonly formClave = this.fb.group({
    password: ['', [obligatorio, claveSegura]],
    confirmar: ['', [obligatorio, igualA('password')]],
  });

  constructor() {
    this.formClave.controls.password.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.formClave.controls.confirmar.updateValueAndValidity());
  }

  protected get email(): string {
    return this.formCorreo.controls.email.value.trim().toLowerCase();
  }

  protected errorCorreo(): string | null {
    return mensajeDeError(this.formCorreo.controls.email);
  }

  protected errorCodigo(): string | null {
    const control = this.formCodigo.controls.codigo;
    return control.hasError('pattern') && (control.touched || control.dirty)
      ? 'El código tiene 6 dígitos.'
      : mensajeDeError(control);
  }

  protected errorClave(campo: 'password' | 'confirmar'): string | null {
    return mensajeDeError(this.formClave.controls[campo]);
  }

  // Paso 1: pedir el código
  protected enviarCodigo(): void {
    this.errorGeneral.set(null);
    if (this.formCorreo.invalid) {
      this.formCorreo.markAllAsTouched();
      return;
    }
    try {
      this.codigoEnviado.set(this.auth.solicitarCodigo(this.email));
      this.formCodigo.reset();
      this.paso.set(2);
    } catch (e) {
      this.errorGeneral.set(mensajeDe(e));
    }
  }

  // Paso 2: comprobar el código
  protected comprobarCodigo(): void {
    this.errorGeneral.set(null);
    if (this.formCodigo.invalid) {
      this.formCodigo.markAllAsTouched();
      return;
    }
    try {
      this.auth.verificarCodigo(this.email, this.formCodigo.controls.codigo.value);
      this.paso.set(3);
    } catch (e) {
      this.errorGeneral.set(mensajeDe(e));
    }
  }

  // Paso 3: guardar la contraseña nueva
  protected guardarClave(): void {
    this.errorGeneral.set(null);
    if (this.formClave.invalid) {
      this.formClave.markAllAsTouched();
      return;
    }
    try {
      this.auth.restablecerClave(this.email, this.formCodigo.controls.codigo.value, this.formClave.controls.password.value);
      this.interfaz.exito('Contraseña cambiada. Ya puedes ingresar con la nueva.');
      this.router.navigate(['/ingresar']);
    } catch (e) {
      this.errorGeneral.set(mensajeDe(e));
    }
  }

  protected volverAlCorreo(): void {
    this.errorGeneral.set(null);
    this.paso.set(1);
  }
}
