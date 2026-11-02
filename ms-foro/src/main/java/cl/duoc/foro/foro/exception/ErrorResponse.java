package cl.duoc.foro.foro.exception;

import java.time.LocalDateTime;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        LocalDateTime fecha,
        int status,
        String error,
        String mensaje,
        String ruta,
        Map<String, String> campos) {
}
