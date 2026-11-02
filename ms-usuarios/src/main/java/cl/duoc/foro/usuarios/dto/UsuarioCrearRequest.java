package cl.duoc.foro.usuarios.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Registro de un usuario. Cualquiera puede registrarse como USUARIO;
 * solo un ADMINISTRADOR puede indicar otro rol (rolId).
 */
public record UsuarioCrearRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
        String nombre,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato válido")
        @Size(max = 120, message = "El correo no puede superar 120 caracteres")
        String email,

        @NotBlank(message = "La clave es obligatoria")
        @Size(min = 8, max = 60, message = "La clave debe tener entre 8 y 60 caracteres")
        String password,

        Long rolId) {
}
