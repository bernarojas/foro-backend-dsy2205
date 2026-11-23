package cl.duoc.foro.moderacion.service;

import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.duoc.foro.moderacion.dto.BanearRequest;
import cl.duoc.foro.moderacion.dto.ModeracionResponse;
import cl.duoc.foro.moderacion.dto.PublicacionResponse;
import cl.duoc.foro.moderacion.dto.RestaurarRequest;
import cl.duoc.foro.moderacion.dto.ResumenResponse;
import cl.duoc.foro.moderacion.dto.ResumenResponse.AccionesModerador;
import cl.duoc.foro.moderacion.dto.ResumenResponse.ConteoEstados;
import cl.duoc.foro.moderacion.exception.ApiException;
import cl.duoc.foro.moderacion.model.AccionModeracion;
import cl.duoc.foro.moderacion.model.EstadoPublicacion;
import cl.duoc.foro.moderacion.model.Moderacion;
import cl.duoc.foro.moderacion.model.TipoPublicacion;
import cl.duoc.foro.moderacion.repository.ModeracionRepository;
import cl.duoc.foro.moderacion.security.UsuarioSesion;
import cl.duoc.foro.moderacion.service.estrategia.EstrategiaModeracion;

/**
 * Moderación del foro: solo ADMINISTRADOR y MODERADOR.
 * - Revisar temas y comentarios (incluidos los baneados), banearlos y restaurarlos.
 * - Cada acción queda en el historial con el moderador que viene en el token.
 * Lo que cambia entre un tema y un comentario lo resuelve la estrategia de cada tipo.
 */
@Service
public class ModeracionService {

    private final Map<TipoPublicacion, EstrategiaModeracion> estrategias = new EnumMap<>(TipoPublicacion.class);
    private final ModeracionRepository historial;

    /** Spring entrega todas las estrategias que existen; se guardan por el tipo que moderan. */
    public ModeracionService(List<EstrategiaModeracion> estrategias, ModeracionRepository historial) {
        estrategias.forEach(e -> this.estrategias.put(e.tipo(), e));
        this.historial = historial;
    }

    @Transactional(readOnly = true)
    public List<PublicacionResponse> listar(TipoPublicacion tipo, EstadoPublicacion estado, String texto,
                                            UsuarioSesion sesion) {
        exigirStaff(sesion);
        String patron = (texto == null || texto.isBlank()) ? null : "%" + texto.trim().toLowerCase(Locale.ROOT) + "%";
        return estrategias.get(tipo).listar(estado, patron);
    }

    @Transactional
    public PublicacionResponse banear(TipoPublicacion tipo, Long id, BanearRequest req, UsuarioSesion sesion) {
        return moderar(tipo, id, AccionModeracion.BANEAR, req.motivo(), sesion);
    }

    @Transactional
    public PublicacionResponse restaurar(TipoPublicacion tipo, Long id, RestaurarRequest req, UsuarioSesion sesion) {
        return moderar(tipo, id, AccionModeracion.RESTAURAR, req == null ? null : req.motivo(), sesion);
    }

    @Transactional(readOnly = true)
    public List<ModeracionResponse> historial(TipoPublicacion tipo, AccionModeracion accion, Long moderadorId,
                                              Long publicacionId, UsuarioSesion sesion) {
        exigirStaff(sesion);
        return historial.buscar(tipo, accion, moderadorId, publicacionId).stream()
                .map(ModeracionResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public ResumenResponse resumen(UsuarioSesion sesion) {
        exigirStaff(sesion);
        List<AccionesModerador> moderadores = historial.accionesPorModerador().stream()
                .map(f -> new AccionesModerador(
                        ((Number) f[0]).longValue(),
                        (String) f[1],
                        ((Number) f[2]).longValue(),
                        ((Number) f[3]).longValue(),
                        ((Number) f[4]).longValue()))
                .toList();
        long totalAcciones = moderadores.stream().mapToLong(AccionesModerador::total).sum();
        return new ResumenResponse(conteo(TipoPublicacion.TEMA), conteo(TipoPublicacion.COMENTARIO),
                totalAcciones, moderadores);
    }

    /** Cambia el estado con la estrategia del tipo y deja la acción en el historial (misma transacción). */
    private PublicacionResponse moderar(TipoPublicacion tipo, Long id, AccionModeracion accion, String motivo,
                                        UsuarioSesion sesion) {
        exigirStaff(sesion);
        PublicacionResponse publicacion = estrategias.get(tipo).cambiarEstado(id, accion.estadoResultante());

        Moderacion m = new Moderacion();
        m.setTipo(tipo);
        m.setPublicacionId(id);
        m.setAccion(accion);
        m.setMotivo(motivo == null || motivo.isBlank() ? null : motivo.trim());
        m.setModeradorId(sesion.id());
        m.setModeradorNombre(sesion.nombre());
        historial.save(m);
        return publicacion;
    }

    private ConteoEstados conteo(TipoPublicacion tipo) {
        Map<EstadoPublicacion, Long> porEstado = estrategias.get(tipo).contarPorEstado();
        long publicados = porEstado.getOrDefault(EstadoPublicacion.PUBLICADO, 0L);
        long baneados = porEstado.getOrDefault(EstadoPublicacion.BANEADO, 0L);
        return new ConteoEstados(publicados, baneados, publicados + baneados);
    }

    private static void exigirStaff(UsuarioSesion sesion) {
        if (!sesion.esStaff()) {
            throw ApiException.prohibido("Solo un ADMINISTRADOR o un MODERADOR puede moderar el foro");
        }
    }
}
