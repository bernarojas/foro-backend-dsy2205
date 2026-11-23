import { Injectable } from '@angular/core';
import {
  CATEGORIAS_INICIALES,
  COMENTARIOS_INICIALES,
  MODERACION_INICIAL,
  ROLES_INICIALES,
  TEMAS_INICIALES,
  USUARIOS_INICIALES,
} from '../data/datos-iniciales';
import { Categoria, Comentario, RegistroModeracion, Rol, Tema, Usuario } from '../models/modelos';
import { RepositorioEnMemoria } from './repositorio-en-memoria';

/**
 * Un repositorio por colección. Son SINGLETON (providedIn: 'root'): toda la aplicación
 * comparte la misma instancia y, por lo tanto, los mismos arreglos.
 */

@Injectable({ providedIn: 'root' })
export class RolRepository extends RepositorioEnMemoria<Rol> {
  constructor() {
    super('roles', ROLES_INICIALES);
  }
}

@Injectable({ providedIn: 'root' })
export class UsuarioRepository extends RepositorioEnMemoria<Usuario> {
  constructor() {
    super('usuarios', USUARIOS_INICIALES);
  }

  porEmail(email: string): Usuario | undefined {
    const buscado = email.trim().toLowerCase();
    return this.items().find((usuario) => usuario.email.toLowerCase() === buscado);
  }
}

@Injectable({ providedIn: 'root' })
export class CategoriaRepository extends RepositorioEnMemoria<Categoria> {
  constructor() {
    super('categorias', CATEGORIAS_INICIALES);
  }
}

@Injectable({ providedIn: 'root' })
export class TemaRepository extends RepositorioEnMemoria<Tema> {
  constructor() {
    super('temas', TEMAS_INICIALES);
  }
}

@Injectable({ providedIn: 'root' })
export class ComentarioRepository extends RepositorioEnMemoria<Comentario> {
  constructor() {
    super('comentarios', COMENTARIOS_INICIALES);
  }
}

@Injectable({ providedIn: 'root' })
export class ModeracionRepository extends RepositorioEnMemoria<RegistroModeracion> {
  constructor() {
    super('moderacion', MODERACION_INICIAL);
  }
}
