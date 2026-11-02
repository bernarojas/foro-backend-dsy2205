package cl.duoc.foro.foro.service;

import java.util.List;
import java.util.Locale;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.duoc.foro.foro.dto.ComentarioResponse;
import cl.duoc.foro.foro.dto.TemaActualizarRequest;
import cl.duoc.foro.foro.dto.TemaDetalleResponse;
import cl.duoc.foro.foro.dto.TemaRequest;
import cl.duoc.foro.foro.dto.TemaResumenResponse;
import cl.duoc.foro.foro.exception.ApiException;
import cl.duoc.foro.foro.model.EstadoPublicacion;
import cl.duoc.foro.foro.model.Tema;
import cl.duoc.foro.foro.repository.ComentarioRepository;
import cl.duoc.foro.foro.repository.TemaRepository;
import cl.duoc.foro.foro.security.UsuarioSesion;

/**
 * Temas del foro:
 * - Buscar y ver es público (solo lo publicado).
 * - Publicar exige sesión; el autor sale del token.
 * - Modificar: el autor. Eliminar: el autor, un MODERADOR o un ADMINISTRADOR.
 */
@Service
public class TemaService {

    private static final int MAX_POPULARES = 20;

    private final TemaRepository temas;
    private final ComentarioRepository comentarios;
    private final CategoriaService categorias;

    public TemaService(TemaRepository temas, ComentarioRepository comentarios, CategoriaService categorias) {
        this.temas = temas;
        this.comentarios = comentarios;
        this.categorias = categorias;
    }

    @Transactional(readOnly = true)
    public List<TemaResumenResponse> buscar(String texto, Long categoriaId, Long autorId) {
        if (categoriaId != null) {
            categorias.buscar(categoriaId); // 404 si la categoría no existe
        }
        String patron = (texto == null || texto.isBlank()) ? null : "%" + texto.trim().toLowerCase(Locale.ROOT) + "%";
        return temas.buscar(patron, categoriaId, autorId).stream()
                .map(f -> TemaResumenResponse.de((Tema) f[0], ((Number) f[1]).longValue()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TemaResumenResponse> masComentados(int limite) {
        if (limite < 1 || limite > MAX_POPULARES) {
            throw ApiException.solicitudInvalida("El límite debe estar entre 1 y " + MAX_POPULARES);
        }
        return temas.masComentados(PageRequest.of(0, limite)).stream()
                .map(f -> TemaResumenResponse.de((Tema) f[0], ((Number) f[1]).longValue()))
                .toList();
    }

    @Transactional(readOnly = true)
    public TemaDetalleResponse obtener(Long id, UsuarioSesion sesion) {
        Tema t = buscarVisible(id, sesion);
        List<ComentarioResponse> lista = comentarios
                .findByTemaIdAndEstadoOrderByFechaCreacionAsc(id, EstadoPublicacion.PUBLICADO)
                .stream().map(ComentarioResponse::de).toList();
        return TemaDetalleResponse.de(t, lista);
    }

    @Transactional
    public TemaDetalleResponse crear(TemaRequest req, UsuarioSesion sesion) {
        Tema t = new Tema();
        t.setCategoria(categorias.buscar(req.categoriaId()));
        t.setTitulo(req.titulo().trim());
        t.setContenido(req.contenido().trim());
        t.setAutorId(sesion.id());
        t.setAutorNombre(sesion.nombre());
        t.setEstado(EstadoPublicacion.PUBLICADO);
        return TemaDetalleResponse.de(temas.save(t), List.of());
    }

    @Transactional
    public TemaDetalleResponse actualizar(Long id, TemaActualizarRequest req, UsuarioSesion sesion) {
        Tema t = buscar(id);
        if (!sesion.esElMismo(t.getAutorId())) {
            throw ApiException.prohibido("Solo el autor puede modificar el tema");
        }
        if (t.getEstado() == EstadoPublicacion.BANEADO) {
            throw ApiException.conflicto("El tema fue baneado por la moderación y no se puede modificar");
        }
        if (req.categoriaId() != null) {
            t.setCategoria(categorias.buscar(req.categoriaId()));
        }
        if (req.titulo() != null) {
            if (req.titulo().isBlank()) {
                throw ApiException.solicitudInvalida("El título no puede quedar vacío");
            }
            t.setTitulo(req.titulo().trim());
        }
        if (req.contenido() != null) {
            if (req.contenido().isBlank()) {
                throw ApiException.solicitudInvalida("El contenido no puede quedar vacío");
            }
            t.setContenido(req.contenido().trim());
        }
        temas.flush(); // dispara @PreUpdate para que la respuesta traiga la fecha de modificación
        return obtener(id, sesion);
    }

    @Transactional
    public void eliminar(Long id, UsuarioSesion sesion) {
        Tema t = buscar(id);
        if (!sesion.esElMismo(t.getAutorId()) && !sesion.esStaff()) {
            throw ApiException.prohibido("Solo el autor, un MODERADOR o un ADMINISTRADOR puede eliminar el tema");
        }
        comentarios.eliminarDelTema(id);
        temas.delete(t);
    }

    /** Un tema baneado solo lo ven su autor y la moderación. */
    Tema buscarVisible(Long id, UsuarioSesion sesion) {
        Tema t = buscar(id);
        boolean puedeVerBaneado = sesion != null && (sesion.esStaff() || sesion.esElMismo(t.getAutorId()));
        if (t.getEstado() == EstadoPublicacion.BANEADO && !puedeVerBaneado) {
            throw ApiException.noEncontrado("No existe el tema con id " + id);
        }
        return t;
    }

    Tema buscar(Long id) {
        return temas.findById(id)
                .orElseThrow(() -> ApiException.noEncontrado("No existe el tema con id " + id));
    }
}
