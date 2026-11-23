# Puños del Sur

Juego de combate arcade original inspirado en los clásicos 2D. Cuatro peleadores de distintos mundos argentinos compiten en un torneo amistoso en el Barrio Mugica. El barrio aparece como una comunidad viva, con su plaza, murales, cancha y horizonte porteño.

## Jugar

Abrir `index.html` por HTTP o probar el paquete como borrador en Pixel Sur Arcade. No usa servicios externos.

- **A / D** o **← / →**: moverse.
- **W** o **↑**: saltar.
- **S** o **↓**: cubrirse.
- **J**: puño rápido.
- **K**: patada fuerte.
- **L**: especial cuando el medidor de ritmo está lleno.
- **P / Esc**: pausa.
- **M**: silenciar o activar el sonido.

En móvil aparecen controles táctiles. El torneo tiene tres combates; los mates son las vidas. La barra de ritmo se llena al conectar golpes y habilita un especial distinto según el personaje. El récord se guarda localmente.

## Personajes

- **Mora “Redoblante” Ferreyra**, murguera rápida: Redoblante relámpago.
- **Tano “El Muelle” Ríos**, boxeador potente: Tres golpes del Dock.
- **Luz “Rayo” Quiroga**, gaucha versátil: Zapateo sísmico.
- **Rolo “Carrito” Medina**, inventor técnico: Carrito turbo.

La portada, el escenario y los retratos/poses de combate son arte original creado para este juego. No incluye personajes, nombres, escenarios ni recursos de Street Fighter.

## Empaquetar

```sh
node games/punos-del-sur/package.mjs
```

Genera `portal/bundled/punos-del-sur.zip` para subirlo desde `/admin`, junto con `assets/cover.jpg` como portada.
