import { MAX_TIPPS } from "@/lib/config";
import { naechsterStand } from "@/lib/raetsel";
import type { Produkt } from "@/lib/typen";
import { istTreffer } from "@/lib/wertung";

export const ENDLESS_KEY = "choerblidle-endless-v1";

export type EndlessLauf = {
  produktId: string;
  tipps: number[];
  fertig: boolean;
  vorbei: boolean;
  punkte: number;
  streak: number;
};

export type EndlessSpeicher = {
  highscore: number;
  besterStreak: number;
  lauf: EndlessLauf | null;
};

export function leererEndlessSpeicher(): EndlessSpeicher {
  return { highscore: 0, besterStreak: 0, lauf: null };
}

/** Treffer im ersten Tipp gibt 4 Punkte, im vierten noch 1. */
export function punkteFuerTreffer(anzahlTipps: number): number {
  if (anzahlTipps < 1 || anzahlTipps > MAX_TIPPS) return 0;
  return MAX_TIPPS - anzahlTipps + 1;
}

export function zufallsProdukt(
  liste: readonly Produkt[],
  ausserId: string | null,
  zufall: () => number,
): Produkt {
  if (liste.length === 0) {
    throw new Error("Keine Produkte.");
  }
  if (liste.length === 1) return liste[0];
  const roh = zufall();
  const index = Math.min(liste.length - 1, Math.max(0, Math.floor(roh * liste.length)));
  const gewaehlt = liste[index] ?? liste[0];
  if (gewaehlt.id !== ausserId) return gewaehlt;
  return liste[(index + 1) % liste.length] ?? gewaehlt;
}

export function neuerLauf(produktId: string): EndlessLauf {
  return {
    produktId,
    tipps: [],
    fertig: false,
    vorbei: false,
    punkte: 0,
    streak: 0,
  };
}

function mitRekord(speicher: EndlessSpeicher): EndlessSpeicher {
  const lauf = speicher.lauf;
  if (!lauf) return speicher;
  return {
    ...speicher,
    highscore: Math.max(speicher.highscore, lauf.punkte),
    besterStreak: Math.max(speicher.besterStreak, lauf.streak),
  };
}

export function endlosNachTipp(
  speicher: EndlessSpeicher,
  tipp: number,
  preis: number,
): EndlessSpeicher {
  const lauf = speicher.lauf;
  if (!lauf || lauf.fertig || lauf.vorbei) return speicher;
  const stand = naechsterStand(
    { datum: "endlos", tipps: lauf.tipps, fertig: false, bonus: null },
    tipp,
    preis,
  );
  const letzter = stand.tipps[stand.tipps.length - 1];
  const treffer = letzter != null && istTreffer(letzter, preis);
  let naechster: EndlessLauf = { ...lauf, tipps: stand.tipps, fertig: stand.fertig };
  if (stand.fertig && treffer) {
    naechster = {
      ...naechster,
      punkte: lauf.punkte + punkteFuerTreffer(stand.tipps.length),
      streak: lauf.streak + 1,
      vorbei: false,
    };
  } else if (stand.fertig) {
    naechster = { ...naechster, vorbei: true };
  }
  return mitRekord({ ...speicher, lauf: naechster });
}

export function endlosNaechstes(speicher: EndlessSpeicher, produktId: string): EndlessSpeicher {
  const lauf = speicher.lauf;
  if (!lauf || !lauf.fertig || lauf.vorbei) return speicher;
  return {
    ...speicher,
    lauf: {
      produktId,
      tipps: [],
      fertig: false,
      vorbei: false,
      punkte: lauf.punkte,
      streak: lauf.streak,
    },
  };
}

export function endlosNeu(speicher: EndlessSpeicher, produktId: string): EndlessSpeicher {
  return { ...speicher, lauf: neuerLauf(produktId) };
}

function istLauf(wert: unknown): wert is EndlessLauf {
  if (!wert || typeof wert !== "object") return false;
  const lauf = wert as EndlessLauf;
  return (
    typeof lauf.produktId === "string" &&
    lauf.produktId.length > 0 &&
    Array.isArray(lauf.tipps) &&
    lauf.tipps.every((tipp) => typeof tipp === "number" && Number.isFinite(tipp)) &&
    typeof lauf.fertig === "boolean" &&
    typeof lauf.vorbei === "boolean" &&
    typeof lauf.punkte === "number" &&
    Number.isFinite(lauf.punkte) &&
    lauf.punkte >= 0 &&
    typeof lauf.streak === "number" &&
    Number.isFinite(lauf.streak) &&
    lauf.streak >= 0
  );
}

function ganzeZahl(wert: unknown): wert is number {
  return typeof wert === "number" && Number.isFinite(wert) && wert >= 0;
}

export function endlessLesen(): EndlessSpeicher {
  if (typeof window === "undefined") return leererEndlessSpeicher();
  try {
    const roh = window.localStorage.getItem(ENDLESS_KEY);
    if (!roh) return leererEndlessSpeicher();
    const parsed = JSON.parse(roh) as Partial<EndlessSpeicher>;
    return {
      highscore: ganzeZahl(parsed.highscore) ? parsed.highscore : 0,
      besterStreak: ganzeZahl(parsed.besterStreak) ? parsed.besterStreak : 0,
      lauf: istLauf(parsed.lauf) ? parsed.lauf : null,
    };
  } catch {
    return leererEndlessSpeicher();
  }
}

export function endlessSchreiben(speicher: EndlessSpeicher): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(ENDLESS_KEY, JSON.stringify(speicher));
    return true;
  } catch {
    return false;
  }
}
