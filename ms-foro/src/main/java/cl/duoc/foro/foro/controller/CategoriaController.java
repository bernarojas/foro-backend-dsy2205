package cl.duoc.foro.foro.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.foro.foro.dto.CategoriaRequest;
import cl.duoc.foro.foro.dto.CategoriaResponse;
import cl.duoc.foro.foro.security.UsuarioSesion;
import cl.duoc.foro.foro.service.CategoriaService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService service;

    public CategoriaController(CategoriaService service) {
        this.service = service;
    }

    /** GET /api/categorias  (público) con cantidad de temas y comentarios de cada una */
    @GetMapping
    public List<CategoriaResponse> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public CategoriaResponse obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    /** POST /api/categorias  (ADMINISTRADOR) */
    @PostMapping
    public ResponseEntity<CategoriaResponse> crear(@Valid @RequestBody CategoriaRequest req, UsuarioSesion sesion) {
        CategoriaResponse creada = service.crear(req, sesion);
        return ResponseEntity.created(URI.create("/api/categorias/" + creada.id())).body(creada);
    }

    /** PUT /api/categorias/{id}  (ADMINISTRADOR) */
    @PutMapping("/{id}")
    public CategoriaResponse actualizar(@PathVariable Long id, @Valid @RequestBody CategoriaRequest req,
                                        UsuarioSesion sesion) {
        return service.actualizar(id, req, sesion);
    }

    /** DELETE /api/categorias/{id}  (ADMINISTRADOR, solo si no tiene temas) */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, UsuarioSesion sesion) {
        service.eliminar(id, sesion);
        return ResponseEntity.noContent().build();
    }
}
