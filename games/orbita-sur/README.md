# Órbita Sur

Segundo juego de Pixel Sur Arcade. Shooter vertical original desarrollado con Phaser 3; homenaje a la era de los shooters de formación, sin personajes, sprites, música ni niveles de juegos comerciales.

## Contenido

- Austral-01, tres familias de enemigos y tres jefes de reactor propios.
- Tres sectores: Costa orbital, Cinturón violeta y El faro austral.
- Cinco mates de vida, invulnerabilidad temporal tras daño, mates recuperables y bonificación de un mate al liberar un sector. Sin termos ni yerba.
- Disparo automático; mejoras de doble disparo y alas laterales.
- Pulso defensivo con ocho segundos de recarga: despeja proyectiles y daña enemigos.
- Animación de propulsores, inclinación de naves, movimiento de formaciones, reactores, partículas, explosiones, ondas, estrellas por capas y fondos originales.
- Récord y preferencia de sonido en localStorage (namespace `orbita-sur-v1`); dentro del portal usa el bridge aislado. La campaña empieza de cero en cada partida.
- Efectos de sonido sintetizados propios, activables por el usuario. Sin autoplay.
- Pausa manual y automática al perder foco. Teclado WASD/flechas, espacio para pulso, P para pausa. Mouse/táctil: mantener y arrastrar; botón PULSO en dispositivo táctil.

## Ejecutar y empaquetar

Desde la raíz del repositorio: `python3 -m http.server 3045` y abrir `/games/orbita-sur/`.

`python3 games/orbita-sur/create-art.py` regenera sprites y portada con Pillow. Todos los PNG de juego están dibujados a resolución baja, escalados sin interpolación. El fondo y los efectos se dibujan en Phaser.

`python3 scripts/package-orbita.py` crea `portal/test-output/orbita-sur.zip`. Incluye únicamente HTML/CSS/JS, sprites y licencia Phaser; no incluye herramientas, tests ni datos del portal.

La tipografía es Barlow Condensed / Space Mono de Google Fonts, con fallback local. No se necesita red para Phaser o los sprites.

## Validación del MVP

- Sintaxis JS y extracción del ZIP con el mismo validador del portal.
- En navegador: despegue, movimiento real con flechas, pulso, pausa, controles táctiles y ancho móvil 390 px sin overflow.
- Diagnóstico acelerado en la instancia local del motor: daño/invulnerabilidad, mate recuperable, cooldown, oleadas hasta jefe, tres jefes/transiciones, victoria, récord, derrota y reintento. No equivale a completar manualmente una campaña; el balance queda abierto a pruebas del usuario.
- Probar además el paquete real en `/admin/probar/orbita-sur`, publicar y abrir desde el catálogo.

Phaser se distribuye con su licencia MIT en PHASER-LICENSE.txt. Arte, encuentros y efectos de sonido son propios de este proyecto.

## Edición 02: reactores activos

Sprites de 48 px para naves y 96 px para jefes, con seis frames por modelo (42 frames originales). Nuevas siluetas de portanaves, Tejedora de seis brazos y fortaleza radial; paneles, rejillas, cabina y conductos. Reactores giratorios, motores, destellos de boca, impactos, fragmentos y explosiones encadenadas al destruir jefes. El cinturón incluye asteroides por parallax.

Los jefes cargan un rayo durante 1,15 segundos sobre una columna marcada antes de disparar; el pulso cancela tanto el rayo como los proyectiles. La fase crítica avisa al caer por debajo del 45 % de salud. El estado visual se congela durante la pausa. Se conservan las cinco vidas de mate y el namespace del récord existente.

Validación: siete sheets de seis cuadros; rayo anunciado sin daño, rayo activo con daño, cancelación por pulso, congelación al pausar, tres destrucciones encadenadas, victoria, derrota, reinicio limpio y viewport táctil de 390 px sin overflow.
