package cl.duoc.foro.usuarios.service;

import java.util.List;
import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.duoc.foro.usuarios.dto.ResumenRolResponse;
import cl.duoc.foro.usuarios.dto.UsuarioActualizarRequest;
import cl.duoc.foro.usuarios.dto.UsuarioCrearRequest;
import cl.duoc.foro.usuarios.dto.UsuarioResponse;
import cl.duoc.foro.usuarios.exception.ApiException;
import cl.duoc.foro.usuarios.model.EstadoUsuario;
import cl.duoc.foro.usuarios.model.Rol;
import cl.duoc.foro.usuarios.model.Usuario;
import cl.duoc.foro.usuarios.repository.RolRepository;
import cl.duoc.foro.usuarios.repository.UsuarioRepository;
import cl.duoc.foro.usuarios.security.UsuarioSesion;

/**
 * Reglas de los usuarios:
 * - Cualquiera se registra como USUARIO; un ADMINISTRADOR puede crear con otro rol.
 * - Cada uno ve, modifica y elimina su propia cuenta.
 * - ADMINISTRADOR y MODERADOR ven la lista completa; solo el ADMINISTRADOR
 *   cambia roles, bloquea y elimina cuentas ajenas.
 * - Siempre tiene que quedar al menos un ADMINISTRADOR activo.
 */
@Service
public class UsuarioService {

    private final UsuarioRepository usuarios;
    private final RolRepository roles;
    private final PasswordEncoder encoder;

    public UsuarioService(UsuarioRepository usuarios, RolRepository roles, PasswordEncoder encoder) {
        this.usuarios = usuarios;
        this.roles = roles;
        this.encoder = encoder;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar(String texto, String rol, EstadoUsuario estado, UsuarioSesion sesion) {
        if (!sesion.esStaff()) {
            throw ApiException.prohibido("Solo un ADMINISTRADOR o MODERADOR puede ver la lista de usuarios");
        }
        String patron = (texto == null || texto.isBlank()) ? null : "%" + texto.trim().toLowerCase(Locale.ROOT) + "%";
        String nombreRol = (rol == null || rol.isBlank()) ? null : rol.trim().toUpperCase(Locale.ROOT);
        return usuarios.buscar(patron, nombreRol, estado).stream().map(UsuarioResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtener(Long id, UsuarioSesion sesion) {
        if (!sesion.esElMismo(id) && !sesion.esStaff()) {
            throw ApiException.prohibido("Solo puedes ver tu propia cuenta");
        }
        return UsuarioResponse.de(buscar(id));
    }

    @Transactional
    public UsuarioResponse crear(UsuarioCrearRequest req, UsuarioSesion sesion) {
        String email = req.email().trim().toLowerCase(Locale.ROOT);
        if (usuarios.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflicto("Ya existe una cuenta con el correo " + email);
        }

        Rol rol;
        if (req.rolId() == null) {
            rol = rolPorNombre(Rol.USUARIO);
        } else {
            if (sesion == null || !sesion.esAdministrador()) {
                throw ApiException.prohibido("Solo un ADMINISTRADOR puede asignar un rol al crear la cuenta");
            }
            rol = buscarRol(req.rolId());
        }

        Usuario u = new Usuario();
        u.setNombre(req.nombre().trim());
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(req.password()));
        u.setRol(rol);
        u.setEstado(EstadoUsuario.ACTIVO);
        return UsuarioResponse.de(usuarios.save(u));
    }

    @Transactional
    public UsuarioResponse actualizar(Long id, UsuarioActualizarRequest req, UsuarioSesion sesion) {
        boolean esAdmin = sesion.esAdministrador();
        if (!sesion.esElMismo(id) && !esAdmin) {
            throw ApiException.prohibido("Solo puedes modificar tu propia cuenta");
        }
        Usuario u = buscar(id);

        if (req.nombre() != null) {
            if (req.nombre().isBlank()) {
                throw ApiException.solicitudInvalida("El nombre no puede quedar vacío");
            }
            u.setNombre(req.nombre().trim());
        }
        if (req.email() != null) {
            String email = req.email().trim().toLowerCase(Locale.ROOT);
            if (usuarios.existsByEmailIgnoreCaseAndIdNot(email, id)) {
                throw ApiException.conflicto("Ya existe otra cuenta con el correo " + email);
            }
            u.setEmail(email);
        }
        if (req.password() != null) {
            u.setPasswordHash(encoder.encode(req.password()));
        }

        if (req.rolId() != null || req.estado() != null) {
            if (!esAdmin) {
                throw ApiException.prohibido("Solo un ADMINISTRADOR puede cambiar el rol o el estado de una cuenta");
            }
            Rol nuevoRol = req.rolId() != null ? buscarRol(req.rolId()) : u.getRol();
            EstadoUsuario nuevoEstado = req.estado() != null ? req.estado() : u.getEstado();
            boolean dejaDeSerAdminActivo = u.esAdministrador() && u.getEstado() == EstadoUsuario.ACTIVO
                    && (!Rol.ADMINISTRADOR.equals(nuevoRol.getNombre()) || nuevoEstado != EstadoUsuario.ACTIVO);
            if (dejaDeSerAdminActivo) {
                exigirOtroAdministrador();
            }
            u.setRol(nuevoRol);
            u.setEstado(nuevoEstado);
        }
        return UsuarioResponse.de(u);
    }

    @Transactional
    public void eliminar(Long id, UsuarioSesion sesion) {
        if (!sesion.esElMismo(id) && !sesion.esAdministrador()) {
            throw ApiException.prohibido("Solo puedes eliminar tu propia cuenta");
        }
        Usuario u = buscar(id);
        if (u.esAdministrador() && u.getEstado() == EstadoUsuario.ACTIVO) {
            exigirOtroAdministrador();
        }
        usuarios.delete(u);
    }

    /** Consulta agrupada: cuántos usuarios hay por rol, activos y bloqueados. */
    @Transactional(readOnly = true)
    public List<ResumenRolResponse> resumenPorRol(UsuarioSesion sesion) {
        if (!sesion.esStaff()) {
            throw ApiException.prohibido("Solo un ADMINISTRADOR o MODERADOR puede ver el resumen");
        }
        return usuarios.resumenPorRol().stream().map(f -> {
            long total = ((Number) f[2]).longValue();
            long activos = f[3] == null ? 0 : ((Number) f[3]).longValue();
            return new ResumenRolResponse(((Number) f[0]).longValue(), (String) f[1], total, activos, total - activos);
        }).toList();
    }

    private void exigirOtroAdministrador() {
        long adminsActivos = usuarios.buscar(null, Rol.ADMINISTRADOR, EstadoUsuario.ACTIVO).size();
        if (adminsActivos <= 1) {
            throw ApiException.conflicto("Tiene que quedar al menos un ADMINISTRADOR activo");
        }
    }

    private Usuario buscar(Long id) {
        return usuarios.findById(id)
                .orElseThrow(() -> ApiException.noEncontrado("No existe el usuario con id " + id));
    }

    private Rol buscarRol(Long id) {
        return roles.findById(id)
                .orElseThrow(() -> ApiException.solicitudInvalida("No existe el rol con id " + id));
    }

    private Rol rolPorNombre(String nombre) {
        return roles.findByNombre(nombre)
                .orElseThrow(() -> new IllegalStateException("Falta el rol " + nombre + " en la base de datos"));
    }
}
