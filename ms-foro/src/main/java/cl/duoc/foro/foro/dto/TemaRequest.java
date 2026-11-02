package cl.duoc.foro.foro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Publicar un tema. El autor sale del token, no se envía. */
public record TemaRequest(
        @NotNull(message = "La categoría es obligatoria")
        Long categoriaId,

        @NotBlank(message = "El título es obligatorio")
        @Size(min = 5, max = 150, message = "El título debe tener entre 5 y 150 caracteres")
        String titulo,

        @NotBlank(message = "El contenido es obligatorio")
        @Size(max = 4000, message = "El contenido no puede superar 4000 caracteres")
        String contenido) {
}
