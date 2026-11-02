package cl.duoc.foro.usuarios.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.duoc.foro.usuarios.dto.LoginRequest;
import cl.duoc.foro.usuarios.dto.LoginResponse;
import cl.duoc.foro.usuarios.dto.UsuarioResponse;
import cl.duoc.foro.usuarios.exception.ApiException;
import cl.duoc.foro.usuarios.model.EstadoUsuario;
import cl.duoc.foro.usuarios.model.Usuario;
import cl.duoc.foro.usuarios.repository.UsuarioRepository;
import cl.duoc.foro.usuarios.security.JwtService;

@Service
public class AuthService {

    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UsuarioRepository usuarios, PasswordEncoder encoder, JwtService jwt) {
        this.usuarios = usuarios;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest req) {
        // El mismo mensaje para correo inexistente y clave mala: así no se puede
        // averiguar qué correos tienen cuenta.
        Usuario u = usuarios.findByEmailIgnoreCase(req.email().trim())
                .filter(x -> encoder.matches(req.password(), x.getPasswordHash()))
                .orElseThrow(() -> ApiException.noAutenticado("Correo o clave incorrectos"));

        if (u.getEstado() == EstadoUsuario.BLOQUEADO) {
            throw ApiException.prohibido("Tu cuenta está bloqueada. Contacta a un administrador.");
        }

        JwtService.TokenEmitido token = jwt.emitir(u);
        return new LoginResponse(token.token(), "Bearer", token.expira(), UsuarioResponse.de(u));
    }
}
