import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Página para direcciones que no existen. */
@Component({
  selector: 'app-no-encontrada',
  imports: [RouterLink],
  template: `
    <div class="container pagina">
      <div class="tarjeta vacio">
        <img src="imagenes/vacio.svg" alt="">
        <h1 class="h3">No encontramos esa página</h1>
        <p class="mb-3">La dirección no existe o cambió de lugar.</p>
        <div class="d-flex flex-wrap justify-content-center gap-2">
          <a class="btn btn-primary" routerLink="/">Ir al inicio</a>
          <a class="btn btn-outline-primary" routerLink="/buscar">Buscar temas</a>
        </div>
      </div>
    </div>
  `,
})
export class NoEncontrada {}
