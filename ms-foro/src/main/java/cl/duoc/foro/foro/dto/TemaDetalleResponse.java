package cl.duoc.foro.foro.dto;

import java.time.LocalDateTime;
import java.util.List;

import cl.duoc.foro.foro.model.EstadoPublicacion;
import cl.duoc.foro.foro.model.Tema;

/** Un tema completo, con sus comentarios en orden de llegada. */
public record TemaDetalleResponse(
        Long id,
        String titulo,
        String contenido,
        Long categoriaId,
        String categoria,
        Long autorId,
        String autorNombre,
        EstadoPublicacion estado,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaActualizacion,
        int cantidadComentarios,
        List<ComentarioResponse> comentarios) {

    public static TemaDetalleResponse de(Tema t, List<ComentarioResponse> comentarios) {
        return new TemaDetalleResponse(t.getId(), t.getTitulo(), t.getContenido(),
                t.getCategoria().getId(), t.getCategoria().getNombre(),
                t.getAutorId(), t.getAutorNombre(), t.getEstado(),
                t.getFechaCreacion(), t.getFechaActualizacion(),
                comentarios.size(), comentarios);
    }
}
