import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export type Comparison = {
  /** Size both images were compared at: the larger of the two in each dimension. */
  width: number;
  height: number;
  diffPixels: number;
  /** `diffPixels` as a share of `width × height` (0 to 1). */
  diffRatio: number;
  /** The screenshots had different sizes; the area only one of them covers counts as different. */
  sizeMismatch: boolean;
  /** PNG with the differing pixels highlighted. */
  diff: Buffer;
};

/** pixelmatch's per-pixel color threshold (0 to 1): ignores sub-perceptual rendering noise. */
const PIXEL_THRESHOLD = 0.1;

/** Copy an image onto a larger canvas filled with a color neither app paints (opaque magenta). */
function padTo(image: PNG, width: number, height: number): PNG {
  if (image.width === width && image.height === height) return image;
  const padded = new PNG({ width, height });
  for (let offset = 0; offset < padded.data.length; offset += 4) {
    padded.data[offset] = 255;
    padded.data[offset + 1] = 0;
    padded.data[offset + 2] = 255;
    padded.data[offset + 3] = 255;
  }
  PNG.bitblt(image, padded, 0, 0, image.width, image.height, 0, 0);
  return padded;
}

/** Compare two PNG screenshots pixel by pixel. */
export function compareScreenshots(a: Buffer, b: Buffer): Comparison {
  const imageA = PNG.sync.read(a);
  const imageB = PNG.sync.read(b);
  const width = Math.max(imageA.width, imageB.width);
  const height = Math.max(imageA.height, imageB.height);
  const diff = new PNG({ width, height });
  const diffPixels = pixelmatch(
    padTo(imageA, width, height).data,
    padTo(imageB, width, height).data,
    diff.data,
    width,
    height,
    { threshold: PIXEL_THRESHOLD, diffColorAlt: [0, 128, 255] },
  );
  return {
    width,
    height,
    diffPixels,
    diffRatio: diffPixels / (width * height),
    sizeMismatch: imageA.width !== imageB.width || imageA.height !== imageB.height,
    diff: PNG.sync.write(diff),
  };
}
