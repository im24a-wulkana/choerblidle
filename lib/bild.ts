/** Bildfläche ist höchstens etwa 460×256 CSS-Pixel. 480×320 deckt das auf normalen und Retina-Screens. */
const MIGROS_VARIANTE = "/d/mo-boxed/v-w-480-h-320/o-af-1/";
const MIGROS_ORIGINAL = "/d/mo-boxed/o-af-1-t.clr-fff/";

/** Kleinere AVIF/WebP-Variante vom Migros-CDN. Andere URLs bleiben unverändert. */
export function migrosBild(url: string): string {
  if (!url.includes(MIGROS_ORIGINAL)) return url;
  return url.replace(MIGROS_ORIGINAL, MIGROS_VARIANTE);
}
