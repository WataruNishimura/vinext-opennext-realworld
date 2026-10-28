import { PNG } from 'pngjs';

/** A solid PNG, optionally with one rectangle painted in another color. */
export function solidPng(
  width: number,
  height: number,
  color: readonly [number, number, number],
  patch?: {
    x: number;
    y: number;
    width: number;
    height: number;
    color: readonly [number, number, number];
  },
): Buffer {
  const png = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const inPatch =
        patch !== undefined &&
        x >= patch.x &&
        x < patch.x + patch.width &&
        y >= patch.y &&
        y < patch.y + patch.height;
      const [r, g, b] = inPatch ? patch.color : color;
      const offset = (y * width + x) * 4;
      png.data[offset] = r;
      png.data[offset + 1] = g;
      png.data[offset + 2] = b;
      png.data[offset + 3] = 255;
    }
  }
  return PNG.sync.write(png);
}
