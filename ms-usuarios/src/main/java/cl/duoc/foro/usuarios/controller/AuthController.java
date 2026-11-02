package cl.duoc.foro.usuarios.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.foro.usuarios.dto.LoginRequest;
import cl.duoc.foro.usuarios.dto.LoginResponse;
import cl.duoc.foro.usuarios.dto.UsuarioResponse;
import cl.duoc.foro.usuarios.security.UsuarioSesion;
import cl.duoc.foro.usuarios.service.AuthService;
import cl.duoc.foro.usuarios.service.UsuarioService;
import jakarta.validation.Valid;

/** Inicio de sesión. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;
    private final UsuarioService usuarios;

    public AuthController(AuthService auth, UsuarioService usuarios) {
        this.auth = auth;
        this.usuarios = usuarios;
    }

    /** POST /api/auth/login  -> token + datos del usuario */
    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        return auth.login(req);
    }

    /** GET /api/auth/me  -> el usuario de la sesión actual */
    @GetMapping("/me")
    public UsuarioResponse yo(UsuarioSesion sesion) {
        return usuarios.obtener(sesion.id(), sesion);
    }
}
