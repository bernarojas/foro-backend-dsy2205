package cl.duoc.foro.moderacion.service.estrategia;

import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Component;

import cl.duoc.foro.moderacion.dto.PublicacionResponse;
import cl.duoc.foro.moderacion.exception.ApiException;
import cl.duoc.foro.moderacion.model.Comentario;
import cl.duoc.foro.moderacion.model.EstadoPublicacion;
import cl.duoc.foro.moderacion.model.TipoPublicacion;
import cl.duoc.foro.moderacion.repository.ComentarioRepository;

/** Estrategia para los comentarios (tabla FORO_COMENTARIO). El tema del comentario no cambia. */
@Component
public class EstrategiaModeracionComentario implements EstrategiaModeracion {

    private final ComentarioRepository comentarios;

    public EstrategiaModeracionComentario(ComentarioRepository comentarios) {
        this.comentarios = comentarios;
    }

    @Override
    public TipoPublicacion tipo() {
        return TipoPublicacion.COMENTARIO;
    }

    @Override
    public List<PublicacionResponse> listar(EstadoPublicacion estado, String texto) {
        return comentarios.buscar(estado, texto).stream().map(PublicacionResponse::de).toList();
    }

    @Override
    public PublicacionResponse cambiarEstado(Long id, EstadoPublicacion nuevoEstado) {
        Comentario c = comentarios.findById(id)
                .orElseThrow(() -> ApiException.noEncontrado("No existe el comentario con id " + id));
        if (c.getEstado() == nuevoEstado) {
            throw ApiException.conflicto("El comentario con id " + id + " ya está "
                    + nuevoEstado.name().toLowerCase(Locale.ROOT));
        }
        c.setEstado(nuevoEstado);
        return PublicacionResponse.de(c);
    }

    @Override
    public Map<EstadoPublicacion, Long> contarPorEstado() {
        Map<EstadoPublicacion, Long> conteo = new EnumMap<>(EstadoPublicacion.class);
        comentarios.contarPorEstado().forEach(f -> conteo.put((EstadoPublicacion) f[0], ((Number) f[1]).longValue()));
        return conteo;
    }
}
