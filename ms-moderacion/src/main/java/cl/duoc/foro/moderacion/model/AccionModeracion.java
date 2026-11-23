package cl.duoc.foro.moderacion.model;

/** Las acciones que quedan en el historial, con el estado en que dejan la publicación. */
public enum AccionModeracion {
    BANEAR(EstadoPublicacion.BANEADO),
    RESTAURAR(EstadoPublicacion.PUBLICADO);

    private final EstadoPublicacion estadoResultante;

    AccionModeracion(EstadoPublicacion estadoResultante) {
        this.estadoResultante = estadoResultante;
    }

    public EstadoPublicacion estadoResultante() {
        return estadoResultante;
    }
}
