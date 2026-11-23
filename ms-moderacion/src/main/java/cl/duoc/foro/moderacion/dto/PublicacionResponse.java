package cl.duoc.foro.moderacion.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

import cl.duoc.foro.moderacion.model.Comentario;
import cl.duoc.foro.moderacion.model.EstadoPublicacion;
import cl.duoc.foro.moderacion.model.Tema;
import cl.duoc.foro.moderacion.model.TipoPublicacion;

/**
 * Una publicación vista por la moderación: un tema o un comentario.
 * Un tema trae título y categoría; un comentario, el tema al que pertenece.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PublicacionResponse(
        TipoPublicacion tipo,
        Long id,
        String titulo,
        String contenido,
        Long categoriaId,
        String categoria,
        Long temaId,
        String temaTitulo,
        Long autorId,
        String autorNombre,
        EstadoPublicacion estado,
        LocalDateTime fechaCreacion) {

    public static PublicacionResponse de(Tema t) {
        return new PublicacionResponse(TipoPublicacion.TEMA, t.getId(), t.getTitulo(), t.getContenido(),
                t.getCategoria().getId(), t.getCategoria().getNombre(), null, null,
                t.getAutorId(), t.getAutorNombre(), t.getEstado(), t.getFechaCreacion());
    }

    public static PublicacionResponse de(Comentario c) {
        return new PublicacionResponse(TipoPublicacion.COMENTARIO, c.getId(), null, c.getContenido(),
                null, null, c.getTema().getId(), c.getTema().getTitulo(),
                c.getAutorId(), c.getAutorNombre(), c.getEstado(), c.getFechaCreacion());
    }
}
