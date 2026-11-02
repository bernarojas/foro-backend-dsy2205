package cl.duoc.foro.usuarios.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "FORO_ROL")
public class Rol {

    /** Roles que usa la lógica de la aplicación: no se pueden borrar ni renombrar. */
    public static final String ADMINISTRADOR = "ADMINISTRADOR";
    public static final String MODERADOR = "MODERADOR";
    public static final String USUARIO = "USUARIO";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "NOMBRE", nullable = false, length = 30)
    private String nombre;

    @Column(name = "DESCRIPCION", length = 200)
    private String descripcion;

    public boolean esDelSistema() {
        return ADMINISTRADOR.equals(nombre) || MODERADOR.equals(nombre) || USUARIO.equals(nombre);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}
