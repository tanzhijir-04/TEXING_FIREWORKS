import { Point } from '../types';

/**
 * Creates an offscreen canvas, draws the text, and samples non-transparent pixels
 * to create a target grid for particles.
 */
export const sampleTextCoordinates = (
  text: string,
  width: number,
  height: number,
  gap: number = 4
): Point[] => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return [];

  // Center logic
  const fontSize = Math.min(width / 5, 150); // Responsive font size
  ctx.font = `900 ${fontSize}px "Arial Black", "Impact", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF';

  ctx.fillText(text, width / 2, height / 3); // Draw in upper middle

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const points: Point[] = [];

  // Randomize start index to avoid "scanning" look when particles arrive
  for (let y = 0; y < height; y += gap) {
    for (let x = 0; x < width; x += gap) {
      // Check alpha channel (4th byte)
      const alphaIndex = (y * width + x) * 4 + 3;
      if (data[alphaIndex] > 128) {
        points.push({ x, y });
      }
    }
  }

  // Shuffle points to make the formation look organic
  for (let i = points.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [points[i], points[j]] = [points[j], points[i]];
  }

  // Cap points to prevent performance death if text is too huge
  return points.slice(0, 3500); 
};