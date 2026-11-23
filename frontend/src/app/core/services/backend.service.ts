import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

/** Los tres microservicios y la ruta por la que nginx llega a cada uno. */
export type Servicio = 'usuarios' | 'foro' | 'moderacion';

const RUTAS: Record<Servicio, string> = {
  usuarios: '/servicios/usuarios', // → ms-usuarios:8081/api
  foro: '/servicios/foro', // → ms-foro:8082/api
  moderacion: '/servicios/moderacion', // → ms-moderacion:8083/api
};

/** Una petición HTTP hecha al BackEnd, para mostrarla en la pantalla. */
export interface Peticion {
  id: number;
  servicio: Servicio;
  metodo: 'GET' | 'POST';
  ruta: string;
  /** Código HTTP; 0 si el microservicio no respondió. */
  codigo: number;
  milisegundos: number;
  hora: string;
}

export interface Respuesta<T> {
  ok: boolean;
  codigo: number;
  milisegundos: number;
  datos: T | null;
  /** Mensaje de error que devolvió el microservicio, si lo hubo. */
  mensaje: string | null;
}

// Formato de las respuestas de los microservicios (solo los campos que usa el panel)
export interface RolApi { id: number; nombre: string; cantidadUsuarios: number }
export interface CategoriaApi { id: number; nombre: string; cantidadTemas: number; cantidadComentarios: number }
export interface EstadoApi { servicio: string; hora: string }
export interface LoginApi { token: string; expira: string; usuario: { id: number; nombre: string; email: string; rol: string } }
export interface ResumenRolApi { rol: string; totalUsuarios: number; activos: number; bloqueados: number }
export interface ResumenModeracionApi {
  temas: { publicados: number; baneados: number; total: number };
  comentarios: { publicados: number; baneados: number; total: number };
  totalAcciones: number;
  moderadores: { moderadorNombre: string; baneos: number; restauraciones: number; total: number }[];
}

/**
 * Peticiones HTTP reales a los microservicios, para la pantalla "Conexión con el BackEnd".
 *
 * En esta entrega la aplicación maneja su información con arreglos (ver core/repositories);
 * este servicio solo comprueba que el contenedor del FrontEnd se comunica con los
 * contenedores del BackEnd y, a través de ellos, con la base de datos Oracle.
 */
@Injectable({ providedIn: 'root' })
export class BackendService {
  private readonly http = inject(HttpClient);
  private contador = 0;

  /** Registro de las peticiones hechas, de la más nueva a la más antigua. */
  readonly peticiones = signal<Peticion[]>([]);

  roles(): Promise<Respuesta<RolApi[]>> {
    return this.pedir('usuarios', 'GET', '/roles');
  }

  categorias(): Promise<Respuesta<CategoriaApi[]>> {
    return this.pedir('foro', 'GET', '/categorias');
  }

  estadoModeracion(): Promise<Respuesta<EstadoApi>> {
    return this.pedir('moderacion', 'GET', '/estado');
  }

  /** Inicio de sesión real en ms-usuarios: devuelve el token JWT. */
  iniciarSesion(email: string, password: string): Promise<Respuesta<LoginApi>> {
    return this.pedir('usuarios', 'POST', '/auth/login', { cuerpo: { email, password } });
  }

  /** Protegido: usuarios por rol (ms-usuarios valida el token). */
  resumenRoles(token: string): Promise<Respuesta<ResumenRolApi[]>> {
    return this.pedir('usuarios', 'GET', '/usuarios/resumen-roles', { token });
  }

  /** Protegido: resumen de moderación (ms-moderacion valida el mismo token). */
  resumenModeracion(token: string): Promise<Respuesta<ResumenModeracionApi>> {
    return this.pedir('moderacion', 'GET', '/moderacion/resumen', { token });
  }

  limpiarRegistro(): void {
    this.peticiones.set([]);
  }

  private async pedir<T>(
    servicio: Servicio,
    metodo: 'GET' | 'POST',
    ruta: string,
    opciones: { cuerpo?: unknown; token?: string } = {},
  ): Promise<Respuesta<T>> {
    const url = RUTAS[servicio] + ruta;
    const headers = opciones.token ? new HttpHeaders({ Authorization: `Bearer ${opciones.token}` }) : undefined;
    const inicio = performance.now();
    let respuesta: Respuesta<T>;

    try {
      const r = await firstValueFrom(
        this.http.request<T>(metodo, url, { body: opciones.cuerpo, headers, observe: 'response' }),
      );
      respuesta = { ok: true, codigo: r.status, milisegundos: 0, datos: r.body, mensaje: null };
    } catch (e) {
      const error = e as HttpErrorResponse;
      // Los microservicios devuelven sus errores como JSON con un campo "mensaje".
      const mensaje = typeof error.error?.mensaje === 'string' ? error.error.mensaje : null;
      respuesta = { ok: false, codigo: error.status ?? 0, milisegundos: 0, datos: null, mensaje };
    }

    respuesta.milisegundos = Math.round(performance.now() - inicio);
    this.peticiones.update((lista) => [
      {
        id: ++this.contador,
        servicio,
        metodo,
        ruta: `/api${ruta}`,
        codigo: respuesta.codigo,
        milisegundos: respuesta.milisegundos,
        hora: new Date().toISOString(),
      },
      ...lista,
    ]);
    return respuesta;
  }
}
