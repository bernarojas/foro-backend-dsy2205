package cl.duoc.foro.moderacion.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.foro.moderacion.dto.BanearRequest;
import cl.duoc.foro.moderacion.dto.ModeracionResponse;
import cl.duoc.foro.moderacion.dto.PublicacionResponse;
import cl.duoc.foro.moderacion.dto.RestaurarRequest;
import cl.duoc.foro.moderacion.dto.ResumenResponse;
import cl.duoc.foro.moderacion.model.AccionModeracion;
import cl.duoc.foro.moderacion.model.EstadoPublicacion;
import cl.duoc.foro.moderacion.model.TipoPublicacion;
import cl.duoc.foro.moderacion.security.UsuarioSesion;
import cl.duoc.foro.moderacion.service.ModeracionService;
import jakarta.validation.Valid;

/**
 * Gestión de publicaciones por la moderación: revisar, banear y restaurar temas y
 * comentarios, y consultar el historial. Todo exige sesión de ADMINISTRADOR o MODERADOR.
 */
@RestController
@RequestMapping("/api/moderacion")
public class ModeracionController {

    private final ModeracionService service;

    public ModeracionController(ModeracionService service) {
        this.service = service;
    }

    /** GET /api/moderacion/temas?estado=&texto=   temas para revisión, incluidos los baneados */
    @GetMapping("/temas")
    public List<PublicacionResponse> temas(@RequestParam(required = false) EstadoPublicacion estado,
                                           @RequestParam(required = false) String texto,
                                           UsuarioSesion sesion) {
        return service.listar(TipoPublicacion.TEMA, estado, texto, sesion);
    }

    /** PUT /api/moderacion/temas/{id}/banear   con el motivo (obligatorio) */
    @PutMapping("/temas/{id}/banear")
    public PublicacionResponse banearTema(@PathVariable Long id, @Valid @RequestBody BanearRequest req,
                                          UsuarioSesion sesion) {
        return service.banear(TipoPublicacion.TEMA, id, req, sesion);
    }

    /** PUT /api/moderacion/temas/{id}/restaurar   el motivo es opcional */
    @PutMapping("/temas/{id}/restaurar")
    public PublicacionResponse restaurarTema(@PathVariable Long id,
                                             @Valid @RequestBody(required = false) RestaurarRequest req,
                                             UsuarioSesion sesion) {
        return service.restaurar(TipoPublicacion.TEMA, id, req, sesion);
    }

    /** GET /api/moderacion/comentarios?estado=&texto=   comentarios para revisión, incluidos los baneados */
    @GetMapping("/comentarios")
    public List<PublicacionResponse> comentarios(@RequestParam(required = false) EstadoPublicacion estado,
                                                 @RequestParam(required = false) String texto,
                                                 UsuarioSesion sesion) {
        return service.listar(TipoPublicacion.COMENTARIO, estado, texto, sesion);
    }

    /** PUT /api/moderacion/comentarios/{id}/banear   con el motivo (obligatorio) */
    @PutMapping("/comentarios/{id}/banear")
    public PublicacionResponse banearComentario(@PathVariable Long id, @Valid @RequestBody BanearRequest req,
                                                UsuarioSesion sesion) {
        return service.banear(TipoPublicacion.COMENTARIO, id, req, sesion);
    }

    /** PUT /api/moderacion/comentarios/{id}/restaurar   el motivo es opcional */
    @PutMapping("/comentarios/{id}/restaurar")
    public PublicacionResponse restaurarComentario(@PathVariable Long id,
                                                   @Valid @RequestBody(required = false) RestaurarRequest req,
                                                   UsuarioSesion sesion) {
        return service.restaurar(TipoPublicacion.COMENTARIO, id, req, sesion);
    }

    /** GET /api/moderacion/historial?tipo=&accion=&moderadorId=&publicacionId=   lo más reciente primero */
    @GetMapping("/historial")
    public List<ModeracionResponse> historial(@RequestParam(required = false) TipoPublicacion tipo,
                                              @RequestParam(required = false) AccionModeracion accion,
                                              @RequestParam(required = false) Long moderadorId,
                                              @RequestParam(required = false) Long publicacionId,
                                              UsuarioSesion sesion) {
        return service.historial(tipo, accion, moderadorId, publicacionId, sesion);
    }

    /** GET /api/moderacion/resumen   publicados y baneados, y acciones por moderador */
    @GetMapping("/resumen")
    public ResumenResponse resumen(UsuarioSesion sesion) {
        return service.resumen(sesion);
    }
}
