import { Injectable, signal } from '@angular/core';

export interface Aviso {
  id: number;
  tipo: 'exito' | 'error' | 'info';
  texto: string;
}

export interface OpcionesDialogo {
  titulo: string;
  mensaje: string;
  textoConfirmar: string;
  /** Pinta el botón en rojo: para eliminar, banear o bloquear. */
  peligro?: boolean;
  /** Si viene, el diálogo pide un texto (motivo del baneo, contraseña para confirmar…). */
  campo?: {
    etiqueta: string;
    tipo: 'texto' | 'clave';
    minimo: number;
    maximo: number;
    ayuda?: string;
  };
}

export interface DialogoAbierto extends OpcionesDialogo {
  resolver: (respuesta: string | null) => void;
}

/**
 * Avisos breves (arriba a la derecha) y diálogo de confirmación.
 * Los dibujan los componentes <app-avisos> y <app-dialogo>, que están una sola vez en la raíz.
 */
@Injectable({ providedIn: 'root' })
export class InterfazService {
  private contador = 0;

  readonly avisos = signal<Aviso[]>([]);
  readonly dialogo = signal<DialogoAbierto | null>(null);

  exito(texto: string): void {
    this.avisar('exito', texto);
  }

  error(texto: string): void {
    this.avisar('error', texto);
  }

  info(texto: string): void {
    this.avisar('info', texto);
  }

  cerrarAviso(id: number): void {
    this.avisos.update((lista) => lista.filter((aviso) => aviso.id !== id));
  }

  /**
   * Abre el diálogo y espera la respuesta: null si se cancela; si se confirma,
   * el texto escrito (o una cadena vacía cuando el diálogo no pide texto).
   */
  confirmar(opciones: OpcionesDialogo): Promise<string | null> {
    return new Promise((resolve) => {
      this.dialogo.set({
        ...opciones,
        resolver: (respuesta) => {
          this.dialogo.set(null);
          resolve(respuesta);
        },
      });
    });
  }

  private avisar(tipo: Aviso['tipo'], texto: string): void {
    const id = ++this.contador;
    this.avisos.update((lista) => [...lista, { id, tipo, texto }]);
    setTimeout(() => this.cerrarAviso(id), 4500);
  }
}
