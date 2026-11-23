package cl.duoc.foro.moderacion.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cl.duoc.foro.moderacion.model.Comentario;
import cl.duoc.foro.moderacion.model.EstadoPublicacion;

public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

    /**
     * Comentarios para revisión, publicados y baneados, con filtros opcionales:
     * estado y texto. Trae también el tema al que pertenece cada uno.
     */
    @Query("""
            SELECT c
            FROM Comentario c JOIN FETCH c.tema
            WHERE (:estado IS NULL OR c.estado = :estado)
              AND (:texto IS NULL OR LOWER(c.contenido) LIKE :texto)
            ORDER BY c.fechaCreacion DESC
            """)
    List<Comentario> buscar(@Param("estado") EstadoPublicacion estado, @Param("texto") String texto);

    /** Cuántos comentarios hay en cada estado. Cada fila: [estado, cantidad]. */
    @Query("SELECT c.estado, COUNT(c) FROM Comentario c GROUP BY c.estado")
    List<Object[]> contarPorEstado();
}
