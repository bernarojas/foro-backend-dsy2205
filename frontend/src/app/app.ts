import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { Avisos, Dialogo } from './shared/compartidos';
import { Navbar } from './shared/navbar/navbar';

/** Marco de la aplicación: barra de navegación, la página de la ruta actual y el pie. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Navbar, Avisos, Dialogo],
  templateUrl: './app.html',
})
export class App {
  protected readonly auth = inject(AuthService);
  protected readonly anio = new Date().getFullYear();
}
