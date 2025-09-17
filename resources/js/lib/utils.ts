import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Resize an SVG string by updating <svg> width and height
 * @param svgString - The raw SVG string
 * @param width - New width
 * @param height - New height
 * @returns Updated SVG string
 */
export function resizeSvg(svgString: string, width: number, height: number): string {
  // Use regex to replace or insert width/height
  let updated = svgString
    .replace(/width="[^"]*"/, `width="${width}"`)
    .replace(/height="[^"]*"/, `height="${height}"`);

  // If width/height are missing, inject them into the <svg ...> tag
  if (!/width="/.test(updated)) {
    updated = updated.replace(/<svg/, `<svg width="${width}"`);
  }
  if (!/height="/.test(updated)) {
    updated = updated.replace(/<svg/, `<svg height="${height}"`);
  }

  return updated;
}
