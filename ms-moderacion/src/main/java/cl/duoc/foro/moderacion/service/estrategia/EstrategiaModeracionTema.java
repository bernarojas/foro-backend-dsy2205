package cl.duoc.foro.moderacion.service.estrategia;

import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Component;

import cl.duoc.foro.moderacion.dto.PublicacionResponse;
import cl.duoc.foro.moderacion.exception.ApiException;
import cl.duoc.foro.moderacion.model.EstadoPublicacion;
import cl.duoc.foro.moderacion.model.Tema;
import cl.duoc.foro.moderacion.model.TipoPublicacion;
import cl.duoc.foro.moderacion.repository.TemaRepository;

/** Estrategia para los temas (tabla FORO_TEMA). Al banear un tema, ms-foro oculta también sus comentarios. */
@Component
public class EstrategiaModeracionTema implements EstrategiaModeracion {

    private final TemaRepository temas;

    public EstrategiaModeracionTema(TemaRepository temas) {
        this.temas = temas;
    }

    @Override
    public TipoPublicacion tipo() {
        return TipoPublicacion.TEMA;
    }

    @Override
    public List<PublicacionResponse> listar(EstadoPublicacion estado, String texto) {
        return temas.buscar(estado, texto).stream().map(PublicacionResponse::de).toList();
    }

    @Override
    public PublicacionResponse cambiarEstado(Long id, EstadoPublicacion nuevoEstado) {
        Tema t = temas.findById(id)
                .orElseThrow(() -> ApiException.noEncontrado("No existe el tema con id " + id));
        if (t.getEstado() == nuevoEstado) {
            throw ApiException.conflicto("El tema con id " + id + " ya está "
                    + nuevoEstado.name().toLowerCase(Locale.ROOT));
        }
        t.setEstado(nuevoEstado);
        return PublicacionResponse.de(t);
    }

    @Override
    public Map<EstadoPublicacion, Long> contarPorEstado() {
        Map<EstadoPublicacion, Long> conteo = new EnumMap<>(EstadoPublicacion.class);
        temas.contarPorEstado().forEach(f -> conteo.put((EstadoPublicacion) f[0], ((Number) f[1]).longValue()));
        return conteo;
    }
}
