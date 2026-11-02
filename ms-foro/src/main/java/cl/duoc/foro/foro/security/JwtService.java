package cl.duoc.foro.foro.security;

import java.nio.charset.StandardCharsets;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import cl.duoc.foro.foro.exception.ApiException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Valida el token que emite ms-usuarios en el login. Los dos microservicios
 * comparten la clave de firma, así que este no necesita llamar al otro.
 */
@Service
public class JwtService {

    private final SecretKey clave;

    public JwtService(@Value("${app.jwt.secret}") String secreto) {
        if (secreto.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("app.jwt.secret debe tener al menos 32 caracteres");
        }
        this.clave = Keys.hmacShaKeyFor(secreto.getBytes(StandardCharsets.UTF_8));
    }

    public UsuarioSesion validar(String token) {
        try {
            Claims c = Jwts.parser().verifyWith(clave).build().parseSignedClaims(token).getPayload();
            return new UsuarioSesion(
                    Long.valueOf(c.getSubject()),
                    c.get("nombre", String.class),
                    c.get("email", String.class),
                    c.get("rol", String.class));
        } catch (ExpiredJwtException e) {
            throw ApiException.noAutenticado("La sesión expiró: vuelve a iniciar sesión");
        } catch (JwtException | IllegalArgumentException e) {
            throw ApiException.noAutenticado("El token de sesión no es válido");
        }
    }
}
