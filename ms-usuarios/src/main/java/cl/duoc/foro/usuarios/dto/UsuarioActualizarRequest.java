package cl.duoc.foro.usuarios.dto;

import cl.duoc.foro.usuarios.model.EstadoUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

/**
 * Modificación de un usuario. Todos los campos son opcionales: solo se cambia lo que viene.
 * rolId y estado solo los puede cambiar un ADMINISTRADOR.
 */
public record UsuarioActualizarRequest(
        @Size(min = 1, max = 100, message = "El nombre debe tener entre 1 y 100 caracteres")
        String nombre,

        @Email(message = "El correo no tiene un formato válido")
        @Size(max = 120, message = "El correo no puede superar 120 caracteres")
        String email,

        @Size(min = 8, max = 60, message = "La clave debe tener entre 8 y 60 caracteres")
        String password,

        Long rolId,

        EstadoUsuario estado) {
}
