package cl.duoc.foro.foro.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.foro.foro.dto.ComentarioRequest;
import cl.duoc.foro.foro.dto.ComentarioResponse;
import cl.duoc.foro.foro.security.SesionOpcional;
import cl.duoc.foro.foro.security.UsuarioSesion;
import cl.duoc.foro.foro.service.ComentarioService;
import jakarta.validation.Valid;

/** Un comentario por su id. Para crear uno: POST /api/temas/{id}/comentarios. */
@RestController
@RequestMapping("/api/comentarios")
public class ComentarioController {

    private final ComentarioService service;

    public ComentarioController(ComentarioService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ComentarioResponse obtener(@PathVariable Long id, @SesionOpcional UsuarioSesion sesion) {
        return service.obtener(id, sesion);
    }

    /** PUT /api/comentarios/{id}   (el autor) */
    @PutMapping("/{id}")
    public ComentarioResponse actualizar(@PathVariable Long id, @Valid @RequestBody ComentarioRequest req,
                                         UsuarioSesion sesion) {
        return service.actualizar(id, req, sesion);
    }

    /** DELETE /api/comentarios/{id}   (el autor, MODERADOR o ADMINISTRADOR) */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, UsuarioSesion sesion) {
        service.eliminar(id, sesion);
        return ResponseEntity.noContent().build();
    }
}
