# Gorilas en la Rosada

Plataformas arcade original y sátira política argentina. Una caricatura de Perón con traje y escudo sube una Casa Rosada reinterpretada mientras un gorila con corbata arroja urnas, expedientes y boletas. Los rótulos de obstáculos son chistes y ficción, no una cronología ni afirmaciones históricas.

## Jugar

Servir esta carpeta por HTTP y abrir `index.html`. Sin dependencias, CDN, permisos ni conexiones externas. Canvas de 960 × 720 con sprites y fachada dibujados en código; render responsive con escalado pixelado. `cover.html` genera la portada original de 1200 × 750 con el mismo arte.

- Flechas / WASD: caminar; arriba / abajo: trepar cerca de la escalera iluminada.
- Espacio: saltar. X: saludo que despeja obstáculos a 155 px, cuando la barra está llena. Recargar recogiendo escudos y saltando objetos.
- P / Esc: pausa. Botones táctiles con pointer capture; se liberan al cancelar el gesto. Pausa automática al ocultar la pestaña o perder foco.
- Sonido sintetizado opcional; apagado inicialmente. Respeta movimiento reducido para partículas y sacudidas.

Tres ascensos: La Plaza, Los Balcones y La Azotea. Cambian cielo, rutas y velocidad/frecuencia de obstáculos. Tres mates; un impacto cuesta uno y reinicia desde el último punto de control (balcones 2 y 4), con tres segundos de protección y obstáculos despejados. Ganar un ascenso repone un mate, máximo tres. No hay termo ni yerba. La bandera central es la meta; el gorila no debe tocarse para ganar.

Puntos por balcones, escudos, saltos encadenados y tiempo al llegar. Récord local bajo `gorilas-rosada:best:v1`, compatible con el puente de guardado del portal. No guarda campaña entre visitas. No recopila datos: las estadísticas pertenecen al portal y a su consentimiento.

## Verificar y empaquetar

```sh
node --test games/gorilas-en-la-rosada/core.test.cjs
node --check games/gorilas-en-la-rosada/art.js
node --check games/gorilas-en-la-rosada/game.js
node games/gorilas-en-la-rosada/package.mjs
```

ZIP en `portal/bundled/gorilas-en-la-rosada.zip` (ignorado por Git). Subir con portada `cover.png` desde `/admin`, probar el borrador y publicar. El servidor y los otros juegos no requieren despliegue ni cambios de configuración.

Las pruebas de lógica verifican las tres rutas hasta la victoria sin obstáculos para aislar conectividad; aparte verifican saltos, impactos, invulnerabilidad, derrota, checkpoint, recarga, saludo y caída de los tres tipos de objetos. No equivalen a completar una campaña humana ni certifican la dificultad.
