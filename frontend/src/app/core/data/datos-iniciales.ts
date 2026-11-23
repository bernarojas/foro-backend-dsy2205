import { Categoria, Comentario, RegistroModeracion, Rol, Tema, Usuario } from '../models/modelos';

/**
 * Datos de la aplicación como arreglos estáticos (la pauta pide manejar la información
 * con listas, arreglos o colecciones). Parten con los mismos registros de prueba que
 * el script de Oracle (database/02_script_foro.sql), más algunos extra para que el
 * foro se vea con movimiento.
 *
 * Todos los usuarios de prueba tienen la clave:  Duoc2026!
 */

export const CLAVE_DE_PRUEBA = 'Duoc2026!';

export const ROLES_INICIALES: Rol[] = [
  { id: 1, nombre: 'ADMINISTRADOR', descripcion: 'Administra usuarios, roles y categorías; puede banear o eliminar cualquier publicación' },
  { id: 2, nombre: 'MODERADOR', descripcion: 'Revisa las publicaciones y banea o restaura las que incumplen las normas' },
  { id: 3, nombre: 'USUARIO', descripcion: 'Publica temas y comenta; solo edita y elimina lo suyo' },
];

export const USUARIOS_INICIALES: Usuario[] = [
  {
    id: 1, nombre: 'Administrador Foro', email: 'admin@foro.cl', password: CLAVE_DE_PRUEBA, rolId: 1, estado: 'ACTIVO',
    fechaRegistro: '2026-09-01T09:00:00', biografia: 'Cuenta de administración de Tertulia.', color: '#14213d',
  },
  {
    id: 2, nombre: 'Camila Rojas', email: 'moderador@foro.cl', password: CLAVE_DE_PRUEBA, rolId: 2, estado: 'ACTIVO',
    fechaRegistro: '2026-09-01T09:30:00', biografia: 'Moderadora. Si algo no cumple las normas, avísame.', color: '#0f766e',
  },
  {
    id: 3, nombre: 'Diego Soto', email: 'diego@foro.cl', password: CLAVE_DE_PRUEBA, rolId: 3, estado: 'ACTIVO',
    fechaRegistro: '2026-09-03T18:22:00', biografia: 'Desarrollador backend, corredor aficionado.', color: '#b45309',
  },
  {
    id: 4, nombre: 'Valentina Muñoz', email: 'valentina@foro.cl', password: CLAVE_DE_PRUEBA, rolId: 3, estado: 'ACTIVO',
    fechaRegistro: '2026-09-05T12:47:00', biografia: 'Estudiante de informática. Guitarra y juegos cooperativos.', color: '#9d174d',
  },
  {
    id: 5, nombre: 'Matías Fuentes', email: 'matias@foro.cl', password: CLAVE_DE_PRUEBA, rolId: 3, estado: 'BLOQUEADO',
    fechaRegistro: '2026-09-08T21:15:00', biografia: '', color: '#6b7280',
  },
  {
    id: 6, nombre: 'Ignacio Vera', email: 'ignacio@foro.cl', password: CLAVE_DE_PRUEBA, rolId: 3, estado: 'ACTIVO',
    fechaRegistro: '2026-10-20T16:05:00', biografia: 'Armo computadores por gusto. Pádel los domingos.', color: '#1d4ed8',
  },
  {
    id: 7, nombre: 'Fernanda Lagos', email: 'fernanda@foro.cl', password: CLAVE_DE_PRUEBA, rolId: 3, estado: 'ACTIVO',
    fechaRegistro: '2026-10-28T11:40:00', biografia: 'Frontend con Angular. Cinéfila de domingo.', color: '#7c3aed',
  },
];

export const CATEGORIAS_INICIALES: Categoria[] = [
  { id: 1, nombre: 'Programación', descripcion: 'Lenguajes, frameworks, buenas prácticas y dudas de código', icono: 'bi-code-slash', color: '#1d4ed8' },
  { id: 2, nombre: 'Videojuegos', descripcion: 'Lanzamientos, reseñas, partidas y recomendaciones', icono: 'bi-controller', color: '#7c3aed' },
  { id: 3, nombre: 'Cine y Series', descripcion: 'Estrenos, críticas y teorías', icono: 'bi-film', color: '#be123c' },
  { id: 4, nombre: 'Deportes', descripcion: 'Fútbol, tenis, básquetbol y todo lo que sea competencia', icono: 'bi-trophy', color: '#15803d' },
  { id: 5, nombre: 'Música', descripcion: 'Bandas, conciertos, instrumentos y producción musical', icono: 'bi-music-note-beamed', color: '#c2410c' },
  { id: 6, nombre: 'Tecnología y Hardware', descripcion: 'Armado de PC, celulares, componentes y gadgets', icono: 'bi-cpu', color: '#0f766e' },
];

export const TEMAS_INICIALES: Tema[] = [
  {
    id: 1, categoriaId: 1, autorId: 3, autorNombre: 'Diego Soto', estado: 'PUBLICADO',
    titulo: '¿Spring Boot o Quarkus para microservicios?',
    contenido: 'Estoy armando un backend con varios microservicios y no sé cuál elegir.\n\nSpring Boot lo conozco más, pero he leído que Quarkus parte más rápido y usa menos memoria. ¿Qué experiencia tienen con cada uno?',
    fechaCreacion: '2026-10-05T09:12:00', fechaActualizacion: null,
  },
  {
    id: 2, categoriaId: 1, autorId: 4, autorNombre: 'Valentina Muñoz', estado: 'PUBLICADO',
    titulo: 'Conectar Spring Boot a Oracle Cloud con wallet',
    contenido: 'Les dejo los pasos que me funcionaron para usar el wallet de Autonomous Database desde Spring Boot:\n\n1. Descargar el wallet desde la consola de Oracle Cloud y descomprimirlo.\n2. Apuntar TNS_ADMIN a esa carpeta en la URL de conexión.\n3. Agregar las dependencias ojdbc11 y oraclepki.\n\nSi a alguien le sale el error ORA-12154, casi siempre es la ruta del wallet.',
    fechaCreacion: '2026-10-07T18:40:00', fechaActualizacion: null,
  },
  {
    id: 3, categoriaId: 2, autorId: 4, autorNombre: 'Valentina Muñoz', estado: 'PUBLICADO',
    titulo: 'Mejores juegos cooperativos para jugar en pareja',
    contenido: 'Busco recomendaciones de juegos cooperativos en pantalla dividida. Ya terminamos Portal 2 y nos encantó.\n\n¿Cuáles recomiendan?',
    fechaCreacion: '2026-10-09T21:05:00', fechaActualizacion: null,
  },
  {
    id: 4, categoriaId: 3, autorId: 3, autorNombre: 'Diego Soto', estado: 'PUBLICADO',
    titulo: 'Series de ciencia ficción subestimadas',
    contenido: 'Comparto mi lista de series de ciencia ficción que pasaron desapercibidas: Counterpart, Devs y Station Eleven.\n\n¿Agregarían alguna?',
    fechaCreacion: '2026-10-12T15:30:00', fechaActualizacion: null,
  },
  {
    id: 5, categoriaId: 4, autorId: 3, autorNombre: 'Diego Soto', estado: 'PUBLICADO',
    titulo: 'Rutina de running para principiantes',
    contenido: '¿Cómo empezaron a correr? Quiero llegar a 10 km sin lesionarme. Hoy aguanto 2 km de corrido y después me duelen las canillas.',
    fechaCreacion: '2026-10-15T07:50:00', fechaActualizacion: null,
  },
  {
    id: 6, categoriaId: 5, autorId: 4, autorNombre: 'Valentina Muñoz', estado: 'PUBLICADO',
    titulo: 'Aprender guitarra de forma autodidacta',
    contenido: '¿Qué canales o métodos recomiendan para aprender guitarra sin profesor? Tengo una acústica y unos 30 minutos al día.',
    fechaCreacion: '2026-10-18T20:10:00', fechaActualizacion: null,
  },
  {
    id: 7, categoriaId: 6, autorId: 2, autorNombre: 'Camila Rojas', estado: 'PUBLICADO',
    titulo: 'Normas del foro: léelas antes de publicar',
    contenido: 'Respeto entre usuarios, nada de spam ni contenido ofensivo. Los temas y comentarios que no cumplan serán retirados por el equipo de moderación.\n\nEl detalle completo está en la página de Normas.',
    fechaCreacion: '2026-10-01T10:00:00', fechaActualizacion: null,
  },
  {
    id: 8, categoriaId: 6, autorId: 6, autorNombre: 'Ignacio Vera', estado: 'PUBLICADO',
    titulo: '¿Vale la pena pasar a DDR5 este año?',
    contenido: 'Tengo una placa AM4 con 32 GB DDR4 y estoy pensando en cambiar la plataforma completa. Para programar y jugar en 1440p, ¿se nota la diferencia o mejor espero?',
    fechaCreacion: '2026-11-02T19:25:00', fechaActualizacion: null,
  },
  {
    id: 9, categoriaId: 1, autorId: 7, autorNombre: 'Fernanda Lagos', estado: 'PUBLICADO',
    titulo: 'Angular con signals: ¿ya dejaron RxJS?',
    contenido: 'En los proyectos nuevos estoy usando signals para casi todo el estado y dejando RxJS solo para eventos y peticiones HTTP.\n\n¿Cómo lo están manejando ustedes? ¿Algún caso donde signals se les quedó corto?',
    fechaCreacion: '2026-11-08T10:15:00', fechaActualizacion: '2026-11-08T12:02:00',
  },
  {
    id: 10, categoriaId: 3, autorId: 7, autorNombre: 'Fernanda Lagos', estado: 'PUBLICADO',
    titulo: 'Recomendaciones de cine chileno reciente',
    contenido: 'Quiero ponerme al día con el cine chileno de los últimos años. Acepto de todo: ficción, documental, animación.',
    fechaCreacion: '2026-11-12T22:30:00', fechaActualizacion: null,
  },
  {
    id: 11, categoriaId: 2, autorId: 5, autorNombre: 'Matías Fuentes', estado: 'BANEADO',
    titulo: 'GANA SKINS GRATIS!!! entra a este link',
    contenido: 'Skins gratis para todos los juegos, solo tienen que entrar al link de mi perfil y poner su usuario y su clave. Funciona 100% real no fake.',
    fechaCreacion: '2026-11-10T03:12:00', fechaActualizacion: null,
  },
  {
    id: 12, categoriaId: 4, autorId: 6, autorNombre: 'Ignacio Vera', estado: 'PUBLICADO',
    titulo: 'Canchas de pádel en Santiago: datos y precios',
    contenido: 'Armemos una lista de canchas con precio por hora y si arriendan paletas. Parto yo: en Ñuñoa estoy pagando $18.000 la hora en horario bajo.',
    fechaCreacion: '2026-11-15T13:05:00', fechaActualizacion: null,
  },
  {
    id: 13, categoriaId: 5, autorId: 3, autorNombre: 'Diego Soto', estado: 'PUBLICADO',
    titulo: 'Festivales de verano: ¿a cuál van?',
    contenido: 'Ya salieron varios carteles para enero y febrero. ¿A cuál piensan ir y con cuánta anticipación compran las entradas?',
    fechaCreacion: '2026-11-18T17:48:00', fechaActualizacion: null,
  },
];

export const COMENTARIOS_INICIALES: Comentario[] = [
  { id: 1, temaId: 1, autorId: 4, autorNombre: 'Valentina Muñoz', estado: 'PUBLICADO', fechaCreacion: '2026-10-05T11:03:00', contenido: 'Spring Boot tiene mucha más documentación y comunidad. Para aprender, lo recomiendo.' },
  { id: 2, temaId: 1, autorId: 2, autorNombre: 'Camila Rojas', estado: 'PUBLICADO', fechaCreacion: '2026-10-05T13:27:00', contenido: 'Quarkus parte más rápido, pero Spring Boot es el estándar en la mayoría de las empresas.' },
  { id: 3, temaId: 1, autorId: 3, autorNombre: 'Diego Soto', estado: 'PUBLICADO', fechaCreacion: '2026-10-05T19:44:00', contenido: 'Gracias a las dos, me quedo con Spring Boot.' },
  { id: 4, temaId: 2, autorId: 3, autorNombre: 'Diego Soto', estado: 'PUBLICADO', fechaCreacion: '2026-10-08T08:15:00', contenido: 'Me sirvió mucho, el TNS_ADMIN era lo que me faltaba.' },
  { id: 5, temaId: 3, autorId: 3, autorNombre: 'Diego Soto', estado: 'PUBLICADO', fechaCreacion: '2026-10-09T22:31:00', contenido: 'It Takes Two, sin duda. También Overcooked 2.' },
  { id: 6, temaId: 3, autorId: 2, autorNombre: 'Camila Rojas', estado: 'PUBLICADO', fechaCreacion: '2026-10-10T10:02:00', contenido: 'Stardew Valley en cooperativo también es muy entretenido.' },
  { id: 7, temaId: 4, autorId: 4, autorNombre: 'Valentina Muñoz', estado: 'PUBLICADO', fechaCreacion: '2026-10-13T17:20:00', contenido: 'Agregaría Dark y The Expanse.' },
  { id: 8, temaId: 5, autorId: 4, autorNombre: 'Valentina Muñoz', estado: 'PUBLICADO', fechaCreacion: '2026-10-15T12:05:00', contenido: 'Empieza alternando caminata y trote, 3 veces por semana.' },
  { id: 9, temaId: 6, autorId: 3, autorNombre: 'Diego Soto', estado: 'PUBLICADO', fechaCreacion: '2026-10-19T09:41:00', contenido: 'Justin Guitar es gratis y está muy bien ordenado.' },
  { id: 10, temaId: 8, autorId: 3, autorNombre: 'Diego Soto', estado: 'PUBLICADO', fechaCreacion: '2026-11-02T21:10:00', contenido: 'Para programar no vas a notar nada. Yo esperaría a que tu equipo de verdad se quede corto.' },
  { id: 11, temaId: 8, autorId: 7, autorNombre: 'Fernanda Lagos', estado: 'PUBLICADO', fechaCreacion: '2026-11-03T09:32:00', contenido: 'Si compilas proyectos grandes, el salto se nota más por el procesador que por la memoria.' },
  { id: 12, temaId: 9, autorId: 3, autorNombre: 'Diego Soto', estado: 'PUBLICADO', fechaCreacion: '2026-11-08T14:20:00', contenido: 'Desde el backend lo veo con envidia: el código de los componentes queda mucho más corto.' },
  { id: 13, temaId: 9, autorId: 6, autorNombre: 'Ignacio Vera', estado: 'PUBLICADO', fechaCreacion: '2026-11-09T08:05:00', contenido: 'Para búsquedas con espera entre teclas sigo prefiriendo RxJS. Para todo lo demás, signals.' },
  { id: 14, temaId: 9, autorId: 5, autorNombre: 'Matías Fuentes', estado: 'BANEADO', fechaCreacion: '2026-11-09T23:51:00', contenido: 'Qué pregunta más tonta, se nota que no sabes programar. Dedícate a otra cosa.' },
  { id: 15, temaId: 10, autorId: 4, autorNombre: 'Valentina Muñoz', estado: 'PUBLICADO', fechaCreacion: '2026-11-13T10:44:00', contenido: 'El Agente Topo y La Memoria Infinita, para partir por los documentales.' },
  { id: 16, temaId: 12, autorId: 3, autorNombre: 'Diego Soto', estado: 'PUBLICADO', fechaCreacion: '2026-11-15T18:30:00', contenido: 'En Maipú hay a $14.000 antes de las 17:00, con paletas incluidas.' },
  { id: 17, temaId: 13, autorId: 4, autorNombre: 'Valentina Muñoz', estado: 'PUBLICADO', fechaCreacion: '2026-11-19T09:15:00', contenido: 'Yo compro en la preventa: después suben harto y se agotan las entradas generales.' },
  { id: 18, temaId: 13, autorId: 7, autorNombre: 'Fernanda Lagos', estado: 'PUBLICADO', fechaCreacion: '2026-11-20T20:02:00', contenido: 'Este año voy solo a uno, pero los tres días.' },
];

export const MODERACION_INICIAL: RegistroModeracion[] = [
  {
    id: 1, tipo: 'COMENTARIO', publicacionId: 14, referencia: 'Qué pregunta más tonta, se nota que no sabes programar…',
    accion: 'BANEAR', motivo: 'Insulto a otro usuario (norma 1: respeto entre usuarios).',
    moderadorId: 2, moderadorNombre: 'Camila Rojas', fecha: '2026-11-10T08:40:00',
  },
  {
    id: 2, tipo: 'TEMA', publicacionId: 11, referencia: 'GANA SKINS GRATIS!!! entra a este link',
    accion: 'BANEAR', motivo: 'Spam con enlaces engañosos que piden la clave de la cuenta (norma 2).',
    moderadorId: 2, moderadorNombre: 'Camila Rojas', fecha: '2026-11-10T08:45:00',
  },
];

/** Colores disponibles para el avatar al registrarse o editar el perfil. */
export const COLORES_AVATAR = ['#14213d', '#1d4ed8', '#0f766e', '#15803d', '#b45309', '#be123c', '#9d174d', '#7c3aed'];

/** Íconos que el administrador puede elegir para una categoría. */
export const ICONOS_CATEGORIA = [
  'bi-code-slash', 'bi-controller', 'bi-film', 'bi-trophy', 'bi-music-note-beamed', 'bi-cpu',
  'bi-book', 'bi-camera', 'bi-airplane', 'bi-cup-hot', 'bi-palette', 'bi-heart-pulse',
  'bi-briefcase', 'bi-car-front', 'bi-globe-americas', 'bi-chat-dots',
];
