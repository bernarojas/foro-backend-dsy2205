import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EstadoUsuario, mensajeDe } from '../../../core/models/modelos';
import { AuthService } from '../../../core/services/auth.service';
import { normalizar } from '../../../core/services/foro.service';
import { InterfazService } from '../../../core/services/interfaz.service';
import { UsuarioConRol, UsuarioService } from '../../../core/services/usuario.service';
import {
  claveSegura,
  correo,
  igualA,
  largo,
  mensajeDeError,
  nombrePersona,
  obligatorio,
} from '../../../core/validators/validadores';
import { Avatar, EtiquetaRol, RequisitosClave } from '../../../shared/compartidos';

/** Administración de usuarios (solo ADMINISTRADOR): crear, cambiar rol, bloquear y eliminar cuentas. */
@Component({
  selector: 'app-admin-usuarios',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, Avatar, EtiquetaRol, RequisitosClave],
  templateUrl: './usuarios.html',
})
export class AdminUsuarios {
  protected readonly usuarios = inject(UsuarioService);
  protected readonly auth = inject(AuthService);
  private readonly interfaz = inject(InterfazService);
  private readonly fb = inject(NonNullableFormBuilder);

  // Filtros
  protected readonly texto = signal('');
  protected readonly rolId = signal(0);
  protected readonly estado = signal<EstadoUsuario | ''>('');

  protected readonly lista = computed(() => {
    const texto = normalizar(this.texto());
    return this.usuarios
      .listado()
      .filter(
        (u) =>
          (this.rolId() === 0 || u.rolId === this.rolId()) &&
          (this.estado() === '' || u.estado === this.estado()) &&
          (texto === '' || normalizar(u.nombre).includes(texto) || normalizar(u.email).includes(texto)),
      )
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  });

  // Formulario "Nuevo usuario"
  protected readonly creando = signal(false);
  protected readonly errorCrear = signal<string | null>(null);
  protected readonly form = this.fb.group({
    nombre: ['', [obligatorio, nombrePersona, largo(3, 100)]],
    email: ['', [obligatorio, correo, largo(5, 120)]],
    rolId: [0, [Validators.min(1)]],
    password: ['', [obligatorio, claveSegura]],
    confirmar: ['', [obligatorio, igualA('password')]],
  });

  constructor() {
    this.form.controls.password.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.confirmar.updateValueAndValidity());
  }

  protected valor(evento: Event): string {
    return (evento.target as HTMLInputElement | HTMLSelectElement).value;
  }

  protected error(campo: keyof typeof this.form.controls): string | null {
    return mensajeDeError(this.form.controls[campo]);
  }

  protected abrirFormulario(): void {
    this.form.reset();
    this.errorCrear.set(null);
    this.creando.set(true);
  }

  protected crear(): void {
    this.errorCrear.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { nombre, email, password, rolId } = this.form.getRawValue();
    try {
      const usuario = this.usuarios.registrar({ nombre, email, password, rolId: Number(rolId) });
      this.creando.set(false);
      this.interfaz.exito(`Se creó la cuenta de ${usuario.nombre}.`);
    } catch (e) {
      this.errorCrear.set(mensajeDe(e));
    }
  }

  protected cambiarRol(usuario: UsuarioConRol, evento: Event): void {
    const select = evento.target as HTMLSelectElement;
    try {
      this.usuarios.cambiarRol(usuario.id, Number(select.value));
      this.interfaz.exito(`El rol de ${usuario.nombre} quedó actualizado.`);
    } catch (e) {
      select.value = String(usuario.rolId); // se deshace la elección
      this.interfaz.error(mensajeDe(e));
    }
  }

  protected async cambiarEstado(usuario: UsuarioConRol): Promise<void> {
    const bloquear = usuario.estado === 'ACTIVO';
    const respuesta = await this.interfaz.confirmar({
      titulo: bloquear ? 'Bloquear cuenta' : 'Desbloquear cuenta',
      mensaje: bloquear
        ? `${usuario.nombre} no podrá iniciar sesión hasta que se desbloquee su cuenta.`
        : `${usuario.nombre} podrá volver a iniciar sesión.`,
      textoConfirmar: bloquear ? 'Bloquear' : 'Desbloquear',
      peligro: bloquear,
    });
    if (respuesta === null) return;
    try {
      this.usuarios.cambiarEstado(usuario.id, bloquear ? 'BLOQUEADO' : 'ACTIVO');
      this.interfaz.exito(bloquear ? 'Cuenta bloqueada.' : 'Cuenta desbloqueada.');
    } catch (e) {
      this.interfaz.error(mensajeDe(e));
    }
  }

  protected async eliminar(usuario: UsuarioConRol): Promise<void> {
    const respuesta = await this.interfaz.confirmar({
      titulo: 'Eliminar cuenta',
      mensaje: `Se eliminará la cuenta de ${usuario.nombre} (${usuario.email}). Sus publicaciones seguirán en el foro. Esta acción no se puede deshacer.`,
      textoConfirmar: 'Eliminar cuenta',
      peligro: true,
    });
    if (respuesta === null) return;
    try {
      this.usuarios.eliminar(usuario.id);
      this.interfaz.exito('Cuenta eliminada.');
    } catch (e) {
      this.interfaz.error(mensajeDe(e));
    }
  }
}
