package cl.duoc.foro.foro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoriaRequest(
        @NotBlank(message = "El nombre de la categoría es obligatorio")
        @Size(max = 60, message = "El nombre no puede superar 60 caracteres")
        String nombre,

        @Size(max = 250, message = "La descripción no puede superar 250 caracteres")
        String descripcion) {
}
