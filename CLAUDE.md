# Prompt para Claude Code — Sitio web del equipo de fútbol

## Contexto

Somos un equipo de fútbol amateur que compite en ligas los fines de semana. Necesito un sitio web para centralizar toda la información del equipo: fixture, resultados, plantel, estadísticas, formaciones, historial de camisetas/escudos, y posts de Instagram. Voy a ser el único administrador que carga los datos después de cada partido, así que necesito un panel de admin simple y rápido de usar desde el celular.

## Identidad del equipo

- **Nombre**: La Timba FC  
- **Slogan**: "Redoblo la apuesta por este amor" (usar en el hero de Inicio y donde tenga sentido reforzar la identidad del club)  
- **Escudo**: ficha de póker circular en blanco y negro, con un trébol negro en el centro y el texto "LA TIMBA" repetido bordeando el círculo interior (archivo del escudo ya disponible para el proyecto)  
- **Colores principales**: azul marino con matiz violáceo \+ blanco (ej. `#1E2A54` de referencia — ajustar mirando el archivo real de la camiseta)  
- **Colores alternativos** (segunda camiseta): negro con detalles en azul  
- **Nota de datos**: el nombre del equipo en el sistema externo de la liga aparece como "LA TIMBA" — coincide con este equipo, así que al mostrar la tabla de posiciones conviene **destacar visualmente esa fila** (fondo o borde distinto) para que se identifique de un vistazo

## Stack tecnológico

- **Next.js 14+ (App Router)** con TypeScript  
- **Tailwind CSS** para estilos  
- **Supabase**:  
  - Postgres para todos los datos  
  - Auth para el login del panel de admin (un único usuario administrador)  
  - Storage para imágenes (fotos de jugadores, camisetas, escudos)  
- **Vercel** para el despliegue

## Modelo de datos (Postgres / Supabase)

- `torneos`: id, nombre, fecha\_inicio, fecha\_fin, activo (bool)  
- `partidos`: id, torneo\_id (fk), fecha, hora, rival, condicion (local/visitante), goles\_favor, goles\_contra, estado (programado/jugado/suspendido)  
- `jugadores`: id, nombre, apodo, numero, posicion, foto\_url, activo (bool)  
- `eventos_partido`: id, partido\_id (fk), jugador\_id (fk), tipo (gol/asistencia/ amarilla/roja), minuto (opcional) → Las estadísticas totales (goles, asistencias, amarillas, rojas por jugador y por torneo) se calculan agregando esta tabla, **no se cargan a mano**, para que nunca queden desincronizadas con el historial de partidos.  
- `formaciones`: id, partido\_id (fk), esquema (ej. "4-4-2", "4-3-3")  
- `formacion_jugadores`: formacion\_id (fk), jugador\_id (fk), posicion\_slot (identificador de la posición en la cancha), titular (bool)  
- `camisetas_escudos`: id, tipo (camiseta/escudo), temporada, imagen\_url, descripcion, orden  
- `tabla_posiciones`: torneo\_id, zona\_nombre, equipo\_nombre, escudo\_url, pj, pg, pe, pp, gf, gc, dg, puntos, actualizado\_en → Se llena automáticamente vía sincronización externa (ver sección "Sincronización de la tabla de posiciones"), no se carga a mano.  
- `instagram_posts`: id, embed\_code (el blockquote que da Instagram), fecha, descripcion (opcional)

## Estructura del sitio (público)

1. **Inicio**: próximo partido con cuenta regresiva, último resultado, accesos rápidos a las demás secciones  
2. **Fixture**: próximos partidos del torneo activo  
3. **Resultados**: historial de partidos jugados, con goleadores por partido  
4. **Tabla de posiciones**: tabla completa de la liga (vía sincronización automática), con la fila de La Timba FC destacada visualmente  
5. **Plantel**: grilla de jugadores con foto, número, posición  
6. **Estadísticas**: tablas de goles/asistencias/amarillas/rojas por jugador, filtrables por torneo  
7. **Formaciones**: cancha visual con la alineación de cada partido (mostrar por partido seleccionado)  
8. **Camisetas y escudos**: galería/línea de tiempo por temporada  
9. **Instagram**: grilla con los embeds cargados desde el admin  
10. (Opcional, fase posterior) Sección "Historia" o "Sobre nosotros"

## Panel de administración

- Ruta protegida `/admin`, login con Supabase Auth (email \+ password), un solo usuario administrador (yo)  
- Funcionalidades CRUD para: torneos, partidos, jugadores, eventos de partido, formaciones, camisetas/escudos, posts de Instagram  
- Al cargar un partido jugado, debería poder cargar en la misma pantalla el resultado y los eventos (goles/asistencias/tarjetas) de ese partido  
- Para Instagram: **no usar la API oficial de Meta** (requiere cuenta business y aprobación). En su lugar, pegar el embed code (blockquote) de un post puntual y guardarlo tal cual  
- Subida de imágenes directo a Supabase Storage (fotos de jugadores, camisetas, escudos)

## Sincronización de la tabla de posiciones

La liga usa la plataforma "Todo Torneos" (iBaires SRL), que expone un endpoint REST interno (no documentado públicamente) que devuelve la tabla de posiciones en JSON, sin necesitar autenticación:

GET https://ihotelapp.com:8443/TorneoFutbolRestV1\_5/app/posiciones/posicioness/torneo/46

Devuelve un array de zonas/divisiones, cada una con un array `posiciones` que trae, por equipo: `equipo.nombre`, `equipo.urlEscudo`, `pj`, `pg`, `pe`, `pp`, `gf`, `gc`, `dg`, `puntos`.

Implementar un job programado (cron — puede ser un Vercel Cron Job o una Supabase Edge Function con `pg_cron`) que:

1. Haga `GET` a ese endpoint cada 6 horas aproximadamente (no hace falta más frecuencia para una liga amateur de fin de semana, y conviene no sobrecargar un endpoint que no es una API pública oficial)  
2. Parsee la respuesta y la guarde/actualice en la tabla `tabla_posiciones`  
3. El sitio público siempre lee de `tabla_posiciones` en la base propia — nunca llama al endpoint externo en el momento en que alguien visita el sitio

**Importante**: al ser un endpoint interno no documentado, puede cambiar de formato, mudar de dominio, o dejar de responder sin aviso. El job tiene que manejar el error con gracia: si falla, mantener los últimos datos guardados y mostrar un timestamp de "última actualización" en el sitio, en vez de romper la sección o mostrar una tabla vacía.

## Fases de desarrollo sugeridas

**Fase 1 (MVP)**

- Setup del proyecto (Next.js \+ Supabase \+ Tailwind \+ Vercel)  
- Modelo de datos base  
- Login de admin  
- CRUD de jugadores, partidos y eventos de partido  
- Páginas públicas: Inicio, Fixture, Resultados, Plantel, Estadísticas

**Fase 2**

- Formaciones (componente visual de cancha \+ asignación de jugadores a slots)  
- Camisetas y escudos (galería histórica)  
- Job de sincronización de la tabla de posiciones (ver sección correspondiente)

**Fase 3**

- Instagram (embeds manuales)  
- Pulido visual y mobile-first (probablemente se va a ver mucho desde el celu)

## Consideraciones de diseño

- Mobile-first  
- Usar los colores y el escudo de La Timba FC (ver sección "Identidad del equipo")  
- Estética deportiva, limpia, minimalista

## Notas para Claude Code

- Empezar por la Fase 1 completa y funcional antes de avanzar a la Fase 2  
- Priorizar que el panel de admin sea simple de usar desde un celular, ya que se va a cargar información parado en la cancha o en el vestuario después de jugar
