package cl.duoc.foro.foro.security;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import cl.duoc.foro.foro.exception.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/** Lee el token de cada solicitud: si viene, lo valida y deja al usuario en la solicitud. */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String ATRIBUTO = "usuarioSesion";

    private final JwtService jwt;

    public AuthInterceptor(JwtService jwt) {
        this.jwt = jwt;
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
        request.setAttribute(ATRIBUTO, jwt.validar(cabecera.substring(7).trim()));
        return true;
    }
}
