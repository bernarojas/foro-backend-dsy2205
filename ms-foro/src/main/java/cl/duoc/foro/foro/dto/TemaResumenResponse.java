package cl.duoc.foro.foro.dto;

import java.time.LocalDateTime;

import cl.duoc.foro.foro.model.EstadoPublicacion;
import cl.duoc.foro.foro.model.Tema;

/** Un tema en un listado: el contenido va recortado. */
public record TemaResumenResponse(
        Long id,
        String titulo,
        String extracto,
        Long categoriaId,
        String categoria,
        Long autorId,
        String autorNombre,
        EstadoPublicacion estado,
        long cantidadComentarios,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaActualizacion) {

    private static final int LARGO_EXTRACTO = 120;

    public static TemaResumenResponse de(Tema t, long cantidadComentarios) {
        String contenido = t.getContenido();
        String extracto = contenido.length() <= LARGO_EXTRACTO
                ? contenido
                : contenido.substring(0, LARGO_EXTRACTO).trim() + "…";
        return new TemaResumenResponse(t.getId(), t.getTitulo(), extracto,
                t.getCategoria().getId(), t.getCategoria().getNombre(),
                t.getAutorId(), t.getAutorNombre(), t.getEstado(), cantidadComentarios,
                t.getFechaCreacion(), t.getFechaActualizacion());
    }
}
