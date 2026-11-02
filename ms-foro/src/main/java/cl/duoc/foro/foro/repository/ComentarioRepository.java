package cl.duoc.foro.foro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cl.duoc.foro.foro.model.Comentario;
import cl.duoc.foro.foro.model.EstadoPublicacion;

public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

    List<Comentario> findByTemaIdAndEstadoOrderByFechaCreacionAsc(Long temaId, EstadoPublicacion estado);

    @Modifying
    @Query("DELETE FROM Comentario c WHERE c.tema.id = :temaId")
    int eliminarDelTema(@Param("temaId") Long temaId);
}
