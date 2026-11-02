package cl.duoc.foro.foro.security;

/**
 * El usuario que hizo la solicitud, sacado del token que entregó ms-usuarios
 * ("Authorization: Bearer ...").
 */
public record UsuarioSesion(Long id, String nombre, String email, String rol) {

    public static final String ADMINISTRADOR = "ADMINISTRADOR";
    public static final String MODERADOR = "MODERADOR";

    public boolean esAdministrador() {
        return ADMINISTRADOR.equals(rol);
    }

    /** Administrador o moderador: pueden eliminar temas y comentarios de otros. */
    public boolean esStaff() {
        return esAdministrador() || MODERADOR.equals(rol);
    }

    public boolean esElMismo(Long usuarioId) {
        return id != null && id.equals(usuarioId);
    }
}
