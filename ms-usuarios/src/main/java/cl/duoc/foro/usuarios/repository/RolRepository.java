package cl.duoc.foro.usuarios.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.foro.usuarios.model.Rol;

public interface RolRepository extends JpaRepository<Rol, Long> {

    Optional<Rol> findByNombre(String nombre);

    boolean existsByNombreAndIdNot(String nombre, Long id);

    boolean existsByNombre(String nombre);
}
