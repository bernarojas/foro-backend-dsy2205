import { Signal, signal } from '@angular/core';

/**
 * PATRÓN REPOSITORY.
 *
 * Cada repositorio guarda una colección en un arreglo (dentro de un signal) y ofrece
 * las operaciones de un CRUD. Los servicios y las pantallas no saben dónde viven los
 * datos: el día que el FrontEnd se conecte a los microservicios basta con cambiar
 * los repositorios por llamadas HTTP, sin tocar el resto de la aplicación.
 *
 * El arreglo se copia a localStorage solo para que los cambios no se pierdan al
 * recargar la página durante una demostración; la fuente de los datos sigue siendo
 * el arreglo en memoria.
 */
export abstract class RepositorioEnMemoria<T extends { id: number }> {
  private readonly lista = signal<T[]>([]);

  /** La colección completa, de solo lectura. Las pantallas se actualizan solas cuando cambia. */
  readonly items: Signal<T[]> = this.lista.asReadonly();

  protected constructor(
    private readonly nombre: string,
    private readonly iniciales: readonly T[],
  ) {
    this.lista.set(this.leerGuardado() ?? this.copiaDeIniciales());
  }

  porId(id: number): T | undefined {
    return this.lista().find((item) => item.id === id);
  }

  crear(datos: Omit<T, 'id'>): T {
    const nuevo = { ...datos, id: this.siguienteId() } as T;
    this.lista.update((lista) => [...lista, nuevo]);
    this.guardar();
    return nuevo;
  }

  actualizar(id: number, cambios: Partial<Omit<T, 'id'>>): T | undefined {
    let actualizado: T | undefined;
    this.lista.update((lista) =>
      lista.map((item) => {
        if (item.id !== id) return item;
        actualizado = { ...item, ...cambios };
        return actualizado;
      }),
    );
    this.guardar();
    return actualizado;
  }

  /** Cambia varios registros a la vez (por ejemplo, el nombre del autor en todos sus temas). */
  actualizarDonde(condicion: (item: T) => boolean, cambios: Partial<Omit<T, 'id'>>): void {
    this.lista.update((lista) => lista.map((item) => (condicion(item) ? { ...item, ...cambios } : item)));
    this.guardar();
  }

  eliminar(id: number): void {
    this.eliminarDonde((item) => item.id === id);
  }

  eliminarDonde(condicion: (item: T) => boolean): void {
    this.lista.update((lista) => lista.filter((item) => !condicion(item)));
    this.guardar();
  }

  /** Vuelve a los datos de ejemplo. */
  restablecer(): void {
    this.lista.set(this.copiaDeIniciales());
    this.guardar();
  }

  private siguienteId(): number {
    return this.lista().reduce((mayor, item) => Math.max(mayor, item.id), 0) + 1;
  }

  private copiaDeIniciales(): T[] {
    return this.iniciales.map((item) => ({ ...item }));
  }

  private get clave(): string {
    return `tertulia.v1.${this.nombre}`;
  }

  private leerGuardado(): T[] | null {
    try {
      const texto = localStorage.getItem(this.clave);
      const datos: unknown = texto ? JSON.parse(texto) : null;
      return Array.isArray(datos) ? (datos as T[]) : null;
    } catch {
      return null;
    }
  }

  private guardar(): void {
    try {
      localStorage.setItem(this.clave, JSON.stringify(this.lista()));
    } catch {
      // Sin almacenamiento disponible (modo privado): la aplicación sigue funcionando en memoria.
    }
  }
}
