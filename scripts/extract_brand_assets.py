"""Extrae las imágenes originales incrustadas en el manual de marca.

No redibuja ni modifica nada: guarda cada imagen tal como viene en el PDF,
recombinando su máscara de transparencia (SMask) cuando existe.

Uso:
    python scripts/extract_brand_assets.py <manual.pdf> <carpeta_salida> [--pages 5-7,14]

Genera además un `inventory.json` con página, tamaño y transparencia de cada imagen.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import pymupdf


def parse_pages(spec: str | None, total: int) -> list[int]:
    if not spec:
        return list(range(total))
    pages: set[int] = set()
    for part in spec.split(","):
        if "-" in part:
            start, end = part.split("-")
            pages.update(range(int(start) - 1, int(end)))
        else:
            pages.add(int(part) - 1)
    return sorted(p for p in pages if 0 <= p < total)


def extract(pdf_path: Path, out_dir: Path, page_spec: str | None) -> list[dict]:
    out_dir.mkdir(parents=True, exist_ok=True)
    doc = pymupdf.open(pdf_path)
    inventory: list[dict] = []
    seen: set[int] = set()

    for page_index in parse_pages(page_spec, doc.page_count):
        page = doc[page_index]
        for img in page.get_images(full=True):
            xref, smask = img[0], img[1]
            if xref in seen:
                continue
            seen.add(xref)

            pix = pymupdf.Pixmap(doc, xref)
            if smask:
                # Recompone el canal alfa original del PDF.
                mask = pymupdf.Pixmap(doc, smask)
                if pix.alpha:
                    pix = pymupdf.Pixmap(pix, 0)
                pix = pymupdf.Pixmap(pix, mask)
            if pix.colorspace and pix.colorspace.n > 3:
                pix = pymupdf.Pixmap(pymupdf.csRGB, pix)

            name = f"p{page_index + 1:02d}_x{xref}.png"
            pix.save(out_dir / name)
            rects = [list(map(round, r)) for r in page.get_image_rects(xref)]
            inventory.append(
                {
                    "file": name,
                    "page": page_index + 1,
                    "xref": xref,
                    "width": pix.width,
                    "height": pix.height,
                    "alpha": bool(pix.alpha),
                    "placed_at": rects,
                }
            )

    (out_dir / "inventory.json").write_text(json.dumps(inventory, indent=2), encoding="utf-8")
    return inventory


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("pdf", type=Path)
    parser.add_argument("out", type=Path)
    parser.add_argument("--pages", help="Páginas a procesar, p. ej. 5-7,14 (1-indexado)")
    args = parser.parse_args()

    if not args.pdf.is_file():
        print(f"No existe el archivo: {args.pdf}", file=sys.stderr)
        return 1

    inventory = extract(args.pdf, args.out, args.pages)
    for item in inventory:
        print(f"p{item['page']:>2}  {item['width']:>5}×{item['height']:<5} alpha={item['alpha']!s:<5} {item['file']}")
    print(f"{len(inventory)} imágenes extraídas en {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
