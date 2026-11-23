package cl.duoc.foro.moderacion.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Solo lectura: la moderación muestra el nombre de la categoría de cada tema. */
@Entity
@Table(name = "FORO_CATEGORIA")
public class Categoria {

    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "NOMBRE", insertable = false, updatable = false)
    private String nombre;

    public Long getId() { return id; }

    public String getNombre() { return nombre; }
}
