package cl.duoc.foro.foro.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

import cl.duoc.foro.foro.model.Categoria;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record CategoriaResponse(
        Long id,
        String nombre,
        String descripcion,
        Long cantidadTemas,
        Long cantidadComentarios,
        LocalDateTime ultimaPublicacion) {

    public static CategoriaResponse de(Categoria c) {
        return new CategoriaResponse(c.getId(), c.getNombre(), c.getDescripcion(), null, null, null);
    }
}
