#!/usr/bin/env python3
"""Generate dependency-free PNG PWA icons for AppTray Labs (mala ring mark)."""
import math
import os
import struct
import zlib

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "icons")
BG = (79, 70, 229)
WHITE = (255, 255, 255)


def chunk(kind: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)


def make_icon(size: int, path: str, maskable: bool) -> None:
    rows = bytearray()
    beads = []
    for i in range(8):
        angle = 2 * math.pi * i / 8 - math.pi / 2
        beads.append((0.5 + 0.33 * math.cos(angle), 0.5 + 0.33 * math.sin(angle)))
    for y in range(size):
        rows.append(0)
        ny = (y + 0.5) / size
        for x in range(size):
            nx = (x + 0.5) / size
            pixel = BG + (255,)
            # Rounded corners for regular icons; full bleed for maskable icons.
            if not maskable:
                dx = max(0.0, 0.10 - nx) + max(0.0, nx - 0.90)
                dy = max(0.0, 0.10 - ny) + max(0.0, ny - 0.90)
                if math.hypot(dx, dy) > 0.10:
                    pixel = BG + (0,)
            radius = math.hypot(nx - 0.5, ny - 0.5)
            if abs(radius - 0.33) < 0.008:
                pixel = WHITE + (255,)
            if any(math.hypot(nx - bx, ny - by) < 0.035 for bx, by in beads):
                pixel = WHITE + (255,)
            if math.hypot(nx - 0.5, ny - 0.5) < 0.13:
                pixel = WHITE + (255,)
            if math.hypot(nx - 0.5, ny - 0.49) < 0.085:
                pixel = BG + (255,)
            rows.extend(pixel)
    header = struct.pack(">2I5B", size, size, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", header) + chunk(b"IDAT", zlib.compress(bytes(rows), 9)) + chunk(b"IEND", b"")
    with open(path, "wb") as handle:
        handle.write(png)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    make_icon(192, os.path.join(OUT, "icon-192.png"), False)
    make_icon(512, os.path.join(OUT, "icon-512.png"), False)
    make_icon(192, os.path.join(OUT, "icon-maskable-192.png"), True)
    make_icon(512, os.path.join(OUT, "icon-maskable-512.png"), True)
    print("generated 4 PNG icons in", OUT)
