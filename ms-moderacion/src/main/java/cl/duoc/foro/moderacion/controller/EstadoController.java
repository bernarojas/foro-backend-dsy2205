package cl.duoc.foro.moderacion.controller;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Sirve para comprobar que el microservicio está arriba.
 * Los controladores del negocio van en este mismo paquete.
 */
@RestController
@RequestMapping("/api/estado")
public class EstadoController {

    private final String servicio;

    public EstadoController(@Value("${spring.application.name}") String servicio) {
        this.servicio = servicio;
    }

    /** GET /api/estado  (público) nombre del servicio y hora del servidor */
    @GetMapping
    public Map<String, Object> estado() {
        Map<String, Object> estado = new LinkedHashMap<>();
        estado.put("servicio", servicio);
        estado.put("hora", LocalDateTime.now());
        return estado;
    }
}
