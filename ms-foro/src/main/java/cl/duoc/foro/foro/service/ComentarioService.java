package cl.duoc.foro.foro.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.duoc.foro.foro.dto.ComentarioRequest;
import cl.duoc.foro.foro.dto.ComentarioResponse;
import cl.duoc.foro.foro.exception.ApiException;
import cl.duoc.foro.foro.model.Comentario;
import cl.duoc.foro.foro.model.EstadoPublicacion;
import cl.duoc.foro.foro.model.Tema;
import cl.duoc.foro.foro.repository.ComentarioRepository;
import cl.duoc.foro.foro.security.UsuarioSesion;

/**
 * Comentarios:
 * - Ver es público. Comentar exige sesión y que el tema esté publicado.
 * - Modificar: el autor. Eliminar: el autor, un MODERADOR o un ADMINISTRADOR.
 */
@Service
public class ComentarioService {

    private final ComentarioRepository comentarios;
    private final TemaService temas;

    public ComentarioService(ComentarioRepository comentarios, TemaService temas) {
        this.comentarios = comentarios;
        this.temas = temas;
    }

    @Transactional(readOnly = true)
    public List<ComentarioResponse> listarDelTema(Long temaId, UsuarioSesion sesion) {
        temas.buscarVisible(temaId, sesion);
        return comentarios.findByTemaIdAndEstadoOrderByFechaCreacionAsc(temaId, EstadoPublicacion.PUBLICADO)
                .stream().map(ComentarioResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public ComentarioResponse obtener(Long id, UsuarioSesion sesion) {
        Comentario c = buscar(id);
        boolean puedeVerBaneado = sesion != null && (sesion.esStaff() || sesion.esElMismo(c.getAutorId()));
        if (c.getEstado() == EstadoPublicacion.BANEADO && !puedeVerBaneado) {
            throw ApiException.noEncontrado("No existe el comentario con id " + id);
        }
        return ComentarioResponse.de(c);
    }

    @Transactional
    public ComentarioResponse crear(Long temaId, ComentarioRequest req, UsuarioSesion sesion) {
        Tema tema = temas.buscar(temaId);
        if (tema.getEstado() != EstadoPublicacion.PUBLICADO) {
            throw ApiException.conflicto("No se puede comentar un tema que no está publicado");
        }
        Comentario c = new Comentario();
        c.setTema(tema);
        c.setContenido(req.contenido().trim());
        c.setAutorId(sesion.id());
        c.setAutorNombre(sesion.nombre());
        c.setEstado(EstadoPublicacion.PUBLICADO);
        return ComentarioResponse.de(comentarios.save(c));
    }

    @Transactional
    public ComentarioResponse actualizar(Long id, ComentarioRequest req, UsuarioSesion sesion) {
        Comentario c = buscar(id);
        if (!sesion.esElMismo(c.getAutorId())) {
            throw ApiException.prohibido("Solo el autor puede modificar el comentario");
        }
        if (c.getEstado() == EstadoPublicacion.BANEADO) {
            throw ApiException.conflicto("El comentario fue baneado por la moderación y no se puede modificar");
        }
        c.setContenido(req.contenido().trim());
        return ComentarioResponse.de(c);
    }

    @Transactional
    public void eliminar(Long id, UsuarioSesion sesion) {
        Comentario c = buscar(id);
        if (!sesion.esElMismo(c.getAutorId()) && !sesion.esStaff()) {
            throw ApiException.prohibido("Solo el autor, un MODERADOR o un ADMINISTRADOR puede eliminar el comentario");
        }
        comentarios.delete(c);
    }

    private Comentario buscar(Long id) {
        return comentarios.findById(id)
                .orElseThrow(() -> ApiException.noEncontrado("No existe el comentario con id " + id));
    }
}
