package cl.duoc.foro.moderacion.dto;

import jakarta.validation.constraints.Size;

/** Restaurar un tema o un comentario baneado: el motivo es opcional (el cuerpo puede no venir). */
public record RestaurarRequest(
        @Size(max = 300, message = "El motivo no puede superar 300 caracteres")
        String motivo) {
}
