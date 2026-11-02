package cl.duoc.foro.usuarios.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import cl.duoc.foro.usuarios.exception.ApiException;
import cl.duoc.foro.usuarios.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Emite y valida el token de sesión. El token lleva el id, nombre, correo y rol
 * del usuario, firmado con una clave que comparten los dos microservicios.
 */
@Service
public class JwtService {

    private final SecretKey clave;
    private final long horas;

    public JwtService(@Value("${app.jwt.secret}") String secreto,
                      @Value("${app.jwt.horas}") long horas) {
        if (secreto.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("app.jwt.secret debe tener al menos 32 caracteres");
        }
        this.clave = Keys.hmacShaKeyFor(secreto.getBytes(StandardCharsets.UTF_8));
        this.horas = horas;
    }

    public record TokenEmitido(String token, LocalDateTime expira) {
    }

    public TokenEmitido emitir(Usuario usuario) {
        Instant ahora = Instant.now();
        Instant expira = ahora.plus(horas, ChronoUnit.HOURS);
        String token = Jwts.builder()
                .subject(String.valueOf(usuario.getId()))
                .claim("nombre", usuario.getNombre())
                .claim("email", usuario.getEmail())
                .claim("rol", usuario.getRol().getNombre())
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(expira))
                .signWith(clave)
                .compact();
        return new TokenEmitido(token, LocalDateTime.ofInstant(expira, ZoneId.systemDefault()));
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
