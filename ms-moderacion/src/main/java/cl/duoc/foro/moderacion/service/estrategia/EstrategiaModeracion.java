package cl.duoc.foro.moderacion.service.estrategia;

import java.util.List;
import java.util.Map;

import cl.duoc.foro.moderacion.dto.PublicacionResponse;
import cl.duoc.foro.moderacion.model.EstadoPublicacion;
import cl.duoc.foro.moderacion.model.TipoPublicacion;

/**
 * Patrón de diseño Strategy. Moderar un tema y moderar un comentario son la misma
 * operación (listar para revisión, banear, restaurar) sobre tablas distintas. Cada
 * tipo de publicación tiene su estrategia y ModeracionService elige cuál usar según
 * el tipo, sin "if" por tipo: para moderar otra cosa (por ejemplo, mensajes privados)
 * basta con agregar otra clase que implemente esta interfaz.
 */
public interface EstrategiaModeracion {

    /** El tipo de publicación que sabe moderar esta estrategia. */
    TipoPublicacion tipo();

    /**
     * Las publicaciones de este tipo para revisión, publicadas y baneadas.
     * Filtros opcionales: estado y texto (ya viene como patrón de LIKE en minúsculas).
     */
    List<PublicacionResponse> listar(EstadoPublicacion estado, String texto);

    /**
     * Deja la publicación en el estado indicado (BANEADO al banear, PUBLICADO al restaurar).
     * Responde 404 si no existe y 409 si ya estaba en ese estado.
     */
    PublicacionResponse cambiarEstado(Long id, EstadoPublicacion nuevoEstado);

    /** Cuántas publicaciones de este tipo hay en cada estado. */
    Map<EstadoPublicacion, Long> contarPorEstado();
}
