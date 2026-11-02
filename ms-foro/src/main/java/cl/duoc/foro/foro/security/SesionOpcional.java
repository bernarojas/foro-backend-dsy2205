package cl.duoc.foro.foro.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marca un parámetro UsuarioSesion que puede venir vacío (endpoint público).
 * Sin esta anotación, el endpoint exige iniciar sesión y responde 401 si no hay token.
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface SesionOpcional {
}
