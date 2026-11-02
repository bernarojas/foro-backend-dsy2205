package cl.duoc.foro.foro.dto;

import jakarta.validation.constraints.Size;

/** Modificar un tema: todos los campos son opcionales, solo se cambia lo que viene. */
public record TemaActualizarRequest(
        Long categoriaId,

        @Size(min = 5, max = 150, message = "El título debe tener entre 5 y 150 caracteres")
        String titulo,

        @Size(min = 1, max = 4000, message = "El contenido debe tener entre 1 y 4000 caracteres")
        String contenido) {
}
