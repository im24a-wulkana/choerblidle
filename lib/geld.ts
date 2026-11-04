const MAX_BETRAG = 999.99;

/** Akzeptiert Komma und Punkt, optional Schweizer Tausendertrennzeichen. */
export function parseChf(roh: string): number | null {
  const text = roh.trim().replace(/\s/g, "").replace(/'/g, "").replace(/’/g, "");
  if (!/^\d+([.,]\d{1,2})?$/.test(text)) return null;
  const betrag = Number(text.replace(",", "."));
  if (!Number.isFinite(betrag) || betrag <= 0 || betrag > MAX_BETRAG) return null;
  return Math.round(betrag * 100) / 100;
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
