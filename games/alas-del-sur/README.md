# Alas del Sur · Atlántico 82

Homenaje de combate aéreo vertical, con código, sprites y animaciones originales. Campaña arcade ficticia ambientada sobre las Islas Malvinas: no reproduce misiones, capacidades de armas, bajas ni resultados históricos. Pucará y Mirage III elegibles, lanchas de desembarco británicas, escoltas y tres buques finales con siluetas y patrones distintos. Logo con las islas pintadas como la bandera argentina, aprobado por el usuario.

## Jugar

Servir la carpeta por HTTP y abrir `index.html`. Sin CDN ni peticiones externas. Canvas 576 × 768, sprites pintados en resolución nativa y ampliados sin suavizado. Portada reproducible de 1200 × 750 en `cover.html`.

- Flechas / WASD: mover. Disparo automático.
- Espacio / botón BOMBA: despejar proyectiles y dañar objetivos. Tres bombas al despegar, máximo cuatro con suministros.
- Shift / X / botón EVASIÓN: maniobra protegida de 1,15 s, recarga de 7 s.
- Mouse o táctil: mantener y arrastrar sobre la zona de vuelo; desplazamiento relativo, sin teletransporte al tocar.
- P / Esc: pausa. Pausa automática al ocultar la página o perder foco. Sonido sintetizado opcional y desactivado inicialmente.

Cinco mates, tres misiones. Cada oleada dura 42 s antes del enfrentamiento con el buque final. Las lanchas que cruzan la línea inferior de costa cuentan como desembarco: cinco en una misma misión terminan el vuelo. Un impacto consume un mate y concede tres segundos de protección. La evasión también protege; las bombas despejan los proyectiles y las advertencias. Superar una misión devuelve un mate (máximo cinco) y permite iniciar la siguiente con al menos tres bombas.

Suministros alternados cada ocho objetivos derribados: bombas y mates. Récord local `alas-sur:best:v1`, elección de avión `alas-sur:plane:v1`; compatible con el puente del portal. No guarda una campaña en curso entre visitas. No incluye analítica propia; la medición pertenece al portal y a su consentimiento.

## Fuentes de referencia

- Contornos: Natural Earth, `ne_50m_admin_0_countries`, dominio público. Se conservan seis anillos insulares y 149 puntos normalizados en `map-data.js`. El paisaje de vuelo amplía y desplaza esa geometría para el arcade; no es navegación geográfica ni una reconstrucción de operaciones.
- Datos: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson
- Licencia: https://www.naturalearthdata.com/about/terms-of-use/
- Referencias visuales de aeronaves: https://www.argentina.gob.ar/fuerzaaerea/gesta-de-malvinas/espacio-8-caza-y-caza-bombarderos y https://www.argentina.gob.ar/noticias/mirage-breve-resena-historica-del-gran-delta-argentino
- El emblema original generado con imagegen conserva su prompt en `assets/LOGO.md`. Los aviones, buques, mates, efectos y paisajes se dibujan en `art.js` y `game.js`; no se extraen sprites ni sonidos de 1943.

## Verificar y empaquetar

```sh
node --test games/alas-del-sur/test/core.test.cjs
node --check games/alas-del-sur/game.js
node --check games/alas-del-sur/art.js
node games/alas-del-sur/package.mjs
```

ZIP en `portal/bundled/alas-del-sur.zip` (ignorado por Git). Subir con portada `cover.png` desde `/admin`, probar el borrador y publicar. No requiere despliegue del servidor ni cambios en otros juegos.

Las pruebas ejecutan ambas aeronaves a través de las tres misiones con movimientos, bomba y evasión ordinarios, sin modificar vidas ni estado de combate. También verifican daño, recursos, enfriamiento, invulnerabilidad, derrota por mates o desembarcos, suministros y límites de movimiento. El piloto de pruebas es un simulador y no certifica la dificultad para una primera partida humana.
