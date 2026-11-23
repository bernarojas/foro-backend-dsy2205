import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ForoService } from '../../core/services/foro.service';
import { DatosService } from '../../core/services/datos.service';
import { InterfazService } from '../../core/services/interfaz.service';
import { Avatar, EtiquetaRol } from '../compartidos';

/** Barra de navegación: cambia según haya sesión y según el rol. */
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, Avatar, EtiquetaRol],
  templateUrl: './navbar.html',
})
export class Navbar {
  protected readonly auth = inject(AuthService);
  protected readonly foro = inject(ForoService);
  private readonly interfaz = inject(InterfazService);
  private readonly datos = inject(DatosService);
  private readonly router = inject(Router);

  /** Menú desplegado en pantallas chicas. */
  protected readonly abierto = signal(false);

  constructor() {
    // Al cambiar de página, el menú del celular se cierra.
    this.router.events
      .pipe(
        filter((evento) => evento instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.abierto.set(false));
  }

  protected alternar(): void {
    this.abierto.update((valor) => !valor);
  }

  protected buscar(evento: Event, campo: HTMLInputElement): void {
    evento.preventDefault();
    const texto = campo.value.trim();
    this.router.navigate(['/buscar'], { queryParams: texto ? { q: texto } : {} });
    campo.value = '';
    campo.blur();
  }

  protected cerrarSesion(): void {
    this.auth.cerrarSesion();
    this.interfaz.info('Cerraste tu sesión. ¡Vuelve pronto!');
    this.router.navigate(['/']);
  }

  /** Solo ADMINISTRADOR: vuelve a los datos de ejemplo (útil antes de una demostración). */
  protected async restablecerDatos(): Promise<void> {
    const respuesta = await this.interfaz.confirmar({
      titulo: 'Restablecer datos de ejemplo',
      mensaje: 'Se borrarán todos los cambios hechos en este navegador (cuentas, temas, comentarios y moderación) y el foro volverá a sus datos iniciales. Tendrás que ingresar de nuevo.',
      textoConfirmar: 'Restablecer',
      peligro: true,
    });
    if (respuesta === null) return;
    this.datos.restablecer();
    this.interfaz.info('El foro volvió a sus datos de ejemplo.');
    this.router.navigate(['/']);
  }
}
