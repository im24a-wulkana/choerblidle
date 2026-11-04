import { inRappen } from "@/lib/geld";
import type { Richtung, WertungsFarbe } from "@/lib/typen";

/** |Tipp − Preis| / Preis, in Rappen gerechnet. */
export function abweichung(tipp: number, preis: number): number {
  const basis = inRappen(preis);
  if (basis <= 0) return Number.POSITIVE_INFINITY;
  return Math.abs(inRappen(tipp) - basis) / basis;
}

export function abweichungProzent(tipp: number, preis: number): number {
  return abweichung(tipp, preis) * 100;
}

/**
 * Bis 2 % grün, bis 10 % gelb, sonst weiss.
 * Grenzen sind inklusive und in ganzen Rappen entschieden.
 */
export function wertung(tipp: number, preis: number): WertungsFarbe {
  const diff = Math.abs(inRappen(tipp) - inRappen(preis));
  const basis = inRappen(preis);
  if (diff * 100 <= basis * 2) return "gruen";
  if (diff * 100 <= basis * 10) return "gelb";
  return "weiss";
}

export function istTreffer(tipp: number, preis: number): boolean {
  return wertung(tipp, preis) === "gruen";
}

/** ⬆️ heisst: der echte Preis liegt höher als der Tipp. */
export function richtung(tipp: number, preis: number): Richtung {
  if (istTreffer(tipp, preis)) return "treffer";
  return inRappen(tipp) < inRappen(preis) ? "hoeher" : "tiefer";
}

export function wertungsEmoji(farbe: WertungsFarbe): "🟩" | "🟨" | "⬜" {
  if (farbe === "gruen") return "🟩";
  if (farbe === "gelb") return "🟨";
  return "⬜";
}
