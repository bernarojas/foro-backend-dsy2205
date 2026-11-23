package cl.duoc.foro.moderacion.dto;

import java.time.LocalDateTime;

import cl.duoc.foro.moderacion.model.AccionModeracion;
import cl.duoc.foro.moderacion.model.Moderacion;
import cl.duoc.foro.moderacion.model.TipoPublicacion;

/** Una fila del historial de moderación. */
public record ModeracionResponse(
        Long id,
        TipoPublicacion tipo,
        Long publicacionId,
        AccionModeracion accion,
        String motivo,
        Long moderadorId,
        String moderadorNombre,
        LocalDateTime fecha) {

    public static ModeracionResponse de(Moderacion m) {
        return new ModeracionResponse(m.getId(), m.getTipo(), m.getPublicacionId(), m.getAccion(), m.getMotivo(),
                m.getModeradorId(), m.getModeradorNombre(), m.getFecha());
    }
}
