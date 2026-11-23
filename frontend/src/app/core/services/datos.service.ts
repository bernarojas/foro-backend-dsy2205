import { Injectable, inject } from '@angular/core';
import {
  CategoriaRepository,
  ComentarioRepository,
  ModeracionRepository,
  RolRepository,
  TemaRepository,
  UsuarioRepository,
} from '../repositories/repositorios';
import { AuthService } from './auth.service';

/** Vuelve todas las colecciones a los arreglos de ejemplo y cierra la sesión. */
@Injectable({ providedIn: 'root' })
export class DatosService {
  private readonly auth = inject(AuthService);
  private readonly repositorios = [
    inject(RolRepository),
    inject(UsuarioRepository),
    inject(CategoriaRepository),
    inject(TemaRepository),
    inject(ComentarioRepository),
    inject(ModeracionRepository),
  ];

  restablecer(): void {
    this.auth.cerrarSesion();
    for (const repositorio of this.repositorios) {
      repositorio.restablecer();
    }
  }
}
