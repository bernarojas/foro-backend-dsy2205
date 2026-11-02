package cl.duoc.foro.usuarios.security;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import cl.duoc.foro.usuarios.exception.ApiException;
import cl.duoc.foro.usuarios.model.EstadoUsuario;
import cl.duoc.foro.usuarios.model.Usuario;
import cl.duoc.foro.usuarios.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Lee el token de cada solicitud. Si viene, lo valida y deja al usuario en la solicitud.
 * Además vuelve a leer al usuario de la base: si lo bloquearon o le cambiaron el rol,
 * se aplica de inmediato aunque su token sea anterior.
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String ATRIBUTO = "usuarioSesion";

    private final JwtService jwt;
    private final UsuarioRepository usuarios;

    public AuthInterceptor(JwtService jwt, UsuarioRepository usuarios) {
        this.jwt = jwt;
        this.usuarios = usuarios;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String cabecera = request.getHeader("Authorization");
        if (cabecera == null || cabecera.isBlank()) {
            return true; // sin sesión: cada endpoint decide si la exige
        }
        if (!cabecera.startsWith("Bearer ")) {
            throw ApiException.noAutenticado("La cabecera Authorization debe ser \"Bearer <token>\"");
        }

        UsuarioSesion delToken = jwt.validar(cabecera.substring(7).trim());
        Usuario actual = usuarios.findById(delToken.id())
                .orElseThrow(() -> ApiException.noAutenticado("El usuario del token ya no existe"));
        if (actual.getEstado() == EstadoUsuario.BLOQUEADO) {
            throw ApiException.prohibido("Tu cuenta está bloqueada");
        }

        request.setAttribute(ATRIBUTO, new UsuarioSesion(
                actual.getId(), actual.getNombre(), actual.getEmail(), actual.getRol().getNombre()));
        return true;
    }
}
