package cl.duoc.foro.usuarios.controller;

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

import cl.duoc.foro.usuarios.dto.RolRequest;
import cl.duoc.foro.usuarios.dto.RolResponse;
import cl.duoc.foro.usuarios.security.UsuarioSesion;
import cl.duoc.foro.usuarios.service.RolService;
import jakarta.validation.Valid;

/** CRUD de roles: leer es público; crear, modificar y eliminar es del ADMINISTRADOR. */
@RestController
@RequestMapping("/api/roles")
public class RolController {

    private final RolService service;

    public RolController(RolService service) {
        this.service = service;
    }

    @GetMapping
    public List<RolResponse> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public RolResponse obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    public ResponseEntity<RolResponse> crear(@Valid @RequestBody RolRequest req, UsuarioSesion sesion) {
        RolResponse creado = service.crear(req, sesion);
        return ResponseEntity.created(URI.create("/api/roles/" + creado.id())).body(creado);
    }

    @PutMapping("/{id}")
    public RolResponse actualizar(@PathVariable Long id, @Valid @RequestBody RolRequest req, UsuarioSesion sesion) {
        return service.actualizar(id, req, sesion);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, UsuarioSesion sesion) {
        service.eliminar(id, sesion);
        return ResponseEntity.noContent().build();
    }
}
