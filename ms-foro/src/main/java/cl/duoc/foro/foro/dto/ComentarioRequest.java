package cl.duoc.foro.foro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Comentar un tema (o corregir un comentario). El autor sale del token. */
public record ComentarioRequest(
        @NotBlank(message = "El comentario no puede estar vacío")
        @Size(max = 2000, message = "El comentario no puede superar 2000 caracteres")
        String contenido) {
}
