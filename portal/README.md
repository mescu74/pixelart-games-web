# Pixel Sur Arcade

Portal público para descubrir y jugar juegos HTML5/pixel art. Las subidas y la publicación están reservadas al panel de administración. Primer juego: **BA Invaders**, con el mapa real y la exploración mejorada de Buenos Aires.

## Ejecutar

Se necesita Node >=24 y Python 3 (para validar los ZIP). No hay dependencias npm de terceros en runtime.

```sh
node portal/package-game.mjs
PORT=3000 PUBLIC_ORIGIN=http://127.0.0.1:3000 npm start
```

Abrir http://127.0.0.1:3000. La primera ejecución crea una clave fuerte de administración en `portal/data/admin-password.txt`, con permisos 0600. No subir ese archivo ni su contenido a Git. `/admin` permite ingresar con esa clave. `ADMIN_PASSWORD` solo se usa al inicializar un volumen nuevo; no reemplaza una clave ya persistida.

## Funciones

- Catálogo, búsqueda, categorías y favoritos locales.
- Ficha individual y reproductor con ampliación.
- Panel autenticado: crear/editar metadata, subir ZIP y portada, probar borradores, publicar/ocultar.
- ZIP hasta 40 MB; contenido descomprimido hasta 200 MB/3.000 archivos, con `index.html` en raíz o una sola carpeta. Valida rutas, duplicados, enlaces, extensiones y compresión; no ejecuta contenido en el servidor.
- Persistencia SQLite y archivos bajo `PORTAL_DATA_DIR` (por defecto `portal/data`; `/data` en Docker).
- Sesión HttpOnly/SameSite Strict; CSRF y verificación de origen; limitación de intentos de login.
- Cuentas de jugador con Google Identity Services (`GOOGLE_CLIENT_ID`), separadas del panel admin. Google valida el inicio; el portal guarda un identificador técnico de cuenta e iniciales, pero no el correo ni el nombre. Las tablas públicas muestran únicamente tres letras y puntajes.
- Ranking por juego con el mejor puntaje de cada cuenta. El ranking general otorga puntos por posición en cada juego (100 al primer lugar, 90 al segundo y hasta 10 puntos desde el décimo), para que los juegos con escalas distintas puedan convivir. Los puntajes se guardan en SQLite junto con el perfil.
- Cliente propio para comunicar puntajes desde un juego aislado: `window.PixelSurArcade.submitScore(puntos)`. El cliente muestra el diálogo arcade, solicita tres iniciales y envía la marca al portal. BA Invaders ya reporta progreso de sus desafíos. Cada juego HTML5 debe llamar al cliente al terminar una ronda para participar.
- Los juegos se ejecutan en un iframe con origen opaco, sin `allow-same-origin`. Un puente de localStorage preserva solo el espacio de guardado de ese juego; no concede acceso a cookies ni datos del portal. La política CSP del juego restringe scripts, estilos, recursos y conexiones al origen del portal (más `data:`/`blob:` donde hace falta para el juego); no se permiten conexiones externas. Los assets del juego permiten CORS sin credenciales. Los borradores usan URLs de preview firmadas y temporales.
- El bridge cubre la API localStorage habitual (`getItem/setItem/removeItem/clear/key/length`); juegos que dependan de IndexedDB, service workers, cookies o acceso directo al DOM del portal requieren adaptación. No ofrece subida pública ni cuentas de creadores en este MVP.

## Publicar un juego

1. Entrar a `/admin`.
2. Crear título, identificador, descripción, categorías y controles.
3. Subir ZIP y opcionalmente PNG/JPG/WebP de portada (máximo 3 MB).
4. Guardar borrador y abrir «Probar».
5. Publicar cuando el juego funcione. Una nueva subida deja esa ficha en borrador hasta republicarla.

Las subidas deben ser juegos propios o contar con las licencias correspondientes. No incluir credenciales, archivos de servidor, dependencias remotas ni servicios externos: el juego no puede conectarse a otros orígenes desde el sandbox.

## Coolify

El catálogo incluye **Lola y Pipo: Salto del Sur**, una aventura de plataformas 16-bit original, empaquetada desde `portal/games/salto-del-sur` durante la construcción de la imagen. Sus protagonistas, portada y escenarios son arte pixel propio; el juego conserva las vidas de mate y registra el puntaje final en el ranking cuando se gana.

- Cuenta: ThxuLab - Olabox; proyecto Growza; entorno dev.
- Servidor existente: manolo memory.
- Estrategia: Dockerfile, ubicación `/Dockerfile`, puerto interno 3000.
- Rama inicial del portal: `feat/pixel-sur-portal` del repositorio `mescu74/pixelart-games-web`.
- Dominio previsto: `https://games.soloescus.com`.
- Volumen persistente **obligatorio** en `/data`.
- `PUBLIC_ORIGIN=https://games.soloescus.com`, `PORTAL_DATA_DIR=/data`, `NODE_ENV=production`.
- `GOOGLE_CLIENT_ID` es el ID público del cliente OAuth Web `Pixel Sur Arcade - Google Login`, creado en el proyecto GCP `pixel-sur-arcade`. Su origen autorizado es `https://games.soloescus.com`; no se usa ni se guarda un client secret. El ID se configura como variable en Coolify, no en Git.
- Healthcheck: `/api/health`; el Dockerfile ya define el chequeo.
- No publicar el puerto de base de datos, el directorio de datos ni la clave de administración.

El HTTPS termina en el ALB existente; la aplicación se publica detrás del proxy de Coolify. DNS/certificado y regla de host se agregan únicamente para este subdominio. La aplicación es independiente de los otros recursos de Growza.

## Validación

```sh
npm test
npm run test:game
docker build -t pixel-sur-arcade:local .
```

Los tests del portal verifican autenticación, CSRF, validación de ZIP, subida, preview firmada, publicación/ocultado y persistencia tras reiniciar. También se verifica el sandbox y guardado en navegador con BA Invaders. Los tests no crean contenido en producción.

## Datos y backups

El volumen contiene SQLite (WAL), paquetes/versiones, portadas y secretos locales. Para un backup coherente usar el backup online de SQLite o detener este contenedor y copiar `/data`; no respaldar solo el archivo principal mientras hay escrituras. Ningún backup externo o restauración se considera configurado por este MVP. Conservar este volumen en despliegues y rollback; no borrarlo para actualizar código.

## Google Analytics 4

- Cuenta Thxuweb `406221052`; propiedad Pixel Sur Arcade `564443692`; flujo Web `16347253840`.
- ID público de medición: `G-R5P1YY93LP`, dominio games.soloescus.com. Propiedad separada de ThxuLab.
- Consentimiento básico: Google no carga hasta aceptar estadísticas; se puede rechazar o revocar en «Privacidad». Elección local por 180 días. Sin señales de Google ni personalización publicitaria.
- `page_view`: páginas públicas, sin query strings ni fragmentos; referente reducido al dominio. `game_open`: apertura válida del reproductor, con game_id y game_name. No afirma medir partidas empezadas ni completadas.
- Se excluyen /admin, previews y los iframes de los juegos; no se envían claves ni partidas guardadas.
- No agregar etiquetas a los ZIP de juegos: la medición vive en el portal. Medición mejorada de GA4 desactivada, para evitar recogida automática adicional.
- `npm test` cubre aceptación, rechazo, expiración, exclusión admin/iframe, revocación y no duplicar game_open.
- Informes: https://analytics.google.com/analytics/web/#/a406221052p564443692/reports/intelligenthome

## Cuentas y rankings

- El proyecto OAuth separado es `pixel-sur-arcade` y el cliente Web `Pixel Sur Arcade - Google Login` ya está creado. Configurar su Client ID público como `GOOGLE_CLIENT_ID` en Coolify antes de desplegar.
- La app OAuth está en estado `Testing`; sólo las cuentas añadidas como test users pueden iniciar sesión. Para permitir acceso público, publicar la app desde Google Auth Platform después de desplegar y comprobar las páginas `/privacidad` y `/terminos`. Google puede solicitar verificación de dominio y de la app según sus políticas vigentes.
- El callback de Google Identity Services envía un ID token al servidor; el servidor valida audiencia y expiración con el endpoint de Google y crea una sesión propia HttpOnly. No se guarda el ID token ni el correo/nombre, y no se piden permisos de Drive, Gmail u otros servicios.
- Juego anfitrión: use `window.PixelSurArcade.submitScore(12345)` al terminar partida. El sandbox devuelve el puntaje al portal; el portal pide login e iniciales antes de persistir la mejor marca del jugador para ese juego.
- Puntajes de cliente pueden modificarse desde las herramientas del navegador. El portal valida identidad, origen, formato, rango y frecuencia, pero no ofrece antitrampas del lado del servidor; evitar premios con valor monetario sin validar cada juego.
- Para quitar una cuenta o borrar puntajes, eliminar el jugador de `players` y su identidad asociada en SQLite; las claves foráneas borran sus sesiones y marcas.
