import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { NombreRol } from '../models/modelos';
import { AuthService } from '../services/auth.service';
import { InterfazService } from '../services/interfaz.service';

/** Solo con sesión iniciada. Si no hay, manda a "Ingresar" y recuerda a dónde quería ir. */
export const conSesion: CanActivateFn = (_ruta, estado) => {
  const auth = inject(AuthService);
  if (auth.haySesion()) return true;
  return inject(Router).createUrlTree(['/ingresar'], { queryParams: { volver: estado.url } });
};

/** Solo sin sesión: quien ya ingresó no tiene nada que hacer en "Ingresar" o "Registro". */
export const soloInvitados: CanActivateFn = () => {
  return inject(AuthService).haySesion() ? inject(Router).createUrlTree(['/']) : true;
};

/** Solo para los roles indicados. Es lo que separa los privilegios de cada tipo de usuario. */
export function conRol(...roles: NombreRol[]): CanActivateFn {
  return (_ruta, estado) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.haySesion()) {
      return router.createUrlTree(['/ingresar'], { queryParams: { volver: estado.url } });
    }
    const rol = auth.rol();
    if (rol && roles.includes(rol)) return true;
    inject(InterfazService).error('Tu rol no tiene permiso para entrar a esa sección.');
    return router.createUrlTree(['/']);
  };
}
