# Fuga Porteña

Juego de persecución arcade con moto, botín y patrulleros propios. Homenaje al género de laberintos; sin personajes, sonidos, sprites ni niveles copiados de juegos comerciales.

## MVP

- Mapa recortado del mismo callejero de BA Invaders. 501 nodos conectados y 532 aristas, alrededor del Obelisco; incluye Corrientes, Cerrito, Carlos Pellegrini, Suipacha, Esmeralda, Libertad, Lavalle, Tucumán, Sarmiento y Diagonal Norte.
- Se conservan las coordenadas del snapshot OSM de 2018. Se permite doble sentido arcade. Edificios y detalles ilustrados, sin pretender reproducir sus huellas o fachadas reales. No refleja tráfico ni sentidos actuales.
- 95 botines por ronda, cuatro bolsas de dinero y un mate recuperable. Las bolsas dan 9 segundos de ventaja y permiten sacar patrulleros temporalmente con trompos, aumentando el combo.
- Tres vidas de mate; sin termos ni yerba. Tras captura hay protección temporal y los botines recogidos permanecen recogidos.
- Tres rondas sobre el mismo barrio: aumentan velocidad y número de patrulleros, no se presentan como barrios diferentes. AI de persecución, anticipación y cierre lateral.
- Flechas/WASD, giro anticipado, reversa, espacio para frenar, P para pausa. En táctil: deslizar o botones visibles. Vista general con VER TODO, cámara de seguimiento al volver.
- Récord y sonido en `fuga-portena-v1`, compatible con el puente de localStorage del sandbox. La campaña no se guarda a mitad de una ronda; recargar inicia una partida nueva, conserva récord/preferencia.
- Arte pixel propio: moto, patrullero animado, bolsas, botines, mate, Obelisco, ciudad y portada. Audio sintetizado opt-in. Pausa automática al perder foco.

## Desarrollo

Desde la raíz: `python3 -m http.server 3046`, abrir `/games/fuga-portena/`.

- `python3 games/fuga-portena/build-map.py`: recorta el mapa, conserva el componente conectado y dibuja ciudad con Pillow. Fuente completa: map-data.json en raíz.
- `python3 games/fuga-portena/create-art.py`: sprites y portada reproducibles.
- `node scripts/check-fuga.cjs`: conectividad, aristas, dirección, giro anticipado, límites y reversa.
- `python3 scripts/package-fuga.py`: ZIP estático en portal/test-output (ignorado en Git).

Validación del MVP: navegador con teclado, recolección, botones táctiles, cámara/vista general y 390×844 sin desbordamiento; diagnóstico local acelerado de botín único, captura/invulnerabilidad, mate, bolsa, trompo, pausa, expiración, tres rondas, victoria/derrota y reinicio. No equivale a completar manualmente las tres rondas. Publicación mediante panel/API autenticada; probar el paquete en el sandbox antes de publicarlo.

Ver PHASER-LICENSE.txt y MAP-LICENSE.txt. La base derivada está incluida en map.json bajo ODbL; arte original del proyecto Pixel Sur Arcade.

## Edición 02 — Persecuciones

Moto y patrullero originales de 48×64 px, con ocho cuadros cada uno: ruedas/suspensión, casco y reflejos, carrocería, cristales, espejos y balizas. Giros visuales suavizados sin salir de la geometría del grafo, sombras, humo, marcas de frenada, estela de nitro y luces de patrullero.

- Nitro: N / Shift o botón visible. Dura 1,15 s, velocidad 190 frente a 132 normal, recarga 6 s. No da invulnerabilidad y se cancela al reaparecer.
- Racha: cinco botines consecutivos, con menos de 2,1 s entre recogidas, dan +25. Se repite cada cinco.
- Escape cercano: entrar en el radio de proximidad de un patrullero sin poder ni invulnerabilidad, luego salir a más de 80 px, da +30 y reduce 1,5 s de recarga. Se reinicia por patrullero; captura y bolsas cancelan la proximidad.
- Si bolsa y patrullero coinciden en un tick, se recoge primero la bolsa.
- Se conservan map.json byte a byte, los 501 nodos/532 aristas reales, tres mates, tres rondas y namespace de récord.

Pruebas: animaciones de ocho frames, nitro/repetición/recarga/pausa, rachas, escape, colisión simultánea con bolsa, victoria, derrota y reinicio. Móvil 390×844: HUD y botón nitro visibles, sin overflow. Diagnósticos acelerados solo en la instancia local, sin alterar récords públicos.
