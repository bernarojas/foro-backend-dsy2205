package cl.duoc.foro.moderacion.dto;

import java.util.List;

/** Resumen de la moderación: cómo está el foro y cuánto ha hecho cada moderador. */
public record ResumenResponse(
        ConteoEstados temas,
        ConteoEstados comentarios,
        long totalAcciones,
        List<AccionesModerador> moderadores) {

    /** Cuántas publicaciones de un tipo están publicadas y cuántas baneadas. */
    public record ConteoEstados(long publicados, long baneados, long total) {
    }

    /** Lo que ha hecho un moderador según el historial. */
    public record AccionesModerador(Long moderadorId, String moderadorNombre,
                                    long baneos, long restauraciones, long total) {
    }
}
