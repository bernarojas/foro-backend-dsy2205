package cl.duoc.foro.moderacion.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * La tabla FORO_TEMA vista desde la moderación: los temas los crea y los edita
 * ms-foro; aquí solo se leen y lo único que se modifica es el ESTADO.
 */
@Entity
@Table(name = "FORO_TEMA")
public class Tema {

    @Id
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "CATEGORIA_ID", insertable = false, updatable = false)
    private Categoria categoria;

    @Column(name = "AUTOR_ID", insertable = false, updatable = false)
    private Long autorId;

    @Column(name = "AUTOR_NOMBRE", insertable = false, updatable = false)
    private String autorNombre;

    @Column(name = "TITULO", insertable = false, updatable = false)
    private String titulo;

    @Column(name = "CONTENIDO", insertable = false, updatable = false)
    private String contenido;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = false, length = 15)
    private EstadoPublicacion estado;

    @Column(name = "FECHA_CREACION", insertable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    public Long getId() { return id; }

    public Categoria getCategoria() { return categoria; }

    public Long getAutorId() { return autorId; }

    public String getAutorNombre() { return autorNombre; }

    public String getTitulo() { return titulo; }

    public String getContenido() { return contenido; }

    public EstadoPublicacion getEstado() { return estado; }
    public void setEstado(EstadoPublicacion estado) { this.estado = estado; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
}
