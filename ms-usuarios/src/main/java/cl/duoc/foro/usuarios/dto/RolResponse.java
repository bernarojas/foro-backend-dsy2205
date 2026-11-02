package cl.duoc.foro.usuarios.dto;

import cl.duoc.foro.usuarios.model.Rol;

public record RolResponse(
        Long id,
        String nombre,
        String descripcion,
        boolean delSistema,
        long cantidadUsuarios) {

    public static RolResponse de(Rol r, long cantidadUsuarios) {
        return new RolResponse(r.getId(), r.getNombre(), r.getDescripcion(), r.esDelSistema(), cantidadUsuarios);
    }
}
