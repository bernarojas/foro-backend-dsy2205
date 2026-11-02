package cl.duoc.foro.foro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import cl.duoc.foro.foro.model.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);

    /**
     * Estadística por categoría (solo lo publicado).
     * Cada fila: [id, nombre, descripcion, cantidadTemas, cantidadComentarios, ultimaPublicacion].
     */
    @Query("""
            SELECT c.id, c.nombre, c.descripcion,
                   COUNT(DISTINCT t.id),
                   COUNT(co.id),
                   MAX(t.fechaCreacion)
            FROM Categoria c
                 LEFT JOIN Tema t ON t.categoria = c
                        AND t.estado = cl.duoc.foro.foro.model.EstadoPublicacion.PUBLICADO
                 LEFT JOIN Comentario co ON co.tema = t
                        AND co.estado = cl.duoc.foro.foro.model.EstadoPublicacion.PUBLICADO
            GROUP BY c.id, c.nombre, c.descripcion
            ORDER BY c.nombre
            """)
    List<Object[]> estadisticas();
}
