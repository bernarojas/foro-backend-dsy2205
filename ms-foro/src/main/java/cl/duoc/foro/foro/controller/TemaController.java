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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.foro.foro.dto.ComentarioRequest;
import cl.duoc.foro.foro.dto.ComentarioResponse;
import cl.duoc.foro.foro.dto.TemaActualizarRequest;
import cl.duoc.foro.foro.dto.TemaDetalleResponse;
import cl.duoc.foro.foro.dto.TemaRequest;
import cl.duoc.foro.foro.dto.TemaResumenResponse;
import cl.duoc.foro.foro.security.SesionOpcional;
import cl.duoc.foro.foro.security.UsuarioSesion;
import cl.duoc.foro.foro.service.ComentarioService;
import cl.duoc.foro.foro.service.TemaService;
import jakarta.validation.Valid;

/** Búsqueda, visualización y publicación de temas, y los comentarios de cada tema. */
@RestController
@RequestMapping("/api/temas")
public class TemaController {

    private final TemaService temas;
    private final ComentarioService comentarios;

    public TemaController(TemaService temas, ComentarioService comentarios) {
        this.temas = temas;
        this.comentarios = comentarios;
    }

    /** GET /api/temas?texto=&categoriaId=&autorId=   (público) */
    @GetMapping
    public List<TemaResumenResponse> buscar(@RequestParam(required = false) String texto,
                                            @RequestParam(required = false) Long categoriaId,
                                            @RequestParam(required = false) Long autorId) {
        return temas.buscar(texto, categoriaId, autorId);
    }

    /** GET /api/temas/mas-comentados?limite=5   (público) */
    @GetMapping("/mas-comentados")
    public List<TemaResumenResponse> masComentados(@RequestParam(defaultValue = "5") int limite) {
        return temas.masComentados(limite);
    }

    /** GET /api/temas/mios   (los temas del usuario de la sesión) */
    @GetMapping("/mios")
    public List<TemaResumenResponse> mios(UsuarioSesion sesion) {
        return temas.buscar(null, null, sesion.id());
    }

    /** GET /api/temas/{id}   (público) tema completo con sus comentarios */
    @GetMapping("/{id}")
    public TemaDetalleResponse obtener(@PathVariable Long id, @SesionOpcional UsuarioSesion sesion) {
        return temas.obtener(id, sesion);
    }

    /** POST /api/temas   (con sesión) publicar */
    @PostMapping
    public ResponseEntity<TemaDetalleResponse> crear(@Valid @RequestBody TemaRequest req, UsuarioSesion sesion) {
        TemaDetalleResponse creado = temas.crear(req, sesion);
        return ResponseEntity.created(URI.create("/api/temas/" + creado.id())).body(creado);
    }

    /** PUT /api/temas/{id}   (el autor) */
    @PutMapping("/{id}")
    public TemaDetalleResponse actualizar(@PathVariable Long id, @Valid @RequestBody TemaActualizarRequest req,
                                          UsuarioSesion sesion) {
        return temas.actualizar(id, req, sesion);
    }

    /** DELETE /api/temas/{id}   (el autor, MODERADOR o ADMINISTRADOR) */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, UsuarioSesion sesion) {
        temas.eliminar(id, sesion);
        return ResponseEntity.noContent().build();
    }

    /** GET /api/temas/{id}/comentarios   (público) */
    @GetMapping("/{id}/comentarios")
    public List<ComentarioResponse> comentarios(@PathVariable Long id, @SesionOpcional UsuarioSesion sesion) {
        return comentarios.listarDelTema(id, sesion);
    }

    /** POST /api/temas/{id}/comentarios   (con sesión) comentar */
    @PostMapping("/{id}/comentarios")
    public ResponseEntity<ComentarioResponse> comentar(@PathVariable Long id,
                                                       @Valid @RequestBody ComentarioRequest req,
                                                       UsuarioSesion sesion) {
        ComentarioResponse creado = comentarios.crear(id, req, sesion);
        return ResponseEntity.created(URI.create("/api/comentarios/" + creado.id())).body(creado);
    }
}
