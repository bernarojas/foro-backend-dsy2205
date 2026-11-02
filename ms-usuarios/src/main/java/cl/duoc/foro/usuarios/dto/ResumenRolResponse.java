package cl.duoc.foro.usuarios.dto;

public record ResumenRolResponse(
        Long rolId,
        String rol,
        long totalUsuarios,
        long activos,
        long bloqueados) {
}
