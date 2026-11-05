const MAX_BETRAG = 999.99;

/**
 * Akzeptiert Komma und Punkt, optional Schweizer Tausendertrennzeichen.
 * Mehr als zwei Nachkommastellen werden kaufmännisch auf Rappen gerundet.
 */
export function parseChf(roh: string): number | null {
  const text = roh.trim().replace(/\s/g, "").replace(/'/g, "").replace(/’/g, "").replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(text)) return null;
  const [ganzText, frac = ""] = text.split(".");
  const ganz = Number(ganzText);
  if (!Number.isSafeInteger(ganz)) return null;
  const ziffern = (frac + "000").slice(0, 3);
  let rappen = ganz * 100 + Number(ziffern.slice(0, 2));
  if (ziffern[2] >= "5") rappen += 1;
  if (rappen <= 0 || rappen > Math.round(MAX_BETRAG * 100)) return null;
  return rappen / 100;
}

export function formatChf(betrag: number): string {
  return `CHF ${betrag.toFixed(2)}`;
}

export function inRappen(betrag: number): number {
  return Math.round(betrag * 100);
}

const prozentFormat = new Intl.NumberFormat("de-CH", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatProzent(wert: number): string {
  return `${prozentFormat.format(wert)} %`;
}
