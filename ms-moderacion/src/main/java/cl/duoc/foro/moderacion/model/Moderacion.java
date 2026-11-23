package cl.duoc.foro.moderacion.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/** Una fila del historial: quién baneó o restauró qué publicación, cuándo y por qué. */
@Entity
@Table(name = "FORO_MODERACION")
public class Moderacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO", nullable = false, length = 15)
    private TipoPublicacion tipo;

    /** Id del tema o del comentario, según el tipo (no hay llave foránea). */
    @Column(name = "PUBLICACION_ID", nullable = false)
    private Long publicacionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "ACCION", nullable = false, length = 15)
    private AccionModeracion accion;

    @Column(name = "MOTIVO", length = 300)
    private String motivo;

    /** Id del usuario en ms-usuarios: viene en el token. */
    @Column(name = "MODERADOR_ID", nullable = false)
    private Long moderadorId;

    @Column(name = "MODERADOR_NOMBRE", nullable = false, length = 100)
    private String moderadorNombre;

    @Column(name = "FECHA", nullable = false)
    private LocalDateTime fecha;

    @PrePersist
    void alCrear() {
        if (fecha == null) {
            fecha = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public TipoPublicacion getTipo() { return tipo; }
    public void setTipo(TipoPublicacion tipo) { this.tipo = tipo; }

    public Long getPublicacionId() { return publicacionId; }
    public void setPublicacionId(Long publicacionId) { this.publicacionId = publicacionId; }

    public AccionModeracion getAccion() { return accion; }
    public void setAccion(AccionModeracion accion) { this.accion = accion; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public Long getModeradorId() { return moderadorId; }
    public void setModeradorId(Long moderadorId) { this.moderadorId = moderadorId; }

    public String getModeradorNombre() { return moderadorNombre; }
    public void setModeradorNombre(String moderadorNombre) { this.moderadorNombre = moderadorNombre; }

    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
}
