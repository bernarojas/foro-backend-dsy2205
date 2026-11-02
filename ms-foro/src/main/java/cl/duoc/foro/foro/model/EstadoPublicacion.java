package cl.duoc.foro.foro.model;

/**
 * PUBLICADO: visible en el foro. BANEADO: lo oculta la moderación
 * (lo usará el microservicio de administración; aquí ya se respeta).
 */
public enum EstadoPublicacion {
    PUBLICADO,
    BANEADO
}
