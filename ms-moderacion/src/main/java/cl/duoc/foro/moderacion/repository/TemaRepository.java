package cl.duoc.foro.moderacion.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cl.duoc.foro.moderacion.model.EstadoPublicacion;
import cl.duoc.foro.moderacion.model.Tema;

public interface TemaRepository extends JpaRepository<Tema, Long> {

    /**
     * Temas para revisión, publicados y baneados, con filtros opcionales:
     * estado y texto (en el título o el contenido).
     */
    @Query("""
            SELECT t
            FROM Tema t JOIN FETCH t.categoria
            WHERE (:estado IS NULL OR t.estado = :estado)
              AND (:texto IS NULL OR LOWER(t.titulo) LIKE :texto OR LOWER(t.contenido) LIKE :texto)
            ORDER BY t.fechaCreacion DESC
            """)
    List<Tema> buscar(@Param("estado") EstadoPublicacion estado, @Param("texto") String texto);

    /** Cuántos temas hay en cada estado. Cada fila: [estado, cantidad]. */
    @Query("SELECT t.estado, COUNT(t) FROM Tema t GROUP BY t.estado")
    List<Object[]> contarPorEstado();
}
