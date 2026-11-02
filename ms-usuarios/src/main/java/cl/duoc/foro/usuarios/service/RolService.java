package cl.duoc.foro.usuarios.service;

import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.duoc.foro.usuarios.dto.RolRequest;
import cl.duoc.foro.usuarios.dto.RolResponse;
import cl.duoc.foro.usuarios.exception.ApiException;
import cl.duoc.foro.usuarios.model.Rol;
import cl.duoc.foro.usuarios.repository.RolRepository;
import cl.duoc.foro.usuarios.repository.UsuarioRepository;
import cl.duoc.foro.usuarios.security.UsuarioSesion;

@Service
public class RolService {

    private final RolRepository roles;
    private final UsuarioRepository usuarios;

    public RolService(RolRepository roles, UsuarioRepository usuarios) {
        this.roles = roles;
        this.usuarios = usuarios;
    }

    @Transactional(readOnly = true)
    public List<RolResponse> listar() {
        return roles.findAll().stream()
                .map(r -> RolResponse.de(r, usuarios.countByRolId(r.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public RolResponse obtener(Long id) {
        Rol r = buscar(id);
        return RolResponse.de(r, usuarios.countByRolId(id));
    }

    @Transactional
    public RolResponse crear(RolRequest req, UsuarioSesion sesion) {
        exigirAdministrador(sesion);
        String nombre = normalizar(req.nombre());
        if (roles.existsByNombre(nombre)) {
            throw ApiException.conflicto("Ya existe un rol llamado " + nombre);
        }
        Rol r = new Rol();
        r.setNombre(nombre);
        r.setDescripcion(req.descripcion());
        return RolResponse.de(roles.save(r), 0);
    }

    @Transactional
    public RolResponse actualizar(Long id, RolRequest req, UsuarioSesion sesion) {
        exigirAdministrador(sesion);
        Rol r = buscar(id);
        String nombre = normalizar(req.nombre());
        if (r.esDelSistema() && !r.getNombre().equals(nombre)) {
            throw ApiException.conflicto("El rol " + r.getNombre() + " es del sistema: se puede cambiar su descripción, no su nombre");
        }
        if (roles.existsByNombreAndIdNot(nombre, id)) {
            throw ApiException.conflicto("Ya existe un rol llamado " + nombre);
        }
        r.setNombre(nombre);
        r.setDescripcion(req.descripcion());
        return RolResponse.de(r, usuarios.countByRolId(id));
    }

    @Transactional
    public void eliminar(Long id, UsuarioSesion sesion) {
        exigirAdministrador(sesion);
        Rol r = buscar(id);
        if (r.esDelSistema()) {
            throw ApiException.conflicto("El rol " + r.getNombre() + " es del sistema y no se puede eliminar");
        }
        long enUso = usuarios.countByRolId(id);
        if (enUso > 0) {
            throw ApiException.conflicto("No se puede eliminar: " + enUso + " usuario(s) tienen este rol");
        }
        roles.delete(r);
    }

    Rol buscar(Long id) {
        return roles.findById(id)
                .orElseThrow(() -> ApiException.noEncontrado("No existe el rol con id " + id));
    }

    private static String normalizar(String nombre) {
        return nombre.trim().replaceAll("\\s+", "_").toUpperCase(Locale.ROOT);
    }

    private static void exigirAdministrador(UsuarioSesion sesion) {
        if (!sesion.esAdministrador()) {
            throw ApiException.prohibido("Solo un ADMINISTRADOR puede administrar los roles");
        }
    }
}
