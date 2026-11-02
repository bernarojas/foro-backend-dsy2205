package cl.duoc.foro.foro.security;

import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import cl.duoc.foro.foro.exception.ApiException;

/**
 * Permite recibir el usuario de la sesión como parámetro del controlador:
 * {@code public X metodo(UsuarioSesion sesion)}.
 */
@Component
public class SesionArgumentResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return UsuarioSesion.class.equals(parameter.getParameterType());
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
        Object sesion = webRequest.getAttribute(AuthInterceptor.ATRIBUTO, RequestAttributes.SCOPE_REQUEST);
        if (sesion == null && !parameter.hasParameterAnnotation(SesionOpcional.class)) {
            throw ApiException.noAutenticado("Debes iniciar sesión (cabecera Authorization: Bearer <token>)");
        }
        return sesion;
    }
}
