package cl.duoc.foro.usuarios.security;

import cl.duoc.foro.usuarios.model.Rol;

/** El usuario que hizo la solicitud, sacado del token "Authorization: Bearer ...". */
public record UsuarioSesion(Long id, String nombre, String email, String rol) {

    public boolean esAdministrador() {
        return Rol.ADMINISTRADOR.equals(rol);
    }

    /** Administrador o moderador: pueden revisar la lista de usuarios. */
    public boolean esStaff() {
        return esAdministrador() || Rol.MODERADOR.equals(rol);
    }

    public boolean esElMismo(Long usuarioId) {
        return id != null && id.equals(usuarioId);
    }
}
