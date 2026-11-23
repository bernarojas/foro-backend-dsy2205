package cl.duoc.foro.moderacion.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cl.duoc.foro.moderacion.model.AccionModeracion;
import cl.duoc.foro.moderacion.model.Moderacion;
import cl.duoc.foro.moderacion.model.TipoPublicacion;

public interface ModeracionRepository extends JpaRepository<Moderacion, Long> {

    /** Historial, lo más reciente primero, con filtros opcionales. */
    @Query("""
            SELECT m
            FROM Moderacion m
            WHERE (:tipo IS NULL OR m.tipo = :tipo)
              AND (:accion IS NULL OR m.accion = :accion)
              AND (:moderadorId IS NULL OR m.moderadorId = :moderadorId)
              AND (:publicacionId IS NULL OR m.publicacionId = :publicacionId)
            ORDER BY m.fecha DESC, m.id DESC
            """)
    List<Moderacion> buscar(@Param("tipo") TipoPublicacion tipo,
                            @Param("accion") AccionModeracion accion,
                            @Param("moderadorId") Long moderadorId,
                            @Param("publicacionId") Long publicacionId);

    /**
     * Acciones de cada moderador (el que más ha moderado primero).
     * Cada fila: [moderadorId, moderadorNombre, baneos, restauraciones, total].
     */
    @Query("""
            SELECT m.moderadorId,
                   MAX(m.moderadorNombre),
                   SUM(CASE WHEN m.accion = cl.duoc.foro.moderacion.model.AccionModeracion.BANEAR THEN 1 ELSE 0 END),
                   SUM(CASE WHEN m.accion = cl.duoc.foro.moderacion.model.AccionModeracion.RESTAURAR THEN 1 ELSE 0 END),
                   COUNT(m.id)
            FROM Moderacion m
            GROUP BY m.moderadorId
            ORDER BY COUNT(m.id) DESC, m.moderadorId
            """)
    List<Object[]> accionesPorModerador();
}
