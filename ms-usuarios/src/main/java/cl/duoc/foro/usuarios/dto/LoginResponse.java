package cl.duoc.foro.usuarios.dto;

import java.time.LocalDateTime;

public record LoginResponse(
        String token,
        String tipo,
        LocalDateTime expira,
        UsuarioResponse usuario) {
}
