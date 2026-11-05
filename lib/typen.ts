export type Laden = "migros" | "coop" | "ottos";

export type Produkt = {
  id: string;
  name: string;
  menge: string;
  preis: number;
  preisCoop?: number;
  laden: Laden;
  bild: string;
  stichdatum: string;
};

export type BonusWahl = "migros" | "coop";

/** Stand einer Runde, ein Eintrag pro Kalendertag. */
export type TagStand = {
  datum: string;
  tipps: number[];
  fertig: boolean;
  bonus: BonusWahl | null;
};

export type Statistik = {
  gespielt: number;
  siege: number;
  verteilung: [number, number, number, number, number];
  streak: number;
  besteSerie: number;
  letzterSieg: string | null;
  gewerteteTage: string[];
};

export type Vergleich = {
  migros: number;
  coop: number;
  guenstiger: "migros" | "coop" | "gleich";
};

export type WertungsFarbe = "gruen" | "gelb" | "weiss";

export type Richtung = "hoeher" | "tiefer" | "treffer";
