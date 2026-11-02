package cl.duoc.foro.foro.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.duoc.foro.foro.dto.CategoriaRequest;
import cl.duoc.foro.foro.dto.CategoriaResponse;
import cl.duoc.foro.foro.exception.ApiException;
import cl.duoc.foro.foro.model.Categoria;
import cl.duoc.foro.foro.repository.CategoriaRepository;
import cl.duoc.foro.foro.repository.TemaRepository;
import cl.duoc.foro.foro.security.UsuarioSesion;

/** Categorías del foro: cualquiera las ve; solo el ADMINISTRADOR las crea, modifica o elimina. */
@Service
public class CategoriaService {

    private final CategoriaRepository categorias;
    private final TemaRepository temas;

    public CategoriaService(CategoriaRepository categorias, TemaRepository temas) {
        this.categorias = categorias;
        this.temas = temas;
    }

    /** Lista con estadística: temas, comentarios y la última publicación de cada categoría. */
    @Transactional(readOnly = true)
    public List<CategoriaResponse> listar() {
        return categorias.estadisticas().stream()
                .map(f -> new CategoriaResponse(
                        ((Number) f[0]).longValue(),
                        (String) f[1],
                        (String) f[2],
                        ((Number) f[3]).longValue(),
                        ((Number) f[4]).longValue(),
                        (LocalDateTime) f[5]))
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoriaResponse obtener(Long id) {
        return listar().stream()
                .filter(c -> c.id().equals(id))
                .findFirst()
                .orElseThrow(() -> ApiException.noEncontrado("No existe la categoría con id " + id));
    }

    @Transactional
    public CategoriaResponse crear(CategoriaRequest req, UsuarioSesion sesion) {
        exigirAdministrador(sesion);
        String nombre = req.nombre().trim();
        if (categorias.existsByNombreIgnoreCase(nombre)) {
            throw ApiException.conflicto("Ya existe la categoría " + nombre);
        }
        Categoria c = new Categoria();
        c.setNombre(nombre);
        c.setDescripcion(req.descripcion());
        return CategoriaResponse.de(categorias.save(c));
    }

    @Transactional
    public CategoriaResponse actualizar(Long id, CategoriaRequest req, UsuarioSesion sesion) {
        exigirAdministrador(sesion);
        Categoria c = buscar(id);
        String nombre = req.nombre().trim();
        if (categorias.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw ApiException.conflicto("Ya existe otra categoría llamada " + nombre);
        }
        c.setNombre(nombre);
        c.setDescripcion(req.descripcion());
        return CategoriaResponse.de(c);
    }

    @Transactional
    public void eliminar(Long id, UsuarioSesion sesion) {
        exigirAdministrador(sesion);
        Categoria c = buscar(id);
        if (temas.existsByCategoriaId(id)) {
            throw ApiException.conflicto("No se puede eliminar: la categoría " + c.getNombre() + " tiene temas");
        }
        categorias.delete(c);
    }

    Categoria buscar(Long id) {
        return categorias.findById(id)
                .orElseThrow(() -> ApiException.noEncontrado("No existe la categoría con id " + id));
    }

    private static void exigirAdministrador(UsuarioSesion sesion) {
        if (!sesion.esAdministrador()) {
            throw ApiException.prohibido("Solo un ADMINISTRADOR puede administrar las categorías");
        }
    }
}
