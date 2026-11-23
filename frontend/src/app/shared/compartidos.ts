import { Component, Pipe, PipeTransform, computed, effect, inject, input, signal } from '@angular/core';
import { NombreRol } from '../core/models/modelos';
import { InterfazService } from '../core/services/interfaz.service';
import { REQUISITOS_CLAVE } from '../core/validators/validadores';

/**
 * Piezas pequeñas que se repiten en varias pantallas.
 */

// ------------------------------------------------------------------ Fechas

/** "hace 3 horas", "ayer", "hace 2 meses"… */
@Pipe({ name: 'haceCuanto' })
export class HaceCuantoPipe implements PipeTransform {
  transform(fecha: string | null | undefined): string {
    if (!fecha) return '';
    const segundos = Math.max(0, Math.round((Date.now() - new Date(fecha).getTime()) / 1000));
    if (segundos < 60) return 'hace un momento';
    const minutos = Math.round(segundos / 60);
    if (minutos < 60) return `hace ${minutos} min`;
    const horas = Math.round(minutos / 60);
    if (horas < 24) return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    const dias = Math.round(horas / 24);
    if (dias === 1) return 'ayer';
    if (dias < 30) return `hace ${dias} días`;
    const meses = Math.round(dias / 30);
    if (meses < 12) return `hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    const anios = Math.round(meses / 12);
    return `hace ${anios} ${anios === 1 ? 'año' : 'años'}`;
  }
}

// ------------------------------------------------------------------ Avatar

/** Círculo con las iniciales del usuario. */
@Component({
  selector: 'app-avatar',
  template: `<span class="avatar" [class.avatar-lg]="grande()" [style.background-color]="color()" aria-hidden="true">{{ iniciales() }}</span>`,
})
export class Avatar {
  readonly nombre = input.required<string>();
  readonly color = input('#8a8f9c');
  readonly grande = input(false);

  protected readonly iniciales = computed(() => {
    const partes = this.nombre().trim().split(/\s+/).filter(Boolean);
    const primera = partes[0]?.[0] ?? '?';
    const segunda = partes.length > 1 ? partes[partes.length - 1][0] : '';
    return (primera + segunda).toUpperCase();
  });
}

// ------------------------------------------------------------------ Rol

/** Etiqueta de color con el rol. */
@Component({
  selector: 'app-rol',
  template: `<span class="badge rol" [class]="'rol-' + rol().toLowerCase()">{{ nombre() }}</span>`,
})
export class EtiquetaRol {
  readonly rol = input.required<NombreRol>();
  protected readonly nombre = computed(
    () => ({ ADMINISTRADOR: 'Administrador', MODERADOR: 'Moderador', USUARIO: 'Usuario' })[this.rol()],
  );
}

// ------------------------------------------------------------------ Requisitos de la contraseña

/** Lista de requisitos de la contraseña: se van marcando mientras se escribe. */
@Component({
  selector: 'app-requisitos-clave',
  template: `
    <div class="requisitos" aria-live="polite">
      <div class="fuerza" [attr.data-nivel]="nivel()">
        <span></span><span></span><span></span><span></span>
      </div>
      <p class="small mb-1 text-secondary">Seguridad: <strong>{{ etiqueta() }}</strong></p>
      <ul class="list-unstyled small mb-0">
        @for (requisito of requisitos(); track requisito.texto) {
          <li [class.cumple]="requisito.cumple">
            <i class="bi" [class.bi-check-circle-fill]="requisito.cumple" [class.bi-circle]="!requisito.cumple"></i>
            {{ requisito.texto }}
          </li>
        }
      </ul>
    </div>
  `,
})
export class RequisitosClave {
  readonly valor = input('');

  protected readonly requisitos = computed(() =>
    REQUISITOS_CLAVE.map((r) => ({ texto: r.texto, cumple: r.cumple(this.valor()) })),
  );

  /** De 0 a 4 según cuántos requisitos se cumplen. */
  protected readonly nivel = computed(() => {
    if (this.valor().length === 0) return 0;
    const cumplidos = this.requisitos().filter((r) => r.cumple).length;
    return cumplidos === REQUISITOS_CLAVE.length ? 4 : cumplidos >= 5 ? 3 : cumplidos >= 3 ? 2 : 1;
  });

  protected readonly etiqueta = computed(() => ['sin escribir', 'débil', 'regular', 'buena', 'segura'][this.nivel()]);
}

// ------------------------------------------------------------------ Avisos

/** Avisos breves arriba a la derecha (publicado, guardado, error…). */
@Component({
  selector: 'app-avisos',
  template: `
    <div class="avisos" aria-live="polite" aria-atomic="true">
      @for (aviso of interfaz.avisos(); track aviso.id) {
        <div class="aviso" [class]="'aviso-' + aviso.tipo" role="status">
          <i class="bi" [class.bi-check-circle-fill]="aviso.tipo === 'exito'"
             [class.bi-exclamation-triangle-fill]="aviso.tipo === 'error'"
             [class.bi-info-circle-fill]="aviso.tipo === 'info'"></i>
          <span>{{ aviso.texto }}</span>
          <button type="button" class="btn-close btn-close-white" aria-label="Cerrar aviso" (click)="interfaz.cerrarAviso(aviso.id)"></button>
        </div>
      }
    </div>
  `,
})
export class Avisos {
  protected readonly interfaz = inject(InterfazService);
}

// ------------------------------------------------------------------ Diálogo de confirmación

/** Diálogo de confirmación; puede pedir un texto (motivo del baneo o contraseña). */
@Component({
  selector: 'app-dialogo',
  template: `
    @if (interfaz.dialogo(); as d) {
      <div class="modal-backdrop fade show"></div>
      <div class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="dialogoTitulo"
           (click)="cancelar()" (keydown.escape)="cancelar()">
        <div class="modal-dialog modal-dialog-centered" (click)="$event.stopPropagation()">
          <form class="modal-content" (submit)="$event.preventDefault(); confirmar()" novalidate>
            <div class="modal-header">
              <h2 class="modal-title h5" id="dialogoTitulo">{{ d.titulo }}</h2>
              <button type="button" class="btn-close" aria-label="Cerrar" (click)="cancelar()"></button>
            </div>
            <div class="modal-body">
              <p class="mb-0">{{ d.mensaje }}</p>
              @if (d.campo; as campo) {
                <label class="form-label mt-3" for="dialogoCampo">{{ campo.etiqueta }}</label>
                @if (campo.tipo === 'clave') {
                  <input id="dialogoCampo" type="password" class="form-control" autocomplete="current-password"
                         [class.is-invalid]="error()" [value]="texto()" (input)="escribir($event)">
                } @else {
                  <textarea id="dialogoCampo" class="form-control" rows="3" [attr.maxlength]="campo.maximo"
                            [class.is-invalid]="error()" [value]="texto()" (input)="escribir($event)"></textarea>
                }
                @if (error(); as mensaje) {
                  <div class="invalid-feedback d-block">{{ mensaje }}</div>
                } @else if (campo.ayuda) {
                  <div class="form-text">{{ campo.ayuda }}</div>
                }
              }
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" (click)="cancelar()">Cancelar</button>
              <button type="submit" class="btn" [class.btn-danger]="d.peligro" [class.btn-primary]="!d.peligro">
                {{ d.textoConfirmar }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class Dialogo {
  protected readonly interfaz = inject(InterfazService);
  protected readonly texto = signal('');
  protected readonly error = signal<string | null>(null);

  constructor() {
    // Cada vez que se abre un diálogo nuevo, parte limpio.
    effect(() => {
      if (this.interfaz.dialogo()) {
        this.texto.set('');
        this.error.set(null);
      }
    });
  }

  protected escribir(evento: Event): void {
    this.texto.set((evento.target as HTMLInputElement | HTMLTextAreaElement).value);
    this.error.set(null);
  }

  protected cancelar(): void {
    this.interfaz.dialogo()?.resolver(null);
  }

  protected confirmar(): void {
    const dialogo = this.interfaz.dialogo();
    if (!dialogo) return;
    const campo = dialogo.campo;
    if (campo) {
      const valor = campo.tipo === 'clave' ? this.texto() : this.texto().trim();
      if (valor.length === 0) {
        this.error.set('Este campo es obligatorio.');
        return;
      }
      if (valor.length < campo.minimo) {
        this.error.set(`Debe tener al menos ${campo.minimo} caracteres (llevas ${valor.length}).`);
        return;
      }
      if (valor.length > campo.maximo) {
        this.error.set(`No puede superar ${campo.maximo} caracteres.`);
        return;
      }
      dialogo.resolver(valor);
      return;
    }
    dialogo.resolver('');
  }
}
