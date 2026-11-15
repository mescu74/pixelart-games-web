# Sur Arcade — original pixel assets

24 sprites/sheets, 47 animation frames, one single-frame HUD mate icon and a bespoke 5×7 bitmap font. Drawn in native pixel coordinates by `scripts/generate-assets.py`; no stock image content, Adobe assets, tracing or third-party fonts are included in these files.

Palette: deep blue outlines, bone-white highlights, Argentine sky blue, amber, teal, violet and yerba green. Standard actors use 32×32 cells; city monuments use separate larger images. Animation is frame-based, with nearest-neighbour rendering.

`contact-sheet.png` shows the original designs. `manifest.json` records native dimensions and frame counts. PNGs are checked in: playing the game does not require Python or Pillow. To regenerate them, install Pillow and run `python3 scripts/generate-assets.py` from the repository root.

The bitmap font is used for arcade headings, scoring and counters. World actors retain the same collision and mission rules as the previous MVP. No modifications to the source street dataset or its ODbL attribution are included in this art update.
