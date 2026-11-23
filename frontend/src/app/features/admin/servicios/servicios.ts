import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import {
  BackendService,
  LoginApi,
  Respuesta,
  ResumenModeracionApi,
  ResumenRolApi,
  Servicio,
} from '../../../core/services/backend.service';
import { correo, mensajeDeError, obligatorio } from '../../../core/validators/validadores';

interface TarjetaServicio {
  servicio: Servicio;
  nombre: string;
  puerto: number;
  descripcion: string;
  /** null mientras no se ha consultado. */
  enLinea: boolean | null;
  codigo: number;
  milisegundos: number;
  /** Lo que respondió, ya resumido para mostrar. */
  datos: { etiqueta: string; valor: string }[];
}

const TARJETAS: TarjetaServicio[] = [
  { servicio: 'usuarios', nombre: 'ms-usuarios', puerto: 8081, descripcion: 'Usuarios, roles e inicio de sesión', enLinea: null, codigo: 0, milisegundos: 0, datos: [] },
  { servicio: 'foro', nombre: 'ms-foro', puerto: 8082, descripcion: 'Categorías, temas y comentarios', enLinea: null, codigo: 0, milisegundos: 0, datos: [] },
  { servicio: 'moderacion', nombre: 'ms-moderacion', puerto: 8083, descripcion: 'Baneos, restauraciones e historial', enLinea: null, codigo: 0, milisegundos: 0, datos: [] },
];

/**
 * Conexión con el BackEnd (solo ADMINISTRADOR): hace peticiones HTTP reales a los tres
 * microservicios para comprobar que los contenedores se comunican entre sí y con Oracle.
 * El resto de la aplicación sigue trabajando con arreglos.
 */
@Component({
  selector: 'app-admin-servicios',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './servicios.html',
})
export class AdminServicios {
  protected readonly backend = inject(BackendService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly tarjetas = signal<TarjetaServicio[]>(TARJETAS);
  protected readonly consultando = signal(false);

  // Consulta con sesión (token JWT)
  protected readonly form = this.fb.group({
    email: [this.auth.usuario()?.email ?? '', [obligatorio, correo]],
    password: ['', [obligatorio]],
  });
  protected readonly ingresando = signal(false);
  protected readonly errorSesion = signal<string | null>(null);
  protected readonly sesion = signal<LoginApi | null>(null);
  protected readonly porRol = signal<Respuesta<ResumenRolApi[]> | null>(null);
  protected readonly moderacion = signal<Respuesta<ResumenModeracionApi> | null>(null);

  constructor() {
    void this.consultar();
  }

  protected error(campo: 'email' | 'password'): string | null {
    return mensajeDeError(this.form.controls[campo]);
  }

  /** Consultas públicas a los tres microservicios (cada una lee de Oracle o confirma que el servicio está arriba). */
  protected async consultar(): Promise<void> {
    this.consultando.set(true);
    const [roles, categorias, estado] = await Promise.all([
      this.backend.roles(),
      this.backend.categorias(),
      this.backend.estadoModeracion(),
    ]);

    this.actualizar('usuarios', roles, (lista) => [
      { etiqueta: 'Roles en FORO_ROL', valor: String(lista.length) },
      { etiqueta: 'Usuarios en FORO_USUARIO', valor: String(lista.reduce((suma, r) => suma + r.cantidadUsuarios, 0)) },
    ]);
    this.actualizar('foro', categorias, (lista) => [
      { etiqueta: 'Categorías en FORO_CATEGORIA', valor: String(lista.length) },
      { etiqueta: 'Temas publicados', valor: String(lista.reduce((suma, c) => suma + c.cantidadTemas, 0)) },
      { etiqueta: 'Comentarios publicados', valor: String(lista.reduce((suma, c) => suma + c.cantidadComentarios, 0)) },
    ]);
    this.actualizar('moderacion', estado, (e) => [
      { etiqueta: 'Servicio', valor: e.servicio },
      { etiqueta: 'Hora del contenedor', valor: e.hora.slice(11, 19) },
    ]);
    this.consultando.set(false);
  }

  /** Inicio de sesión real y, con el token, dos consultas protegidas en microservicios distintos. */
  protected async consultarConSesion(): Promise<void> {
    this.errorSesion.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.ingresando.set(true);
    const { email, password } = this.form.getRawValue();
    const login = await this.backend.iniciarSesion(email.trim().toLowerCase(), password);

    if (!login.ok || !login.datos) {
      this.sesion.set(null);
      this.porRol.set(null);
      this.moderacion.set(null);
      this.errorSesion.set(
        login.codigo === 0 || login.codigo >= 500
          ? 'ms-usuarios no respondió. Revisa que los contenedores estén arriba.'
          : `${login.mensaje ?? 'No se pudo iniciar sesión'} (HTTP ${login.codigo}).`,
      );
      this.ingresando.set(false);
      return;
    }

    this.sesion.set(login.datos);
    this.form.controls.password.reset();
    const [porRol, moderacion] = await Promise.all([
      this.backend.resumenRoles(login.datos.token),
      this.backend.resumenModeracion(login.datos.token),
    ]);
    this.porRol.set(porRol);
    this.moderacion.set(moderacion);
    this.ingresando.set(false);
  }

  protected cerrarSesionBackend(): void {
    this.sesion.set(null);
    this.porRol.set(null);
    this.moderacion.set(null);
  }

  private actualizar<T>(
    servicio: Servicio,
    respuesta: Respuesta<T>,
    resumir: (datos: T) => { etiqueta: string; valor: string }[],
  ): void {
    this.tarjetas.update((lista) =>
      lista.map((tarjeta) =>
        tarjeta.servicio !== servicio
          ? tarjeta
          : {
              ...tarjeta,
              enLinea: respuesta.ok,
              codigo: respuesta.codigo,
              milisegundos: respuesta.milisegundos,
              datos: respuesta.ok && respuesta.datos !== null ? resumir(respuesta.datos) : [],
            },
      ),
    );
  }
}
