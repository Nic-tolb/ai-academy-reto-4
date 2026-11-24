"""Prepara los recursos de marca para la web a partir de las imágenes extraídas.

Paso previo:
    python scripts/extract_brand_assets.py <manual.pdf> .cache/brand-raw

Uso:
    python scripts/prepare_brand_assets.py .cache/brand-raw src/assets/brand

Reglas (manual de marca v1.0):
- Solo se recortan márgenes transparentes o se separan figuras de una lámina.
  Nunca se escala de forma desproporcionada, se recolorea ni se añaden efectos.
- Las imágenes de la página 7 son ejemplos de USOS INCORRECTOS: se excluyen.
- Astro genera después los formatos AVIF/WebP y los tamaños responsivos.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image

ALPHA_THRESHOLD = 8  # píxeles casi transparentes que no forman parte del dibujo

# salida -> (archivo extraído, caja de recorte opcional en px [x0, y0, x1, y1])
MANIFEST: dict[str, tuple[str, tuple[int, int, int, int] | None]] = {
    # Logos (página 1: versión principal; página 6: complementarias)
    "logo-principal-vertical.png": ("p01_x16.png", None),
    "logo-horizontal-blanca.png": ("p06_x60.png", None),
    "casco-blanco.png": ("p06_x65.png", None),
    # Max · expresiones del visor (página 16)
    "max-expresion-cansado.png": ("p16_x151.png", (24, 100, 408, 442)),
    "max-expresion-motivado.png": ("p16_x151.png", (416, 100, 789, 442)),
    "max-expresion-analitico.png": ("p16_x151.png", (806, 100, 1181, 442)),
    "max-expresion-idea.png": ("p16_x151.png", (1199, 100, 1578, 442)),
    # Max · poses (página 17)
    "max-pose-presentando.png": ("p17_x155.png", (38, 150, 560, 922)),
    "max-pose-aprobando.png": ("p17_x155.png", (572, 150, 979, 922)),
    "max-pose-explicando.png": ("p17_x155.png", (1054, 150, 1490, 922)),
    "max-pose-trabajando.png": ("p17_x157.png", (34, 180, 517, 900)),
    "max-pose-cafe.png": ("p17_x157.png", (536, 118, 971, 918)),
    "max-pose-descansando.png": ("p17_x157.png", (1015, 200, 1528, 890)),
}


def trim_transparent(img: Image.Image) -> Image.Image:
    alpha = img.getchannel("A").point(lambda v: 255 if v > ALPHA_THRESHOLD else 0)
    bbox = alpha.getbbox()
    return img.crop(bbox) if bbox else img


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("raw", type=Path, help="Carpeta con las imágenes extraídas")
    parser.add_argument("out", type=Path, help="Carpeta de destino (src/assets/brand)")
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)

    missing = [src for src, _ in MANIFEST.values() if not (args.raw / src).is_file()]
    if missing:
        print("Faltan imágenes extraídas: " + ", ".join(sorted(set(missing))), file=sys.stderr)
        return 1

    for name, (src, box) in MANIFEST.items():
        img = Image.open(args.raw / src).convert("RGBA")
        if box:
            img = img.crop(box)
        img = trim_transparent(img)
        img.save(args.out / name, optimize=True)
        print(f"{name:<34} {img.width:>5}×{img.height:<5} ← {src}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
