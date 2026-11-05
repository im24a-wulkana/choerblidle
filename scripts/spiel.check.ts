import assert from "node:assert/strict";
import { migrosBild } from "../lib/bild.ts";
import { START_DATUM } from "../lib/config.ts";
import {
  endlosNachTipp,
  endlosNeu,
  endlosNaechstes,
  leererEndlessSpeicher,
  punkteFuerTreffer,
  zufallsProdukt,
} from "../lib/endless.ts";
import { verteilungAufFuenf } from "../lib/speicher.ts";
import {
  formatCountdown,
  formatStichdatum,
  gestern,
  morgen as naechsterTag,
  msBisMitternacht,
  tageZwischen,
  zurichDatum,
} from "../lib/datum.ts";
import { formatChf, parseChf } from "../lib/geld.ts";
import { produkte } from "../lib/produkte.ts";
import {
  bonusRichtig,
  bonusSetzen,
  leereStatistik,
  leererStand,
  naechsterStand,
  sichtbareSerie,
  statistikAktualisieren,
  tagesraetsel,
  teilenText,
  vergleichVon,
} from "../lib/raetsel.ts";
import { istTreffer, richtung, wertung } from "../lib/wertung.ts";

assert.equal(produkte.length, 10984);
assert.equal(new Set(produkte.map((produkt) => produkt.id)).size, produkte.length);

for (const produkt of produkte) {
  assert.equal(produkt.laden, "migros");
  assert.equal(produkt.stichdatum, "2026-11-05");
  assert.equal(produkt.preisCoop, undefined);
  assert.ok(produkt.bild.startsWith("https://image.migros.ch/"));
}

assert.equal(tageZwischen(START_DATUM, "2026-11-04"), 0);
assert.equal(tageZwischen(START_DATUM, "2026-11-05"), 1);
assert.equal(tageZwischen(START_DATUM, "2026-11-03"), -1);
assert.equal(gestern("2026-11-04"), "2026-11-03");
assert.equal(naechsterTag("2026-11-04"), "2026-11-05");
assert.equal(
  migrosBild(
    "https://image.migros.ch/d/mo-boxed/o-af-1-t.clr-fff/abc/produkt.jpg",
  ),
  "https://image.migros.ch/d/mo-boxed/v-w-480-h-320/o-af-1/abc/produkt.jpg",
);
assert.equal(migrosBild("/products/placeholder.svg"), "/products/placeholder.svg");
assert.equal(gestern("2026-03-01"), "2026-02-28");

assert.equal(zurichDatum(new Date("2026-11-03T22:30:00Z")), "2026-11-03");
assert.equal(zurichDatum(new Date("2026-11-03T23:30:00Z")), "2026-11-04");
assert.equal(zurichDatum(new Date("2026-07-04T21:30:00Z")), "2026-07-04");
assert.equal(zurichDatum(new Date("2026-07-04T22:30:00Z")), "2026-07-05");

assert.equal(msBisMitternacht(new Date("2026-11-04T22:00:00.000Z")), 3_600_000);
assert.equal(msBisMitternacht(new Date("2026-11-04T22:59:59.000Z")), 1000);
assert.equal(msBisMitternacht(new Date("2026-11-04T23:00:00.000Z")), 86_400_000);
assert.equal(formatCountdown(3_661_000), "01:01:01");

const stich = formatStichdatum("2026-11-04");
assert.match(stich, /4/);
assert.match(stich, /2026/);
assert.match(stich, /November/);

assert.equal(parseChf("3,50"), 3.5);
assert.equal(parseChf("3.50"), 3.5);
assert.equal(parseChf("  2,5 "), 2.5);
assert.equal(parseChf("3"), 3);
assert.equal(parseChf("0.01"), 0.01);
assert.equal(parseChf(""), null);
assert.equal(parseChf("0"), null);
assert.equal(parseChf("-1"), null);
assert.equal(parseChf("3.555"), null);
assert.equal(parseChf("abc"), null);
assert.equal(parseChf("2,50 CHF"), null);
assert.equal(formatChf(2.4), "CHF 2.40");

assert.equal(wertung(10.2, 10), "gruen");
assert.equal(wertung(10.21, 10), "gelb");
assert.equal(wertung(9.8, 10), "gruen");
assert.equal(wertung(9.79, 10), "gelb");
assert.equal(wertung(11, 10), "gelb");
assert.equal(wertung(11.01, 10), "weiss");
assert.equal(wertung(9, 10), "gelb");
assert.equal(wertung(8.99, 10), "weiss");
assert.equal(istTreffer(10.2, 10), true);
assert.equal(istTreffer(10.21, 10), false);
assert.equal(richtung(9, 10), "hoeher");
assert.equal(richtung(11, 10), "tiefer");
assert.equal(richtung(10.1, 10), "treffer");

function plusTage(iso: string, tage: number): string {
  const [jahr, monat, tag] = iso.split("-").map(Number);
  return new Date(Date.UTC(jahr, monat - 1, tag + tage)).toISOString().slice(0, 10);
}

const heute = tagesraetsel("2026-11-04", produkte);
const morgen = tagesraetsel("2026-11-05", produkte);
assert.equal(heute.nummer, 1);
assert.equal(morgen.nummer, 2);
assert.notEqual(heute.produkt.id, morgen.produkt.id);
assert.equal(tagesraetsel("2026-11-04", produkte).produkt.id, heute.produkt.id);

const wieder = tagesraetsel(plusTage("2026-11-04", produkte.length), produkte);
assert.equal(wieder.produkt.id, heute.produkt.id);
assert.equal(wieder.nummer, produkte.length + 1);

let stand = leererStand("2026-11-04");
stand = naechsterStand(stand, 11, 10);
assert.equal(stand.fertig, false);
assert.deepEqual(stand.tipps, [11]);
stand = naechsterStand(stand, 10.5, 10);
assert.equal(stand.fertig, false);
stand = naechsterStand(stand, 10, 10);
assert.equal(stand.fertig, true);
assert.equal(naechsterStand(stand, 1, 10), stand);

let stats = leereStatistik();
stats = statistikAktualisieren(stats, stand, 10);
assert.equal(stats.gespielt, 1);
assert.equal(stats.siege, 1);
assert.deepEqual(stats.verteilung, [0, 0, 1, 0, 0]);
assert.equal(stats.streak, 1);
assert.equal(statistikAktualisieren(stats, stand, 10).gespielt, 1);

const verloren = [1, 2, 3, 4, 5].reduce(
  (stand, tipp) => naechsterStand(stand, tipp, 10),
  leererStand("2026-11-05"),
);
assert.equal(verloren.fertig, true);
assert.equal(verloren.tipps.length, 5);
stats = statistikAktualisieren(stats, verloren, 10);
assert.equal(stats.gespielt, 2);
assert.equal(stats.siege, 1);
assert.equal(stats.streak, 0);
assert.equal(stats.besteSerie, 1);
assert.equal(sichtbareSerie(stats, "2026-11-05"), 0);

let serie = leereStatistik();
const montag = naechsterStand(leererStand("2026-11-02"), 10, 10);
serie = statistikAktualisieren(serie, montag, 10);
assert.equal(sichtbareSerie(serie, "2026-11-02"), 1);
assert.equal(sichtbareSerie(serie, "2026-11-03"), 1);
assert.equal(sichtbareSerie(serie, "2026-11-04"), 0);
const dienstag = naechsterStand(leererStand("2026-11-03"), 10, 10);
serie = statistikAktualisieren(serie, dienstag, 10);
assert.equal(serie.streak, 2);
assert.equal(serie.besteSerie, 2);

const text = teilenText({
  nummer: 12,
  tipps: [11, 10.5, 10],
  preis: 10,
  bonusRichtig: true,
  link: "https://choerblidle.example",
});
assert.equal(text, "Chörblidle #12 🟨🟨🟩 in 3 ⭐\nhttps://choerblidle.example");
assert.equal(
  teilenText({ nummer: 12, tipps: [10], preis: 10, bonusRichtig: false, link: "https://x" }),
  "Chörblidle #12 🟩 in 1\nhttps://x",
);
assert.equal(
  teilenText({
    nummer: 12,
    tipps: [20, 1, 15, 8, 9],
    preis: 10,
    bonusRichtig: false,
    link: "https://x",
  }),
  "Chörblidle #12 ⬜⬜⬜⬜🟨 in 5\nhttps://x",
);

const mitVergleich = {
  id: "thomy-senf",
  name: "Thomy Senf mild",
  menge: "100 ml",
  preis: 1.8,
  preisCoop: 1.7,
  laden: "migros" as const,
  bild: "/products/placeholder.svg",
  stichdatum: "2026-11-05",
};
const vergleich = vergleichVon(mitVergleich);
assert.equal(vergleich?.guenstiger, "coop");
const coopOnly = {
  id: "valser-classic",
  name: "Valser Classic",
  menge: "6 × 1.5 l",
  preis: 6.95,
  laden: "coop" as const,
  bild: "/products/placeholder.svg",
  stichdatum: "2026-11-05",
};
assert.equal(vergleichVon(coopOnly), null);

let bonusStand = naechsterStand(leererStand("2026-11-04"), 1.8, 1.8);
bonusStand = bonusSetzen(bonusStand, "coop");
assert.equal(bonusRichtig(bonusStand, mitVergleich), true);
assert.equal(bonusSetzen(bonusStand, "migros").bonus, "coop");

assert.deepEqual(verteilungAufFuenf([1, 2, 3, 4, 5, 6]), [1, 2, 3, 4, 11]);
assert.deepEqual(verteilungAufFuenf([1, 2, 3, 4]), [1, 2, 3, 4, 0]);
assert.deepEqual(verteilungAufFuenf([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5]);

assert.equal(punkteFuerTreffer(1), 5);
assert.equal(punkteFuerTreffer(5), 1);
assert.equal(punkteFuerTreffer(0), 0);

const katalog = [
  { ...mitVergleich, id: "a", preis: 10 },
  { ...mitVergleich, id: "b", preis: 10 },
  { ...mitVergleich, id: "c", preis: 10 },
];
assert.equal(zufallsProdukt(katalog, "a", () => 0).id, "b");
assert.equal(zufallsProdukt(katalog, null, () => 0.5).id, "b");
assert.equal(zufallsProdukt(katalog, "b", () => 0.5).id, "c");

let endlos = { ...leererEndlessSpeicher(), lauf: { produktId: "a", tipps: [], fertig: false, vorbei: false, punkte: 0, streak: 0 } };
endlos = endlosNachTipp(endlos, 10, 10);
assert.equal(endlos.lauf?.fertig, true);
assert.equal(endlos.lauf?.vorbei, false);
assert.equal(endlos.lauf?.punkte, 5);
assert.equal(endlos.lauf?.streak, 1);
assert.equal(endlos.highscore, 5);
endlos = endlosNaechstes(endlos, "b");
assert.equal(endlos.lauf?.produktId, "b");
assert.equal(endlos.lauf?.tipps.length, 0);
assert.equal(endlos.lauf?.punkte, 5);
endlos = endlosNachTipp(endlos, 20, 10);
endlos = endlosNachTipp(endlos, 1, 10);
endlos = endlosNachTipp(endlos, 15, 10);
endlos = endlosNachTipp(endlos, 8, 10);
assert.equal(endlos.lauf?.vorbei, false);
endlos = endlosNachTipp(endlos, 7, 10);
assert.equal(endlos.lauf?.vorbei, true);
assert.equal(endlos.lauf?.punkte, 5);
assert.equal(endlos.lauf?.streak, 1);
assert.equal(endlos.highscore, 5);
endlos = endlosNeu(endlos, "c");
assert.equal(endlos.lauf?.punkte, 0);
assert.equal(endlos.lauf?.streak, 0);
assert.equal(endlos.highscore, 5);
assert.equal(endlos.lauf?.produktId, "c");

console.log(
  `Tag 1: #${heute.nummer} ${heute.produkt.name} CHF ${heute.produkt.preis} (${heute.produkt.id})`,
);
const reihe = Array.from({ length: 7 }, (_, index) => {
  return tagesraetsel(plusTage("2026-11-04", index), produkte).produkt.id;
});
console.log(reihe.join(","));
