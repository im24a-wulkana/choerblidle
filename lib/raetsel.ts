import { MAX_TIPPS, SHUFFLE_SEED, START_DATUM } from "@/lib/config";
import { gestern, tageZwischen } from "@/lib/datum";
import type { BonusWahl, Produkt, Statistik, TagStand, Vergleich } from "@/lib/typen";
import { istTreffer, wertung, wertungsEmoji } from "@/lib/wertung";

function mulberry32(seed: number): () => number {
  let zustand = seed >>> 0;
  return () => {
    zustand = (zustand + 0x6d2b79f5) | 0;
    let wert = Math.imul(zustand ^ (zustand >>> 15), 1 | zustand);
    wert = (wert + Math.imul(wert ^ (wert >>> 7), 61 | wert)) ^ wert;
    return ((wert ^ (wert >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(eintraege: readonly T[], seed: number): T[] {
  const zufall = mulberry32(seed);
  const liste = [...eintraege];
  for (let i = liste.length - 1; i > 0; i--) {
    const j = Math.floor(zufall() * (i + 1));
    const aktuell = liste[i];
    liste[i] = liste[j];
    liste[j] = aktuell;
  }
  return liste;
}

function mod(wert: number, basis: number): number {
  return ((wert % basis) + basis) % basis;
}

export type Tagesraetsel = {
  nummer: number;
  produkt: Produkt;
  index: number;
};

export function tagesraetsel(datum: string, produkte: readonly Produkt[]): Tagesraetsel {
  const tage = tageZwischen(START_DATUM, datum);
  const reihenfolge = seededShuffle(produkte, SHUFFLE_SEED);
  const index = mod(tage, reihenfolge.length);
  return {
    nummer: tage + 1,
    produkt: reihenfolge[index],
    index,
  };
}

function werIstGuenstiger(migros: number, coop: number): Vergleich["guenstiger"] {
  if (migros < coop) return "migros";
  if (coop < migros) return "coop";
  return "gleich";
}

/**
 * Bonusfrage, sobald ein Coop-Vergleichspreis vorliegt und der gesuchte
 * Preis der Migros-Preis ist. So bleiben beide Läden eindeutig:
 * preis = Migros, preisCoop = Coop.
 */
export function vergleichVon(produkt: Produkt): Vergleich | null {
  if (typeof produkt.preisCoop !== "number") return null;
  if (produkt.laden !== "migros") return null;
  return {
    migros: produkt.preis,
    coop: produkt.preisCoop,
    guenstiger: werIstGuenstiger(produkt.preis, produkt.preisCoop),
  };
}

export function leererStand(datum: string): TagStand {
  return { datum, tipps: [], fertig: false, bonus: null };
}

export function leereStatistik(): Statistik {
  return {
    gespielt: 0,
    siege: 0,
    verteilung: [0, 0, 0, 0],
    streak: 0,
    besteSerie: 0,
    letzterSieg: null,
    gewerteteTage: [],
  };
}

export function naechsterStand(stand: TagStand, tipp: number, preis: number): TagStand {
  if (stand.fertig || stand.tipps.length >= MAX_TIPPS) return stand;
  const tipps = [...stand.tipps, tipp];
  const fertig = istTreffer(tipp, preis) || tipps.length >= MAX_TIPPS;
  return { ...stand, tipps, fertig };
}

export function bonusSetzen(stand: TagStand, wahl: BonusWahl): TagStand {
  if (!stand.fertig || stand.bonus !== null) return stand;
  return { ...stand, bonus: wahl };
}

export function statistikAktualisieren(
  statistik: Statistik,
  stand: TagStand,
  preis: number,
): Statistik {
  if (!stand.fertig || statistik.gewerteteTage.includes(stand.datum)) return statistik;
  const gewonnen = stand.tipps.some((tipp) => istTreffer(tipp, preis));
  const verteilung: [number, number, number, number] = [...statistik.verteilung];
  let streak = statistik.streak;
  let letzterSieg = statistik.letzterSieg;
  if (gewonnen) {
    const index = stand.tipps.length - 1;
    if (index >= 0 && index < verteilung.length) verteilung[index] += 1;
    streak = letzterSieg === gestern(stand.datum) ? streak + 1 : 1;
    letzterSieg = stand.datum;
  } else {
    streak = 0;
  }
  return {
    gespielt: statistik.gespielt + 1,
    siege: statistik.siege + (gewonnen ? 1 : 0),
    verteilung,
    streak,
    besteSerie: Math.max(statistik.besteSerie, streak),
    letzterSieg,
    gewerteteTage: [...statistik.gewerteteTage, stand.datum],
  };
}

/** Serie, die heute noch gilt: letzter Sieg war heute oder gestern. */
export function sichtbareSerie(statistik: Statistik, heute: string): number {
  if (statistik.streak <= 0 || !statistik.letzterSieg) return 0;
  if (statistik.letzterSieg === heute || statistik.letzterSieg === gestern(heute)) {
    return statistik.streak;
  }
  return 0;
}

export function bonusRichtig(stand: TagStand, produkt: Produkt): boolean {
  const vergleich = vergleichVon(produkt);
  if (!vergleich || !stand.bonus || vergleich.guenstiger === "gleich") return false;
  return stand.bonus === vergleich.guenstiger;
}

export function teilenText(args: {
  nummer: number;
  tipps: number[];
  preis: number;
  bonusRichtig: boolean;
  link: string;
}): string {
  const { nummer, tipps, preis, link } = args;
  const stern = args.bonusRichtig ? " ⭐" : "";
  if (tipps.length === 0) return `Chörblidle #${nummer}${stern}\n${link}`;
  const erster = wertungsEmoji(wertung(tipps[0], preis));
  const getroffen = tipps.some((tipp) => istTreffer(tipp, preis));
  const ende = getroffen ? "🟩" : "⬜";
  const pfeil = tipps.length === 1 && getroffen ? "" : ` → ${ende}`;
  return `Chörblidle #${nummer} ${erster}${pfeil} in ${tipps.length}${stern}\n${link}`;
}
