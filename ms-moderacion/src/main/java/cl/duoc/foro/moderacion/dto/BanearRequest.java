package cl.duoc.foro.moderacion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Banear un tema o un comentario: hay que indicar el motivo. El moderador sale del token. */
public record BanearRequest(
        @NotBlank(message = "El motivo es obligatorio")
        @Size(max = 300, message = "El motivo no puede superar 300 caracteres")
        String motivo) {
}
