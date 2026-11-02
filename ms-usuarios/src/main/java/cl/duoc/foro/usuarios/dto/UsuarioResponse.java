package cl.duoc.foro.usuarios.dto;

import java.time.LocalDateTime;

import cl.duoc.foro.usuarios.model.EstadoUsuario;
import cl.duoc.foro.usuarios.model.Usuario;

public record UsuarioResponse(
        Long id,
        String nombre,
        String email,
        Long rolId,
        String rol,
        EstadoUsuario estado,
        LocalDateTime fechaRegistro) {

    public static UsuarioResponse de(Usuario u) {
        return new UsuarioResponse(
                u.getId(),
                u.getNombre(),
                u.getEmail(),
                u.getRol().getId(),
                u.getRol().getNombre(),
                u.getEstado(),
                u.getFechaRegistro());
    }
}
