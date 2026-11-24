"""Genera los íconos del sitio con el símbolo oficial (casco solo).

Manual §03: el casco solo se usa para favicon e ícono de app. Va en blanco sobre
Black #050507 (fondo negro), centrado y escalado en proporción, sin efectos.

Uso:
    python scripts/make_favicons.py src/assets/brand/casco-blanco.png public
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

BLACK = (5, 5, 7, 255)
SIZES = {"favicon-32.png": 32, "favicon-192.png": 192, "apple-touch-icon.png": 180, "icon-512.png": 512}
PADDING = 0.16  # margen libre alrededor del casco


def main() -> int:
    if len(sys.argv) != 3:
        print(__doc__)
        return 1
    src, out = Path(sys.argv[1]), Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    helmet = Image.open(src).convert("RGBA")

    for name, size in SIZES.items():
        canvas = Image.new("RGBA", (size, size), BLACK)
        inner = round(size * (1 - 2 * PADDING))
        mark = helmet.copy()
        mark.thumbnail((inner, inner), Image.Resampling.LANCZOS)
        canvas.alpha_composite(mark, ((size - mark.width) // 2, (size - mark.height) // 2))
        canvas.convert("RGB").save(out / name, optimize=True)
        print(f"{name:<22} {size}×{size}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
