package cl.duoc.foro.usuarios.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cl.duoc.foro.usuarios.model.EstadoUsuario;
import cl.duoc.foro.usuarios.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    long countByRolId(Long rolId);

    long countByRolNombre(String nombreRol);

    /** Búsqueda con filtros opcionales: texto (nombre o correo), rol y estado. */
    @Query("""
            SELECT u FROM Usuario u
            WHERE (:texto IS NULL OR LOWER(u.nombre) LIKE :texto OR LOWER(u.email) LIKE :texto)
              AND (:rol IS NULL OR u.rol.nombre = :rol)
              AND (:estado IS NULL OR u.estado = :estado)
            ORDER BY u.nombre
            """)
    List<Usuario> buscar(@Param("texto") String texto,
                         @Param("rol") String rol,
                         @Param("estado") EstadoUsuario estado);

    /**
     * Cuántos usuarios tiene cada rol y cuántos de ellos están activos.
     * Cada fila: [rolId, rolNombre, total, activos].
     */
    @Query("""
            SELECT r.id, r.nombre, COUNT(u.id),
                   SUM(CASE WHEN u.estado = cl.duoc.foro.usuarios.model.EstadoUsuario.ACTIVO THEN 1 ELSE 0 END)
            FROM Rol r LEFT JOIN Usuario u ON u.rol = r
            GROUP BY r.id, r.nombre
            ORDER BY r.id
            """)
    List<Object[]> resumenPorRol();
}
