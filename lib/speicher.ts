import { STORAGE_KEY } from "@/lib/config";
import { leereStatistik, statistikAktualisieren } from "@/lib/raetsel";
import type { Statistik, TagStand } from "@/lib/typen";

export type Speicher = {
  tage: Record<string, TagStand>;
  statistik: Statistik;
};

function leererSpeicher(): Speicher {
  return { tage: {}, statistik: leereStatistik() };
}

function istWahl(wert: unknown): wert is TagStand["bonus"] {
  return wert === null || wert === "migros" || wert === "coop";
}

function istTagStand(wert: unknown): wert is TagStand {
  if (!wert || typeof wert !== "object") return false;
  const stand = wert as TagStand;
  return (
    typeof stand.datum === "string" &&
    Array.isArray(stand.tipps) &&
    stand.tipps.every((tipp) => typeof tipp === "number" && Number.isFinite(tipp)) &&
    typeof stand.fertig === "boolean" &&
    istWahl(stand.bonus)
  );
}

function istStatistik(wert: unknown): wert is Statistik {
  if (!wert || typeof wert !== "object") return false;
  const statistik = wert as Statistik;
  return (
    typeof statistik.gespielt === "number" &&
    typeof statistik.siege === "number" &&
    Array.isArray(statistik.verteilung) &&
    statistik.verteilung.length === 4 &&
    statistik.verteilung.every((eintrag) => typeof eintrag === "number") &&
    typeof statistik.streak === "number" &&
    typeof statistik.besteSerie === "number" &&
    (statistik.letzterSieg === null || typeof statistik.letzterSieg === "string") &&
    Array.isArray(statistik.gewerteteTage) &&
    statistik.gewerteteTage.every((tag) => typeof tag === "string")
  );
}

export function lesen(): Speicher {
  if (typeof window === "undefined") return leererSpeicher();
  try {
    const roh = window.localStorage.getItem(STORAGE_KEY);
    if (!roh) return leererSpeicher();
    const parsed = JSON.parse(roh) as Partial<Speicher>;
    const tage: Record<string, TagStand> = {};
    if (parsed.tage && typeof parsed.tage === "object") {
      for (const [datum, stand] of Object.entries(parsed.tage)) {
        if (istTagStand(stand) && stand.datum === datum) tage[datum] = stand;
      }
    }
    return {
      tage,
      statistik: istStatistik(parsed.statistik) ? parsed.statistik : leereStatistik(),
    };
  } catch {
    return leererSpeicher();
  }
}

/** Fehlende Wertungen nachziehen, falls eine Runde fertig war, aber nicht gezählt wurde. */
export function statistikNachholen(
  speicher: Speicher,
  preisAm: (datum: string) => number,
): Speicher {
  const fehlend = Object.values(speicher.tage)
    .filter((stand) => stand.fertig && !speicher.statistik.gewerteteTage.includes(stand.datum))
    .sort((a, b) => a.datum.localeCompare(b.datum));
  if (fehlend.length === 0) return speicher;
  let statistik = speicher.statistik;
  for (const stand of fehlend) {
    statistik = statistikAktualisieren(statistik, stand, preisAm(stand.datum));
  }
  return { ...speicher, statistik };
}

/** true, wenn der Browser den Stand behalten hat. */
export function schreiben(speicher: Speicher): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(speicher));
    return true;
  } catch {
    return false;
  }
}
