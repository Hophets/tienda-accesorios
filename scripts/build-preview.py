#!/usr/bin/env python3
"""Genera una copia de Modesta que se abre sin servidor ni archivos vecinos."""

import argparse
import base64
import mimetypes
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parent.parent


def data_uri(relative_path: str) -> str:
    file = (ROOT / relative_path).resolve()
    if not file.is_relative_to(ROOT):
        raise ValueError(f"Recurso fuera del proyecto: {relative_path}")
    media_type = mimetypes.guess_type(file.name)[0] or "application/octet-stream"
    encoded = base64.b64encode(file.read_bytes()).decode("ascii")
    return f"data:{media_type};base64,{encoded}"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path, help="Ruta del HTML autónomo de salida")
    output = parser.parse_args().output.resolve()
    if output in {ROOT / "index.source.html", ROOT / "styles.css", ROOT / "script.js"}:
        parser.error("Elige otro nombre para conservar los archivos fuente.")

    document = (ROOT / "index.source.html").read_text(encoding="utf-8")
    styles = (ROOT / "styles.css").read_text(encoding="utf-8")
    script = (ROOT / "script.js").read_text(encoding="utf-8")

    # El HTML autónomo lleva fuentes incrustadas; no necesita precargarlas aparte.
    document = re.sub(
        r'^[ \t]*<link\b(?=[^>]*\brel="preload")[^>]*>[ \t]*\n?',
        "",
        document,
        flags=re.I | re.M,
    )
    styles = re.sub(
        r'url\(\s*([\'"]?)(assets/[^)\'"\s]+)\1\s*\)',
        lambda match: f'url("{data_uri(match.group(2))}")',
        styles,
    )
    document = re.sub(
        r'<link\b[^>]*\brel="stylesheet"[^>]*>',
        lambda _: f"<style>\n{styles}\n</style>",
        document,
    )
    # En la copia se conserva el mismo código funcional del proyecto original.
    document = re.sub(
        r'<script\b[^>]*\bsrc="script\.js"[^>]*>\s*</script>',
        lambda _: "<script>\n" + script.replace("</script", r"<\/script") + "\n</script>",
        document,
    )
    document = re.sub(
        r'\b(src|href)="(assets/[^"<>]+)"',
        lambda match: f'{match.group(1)}="{data_uri(match.group(2))}"',
        document,
    )

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(document, encoding="utf-8")
    print(f"HTML autónomo creado: {output} ({output.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
