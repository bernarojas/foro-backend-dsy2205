package cl.duoc.foro.foro.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cl.duoc.foro.foro.model.Tema;

public interface TemaRepository extends JpaRepository<Tema, Long> {

    boolean existsByCategoriaId(Long categoriaId);

    /**
     * Búsqueda de temas publicados con filtros opcionales: texto (en el título o
     * el contenido), categoría y autor. Trae también cuántos comentarios tiene cada uno.
     * Cada fila: [Tema, cantidadComentarios].
     */
    @Query("""
            SELECT t,
                   (SELECT COUNT(c) FROM Comentario c
                     WHERE c.tema = t
                       AND c.estado = cl.duoc.foro.foro.model.EstadoPublicacion.PUBLICADO)
            FROM Tema t
            WHERE t.estado = cl.duoc.foro.foro.model.EstadoPublicacion.PUBLICADO
              AND (:texto IS NULL OR LOWER(t.titulo) LIKE :texto OR LOWER(t.contenido) LIKE :texto)
              AND (:categoriaId IS NULL OR t.categoria.id = :categoriaId)
              AND (:autorId IS NULL OR t.autorId = :autorId)
            ORDER BY t.fechaCreacion DESC
            """)
    List<Object[]> buscar(@Param("texto") String texto,
                          @Param("categoriaId") Long categoriaId,
                          @Param("autorId") Long autorId);

    /**
     * Los temas publicados con más comentarios (los más activos del foro).
     * Cada fila: [Tema, cantidadComentarios].
     */
    @Query("""
            SELECT t, COUNT(c.id)
            FROM Tema t
                 LEFT JOIN Comentario c ON c.tema = t
                        AND c.estado = cl.duoc.foro.foro.model.EstadoPublicacion.PUBLICADO
            WHERE t.estado = cl.duoc.foro.foro.model.EstadoPublicacion.PUBLICADO
            GROUP BY t
            ORDER BY COUNT(c.id) DESC, t.fechaCreacion DESC
            """)
    List<Object[]> masComentados(Pageable limite);
}
