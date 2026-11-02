package cl.duoc.foro.foro.dto;

import java.time.LocalDateTime;

import cl.duoc.foro.foro.model.Comentario;
import cl.duoc.foro.foro.model.EstadoPublicacion;

public record ComentarioResponse(
        Long id,
        Long temaId,
        Long autorId,
        String autorNombre,
        String contenido,
        EstadoPublicacion estado,
        LocalDateTime fechaCreacion) {

    public static ComentarioResponse de(Comentario c) {
        return new ComentarioResponse(c.getId(), c.getTema().getId(), c.getAutorId(), c.getAutorNombre(),
                c.getContenido(), c.getEstado(), c.getFechaCreacion());
    }
}
