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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.foro.usuarios.dto.ResumenRolResponse;
import cl.duoc.foro.usuarios.dto.UsuarioActualizarRequest;
import cl.duoc.foro.usuarios.dto.UsuarioCrearRequest;
import cl.duoc.foro.usuarios.dto.UsuarioResponse;
import cl.duoc.foro.usuarios.model.EstadoUsuario;
import cl.duoc.foro.usuarios.security.SesionOpcional;
import cl.duoc.foro.usuarios.security.UsuarioSesion;
import cl.duoc.foro.usuarios.service.UsuarioService;
import jakarta.validation.Valid;

/** CRUD de usuarios. */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    /** GET /api/usuarios?texto=&rol=&estado=   (ADMINISTRADOR o MODERADOR) */
    @GetMapping
    public List<UsuarioResponse> listar(@RequestParam(required = false) String texto,
                                        @RequestParam(required = false) String rol,
                                        @RequestParam(required = false) EstadoUsuario estado,
                                        UsuarioSesion sesion) {
        return service.listar(texto, rol, estado, sesion);
    }

    /** GET /api/usuarios/resumen-roles   (ADMINISTRADOR o MODERADOR) */
    @GetMapping("/resumen-roles")
    public List<ResumenRolResponse> resumenPorRol(UsuarioSesion sesion) {
        return service.resumenPorRol(sesion);
    }

    /** GET /api/usuarios/{id}   (la propia cuenta, o ADMINISTRADOR / MODERADOR) */
    @GetMapping("/{id}")
    public UsuarioResponse obtener(@PathVariable Long id, UsuarioSesion sesion) {
        return service.obtener(id, sesion);
    }

    /** POST /api/usuarios   (registro: público) */
    @PostMapping
    public ResponseEntity<UsuarioResponse> crear(@Valid @RequestBody UsuarioCrearRequest req,
                                                 @SesionOpcional UsuarioSesion sesion) {
        UsuarioResponse creado = service.crear(req, sesion);
        return ResponseEntity.created(URI.create("/api/usuarios/" + creado.id())).body(creado);
    }

    /** PUT /api/usuarios/{id}   (la propia cuenta, o ADMINISTRADOR) */
    @PutMapping("/{id}")
    public UsuarioResponse actualizar(@PathVariable Long id,
                                      @Valid @RequestBody UsuarioActualizarRequest req,
                                      UsuarioSesion sesion) {
        return service.actualizar(id, req, sesion);
    }

    /** DELETE /api/usuarios/{id}   (la propia cuenta, o ADMINISTRADOR) */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, UsuarioSesion sesion) {
        service.eliminar(id, sesion);
        return ResponseEntity.noContent().build();
    }
}
