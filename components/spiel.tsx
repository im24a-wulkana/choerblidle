"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Kopfzeile, Rahmen, Spalte } from "@/components/spiel-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BEISPIELPREISE, MAX_TIPPS, PLATZHALTER_BILD } from "@/lib/config";
import { formatCountdown, formatStichdatum, msBisMitternacht, zurichDatum } from "@/lib/datum";
import { formatChf, formatProzent, parseChf } from "@/lib/geld";
import { produkte } from "@/lib/produkte";
import {
  bonusRichtig,
  bonusSetzen,
  leererStand,
  naechsterStand,
  statistikAktualisieren,
  tagesraetsel,
  teilenText,
  vergleichVon,
} from "@/lib/raetsel";
import { lesen, schreiben, statistikNachholen, type Speicher } from "@/lib/speicher";
import type { BonusWahl, Produkt, TagStand, WertungsFarbe } from "@/lib/typen";
import { abweichungProzent, istTreffer, richtung, wertung } from "@/lib/wertung";
import { cn } from "@/lib/utils";

const KACHEL: Record<WertungsFarbe, string> = {
  gruen: "bg-[#6aaa64] dark:bg-[#538d4e]",
  gelb: "bg-[#c9b458] dark:bg-[#b59f3b]",
  weiss: "bg-[#787c7e] dark:bg-[#3a3a3c]",
};

const TIPP_WORT = ["ersten", "zweiten", "dritten", "vierten"] as const;

const TASTE =
  "h-12 rounded-none bg-[#121213] px-4 font-bold text-white hover:bg-[#121213]/90 dark:bg-[#d7dadc] dark:text-[#121213] dark:hover:bg-white";

export function Spiel() {
  const [datum, setDatum] = useState<string | null>(null);
  const [jetzt, setJetzt] = useState<number | null>(null);
  const [stand, setStand] = useState<TagStand | null>(null);
  const [speicher, setSpeicher] = useState<Speicher | null>(null);
  const [eingabe, setEingabe] = useState("");
  const [fehler, setFehler] = useState<string | null>(null);
  const [kopiert, setKopiert] = useState(false);
  const [manuell, setManuell] = useState<string | null>(null);
  const [speicherFehler, setSpeicherFehler] = useState(false);
  const eingabeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ladenFuer = (zeit: Date) => {
      const tag = zurichDatum(zeit);
      const roh = lesen();
      const geladen = statistikNachholen(roh, (datumDesTages) => {
        return tagesraetsel(datumDesTages, produkte).produkt.preis;
      });
      if (geladen !== roh) schreiben(geladen);
      setDatum(tag);
      setJetzt(zeit.getTime());
      setStand(geladen.tage[tag] ?? leererStand(tag));
      setSpeicher(geladen);
      setEingabe("");
      setFehler(null);
      setKopiert(false);
      setManuell(null);
      setSpeicherFehler(false);
    };

    ladenFuer(new Date());
    let letzterTag = zurichDatum();
    const timer = window.setInterval(() => {
      const zeit = new Date();
      const tag = zurichDatum(zeit);
      setJetzt(zeit.getTime());
      if (tag !== letzterTag) {
        letzterTag = tag;
        ladenFuer(zeit);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!datum || !stand || !speicher || jetzt == null) {
    return (
      <Rahmen>
        <Kopfzeile />
        <Spalte>
          <Geruest />
        </Spalte>
      </Rahmen>
    );
  }

  const raetsel = tagesraetsel(datum, produkte);
  const produkt = raetsel.produkt;
  const vergleich = vergleichVon(produkt);
  const gewonnen = stand.tipps.some((tipp) => istTreffer(tipp, produkt.preis));

  function merken(naechster: TagStand) {
    const statistik = statistikAktualisieren(speicher!.statistik, naechster, produkt.preis);
    const neu: Speicher = {
      tage: { ...speicher!.tage, [datum!]: naechster },
      statistik,
    };
    setSpeicherFehler(!schreiben(neu));
    setSpeicher(neu);
    setStand(naechster);
  }

  function abgeben(event: FormEvent) {
    event.preventDefault();
    if (stand!.fertig) return;
    if (zurichDatum() !== datum) return;
    const betrag = parseChf(eingabe);
    if (betrag == null) {
      setFehler("Bitte einen Betrag eingeben, zum Beispiel 3.50.");
      return;
    }
    const naechster = naechsterStand(stand!, betrag, produkt.preis);
    merken(naechster);
    setEingabe("");
    setFehler(null);
    setKopiert(false);
    setManuell(null);
    if (!naechster.fertig) eingabeRef.current?.focus();
  }

  function bonusWaehlen(wahl: BonusWahl) {
    if (!stand!.fertig || stand!.bonus) return;
    merken(bonusSetzen(stand!, wahl));
    setKopiert(false);
  }

  async function teilen() {
    const text = teilenText({
      nummer: raetsel.nummer,
      tipps: stand!.tipps,
      preis: produkt.preis,
      bonusRichtig: bonusRichtig(stand!, produkt),
      link: `${window.location.origin}${window.location.pathname}`,
    });
    try {
      await navigator.clipboard.writeText(text);
      setKopiert(true);
      setManuell(null);
    } catch {
      setKopiert(false);
      setManuell(text);
    }
  }

  return (
    <Rahmen>
      <Kopfzeile
        statistik={speicher.statistik}
        heute={datum}
        markiert={stand.fertig && gewonnen ? stand.tipps.length : null}
      />
      <Spalte>
        <section className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-52 w-full items-center justify-center sm:h-64">
            <ProduktBild src={produkt.bild} />
          </div>
          <h2 className="text-xl font-bold tracking-tight">{produkt.name}</h2>
          <p className="text-sm text-[#787c7e] dark:text-[#818384]">
            {produkt.menge} · {produkt.laden === "migros" ? "Migros" : "Coop"}
          </p>
          <p className="text-sm font-bold tabular-nums">
            #{raetsel.nummer}
            <span className="font-normal text-[#787c7e] dark:text-[#818384]">
              {" "}
              · nächstes in {formatCountdown(msBisMitternacht(new Date(jetzt)))}
            </span>
          </p>
          {BEISPIELPREISE ? (
            <p className="text-xs text-[#787c7e] dark:text-[#818384]">
              Beispieldaten, keine echten Regalpreise.
            </p>
          ) : null}
        </section>

        {stand.fertig ? (
          <Ergebnis produkt={produkt} tipps={stand.tipps} gewonnen={gewonnen} />
        ) : (
          <form onSubmit={abgeben} className="space-y-2" noValidate>
            <p className="text-center text-sm font-bold tabular-nums">
              {stand.tipps.length + 1}/{MAX_TIPPS}
            </p>
            <div className="flex gap-2">
              <label htmlFor="preis" className="sr-only">
                Preis in CHF
              </label>
              <Input
                ref={eingabeRef}
                id="preis"
                value={eingabe}
                onChange={(event) => {
                  setEingabe(event.target.value);
                  if (fehler) setFehler(null);
                }}
                inputMode="decimal"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="done"
                placeholder="z. B. 3.50"
                aria-invalid={fehler ? true : undefined}
                aria-describedby={fehler ? "preis-fehler" : undefined}
                className="h-12 rounded-none border-2 text-base tabular-nums"
              />
              <Button type="submit" className={TASTE}>
                Tippen
              </Button>
            </div>
            {fehler ? (
              <p id="preis-fehler" className="text-center text-sm text-destructive" role="alert">
                {fehler}
              </p>
            ) : null}
          </form>
        )}

        <TippListe tipps={stand.tipps} preis={produkt.preis} />

        {stand.fertig ? (
          <div className="space-y-2">
            <Button type="button" className={cn(TASTE, "w-full")} onClick={teilen}>
              {kopiert ? "Kopiert" : "Ergebnis teilen"}
            </Button>
            {manuell ? (
              <div className="space-y-1">
                <p className="text-sm text-[#787c7e] dark:text-[#818384]">Bitte manuell kopieren.</p>
                <textarea
                  readOnly
                  value={manuell}
                  className="min-h-20 w-full border-2 border-[#d3d6da] bg-transparent p-3 text-sm dark:border-[#3a3a3c]"
                  onFocus={(event) => event.currentTarget.select()}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {stand.fertig && vergleich && vergleich.guenstiger !== "gleich" ? (
          <section className="space-y-3 border-t border-[#d3d6da] pt-4 text-center dark:border-[#3a3a3c]">
            <h3 className="text-sm font-bold">Bonusfrage</h3>
            <p>Wo ist dieses Produkt günstiger, Migros oder Coop?</p>
            {stand.bonus == null ? (
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" className="h-12 rounded-none border-2 font-bold" onClick={() => bonusWaehlen("migros")}>
                  Migros
                </Button>
                <Button type="button" variant="outline" className="h-12 rounded-none border-2 font-bold" onClick={() => bonusWaehlen("coop")}>
                  Coop
                </Button>
              </div>
            ) : (
              <div className="space-y-1 text-sm leading-6">
                <p className="font-bold">
                  {bonusRichtig(stand, produkt)
                    ? `Richtig, bei ${stand.bonus === "migros" ? "Migros" : "Coop"}. ⭐`
                    : `Leider nein. Günstiger ist ${vergleich.guenstiger === "migros" ? "Migros" : "Coop"}.`}
                </p>
                <p className="text-[#787c7e] dark:text-[#818384]">
                  Migros {formatChf(vergleich.migros)} · Coop {formatChf(vergleich.coop)}
                </p>
              </div>
            )}
          </section>
        ) : null}

        {stand.fertig && vergleich?.guenstiger === "gleich" ? (
          <p className="text-center text-sm text-[#787c7e]">Bei Migros und Coop gleich teuer.</p>
        ) : null}

        {speicherFehler ? (
          <p className="text-center text-sm text-destructive" role="alert">
            Dieser Browser speichert den Stand nicht. Nach dem Neuladen ist die Runde weg.
          </p>
        ) : null}

        <footer className="mt-auto space-y-1 pt-4 text-center text-xs leading-5 text-[#787c7e] dark:text-[#818384]">
          <p>Ein Versuch pro Tag. Der Stand bleibt auf diesem Gerät.</p>
          <p>Nicht mit Migros oder Coop verbunden.</p>
        </footer>
      </Spalte>
    </Rahmen>
  );
}

function Ergebnis({
  produkt,
  tipps,
  gewonnen,
}: {
  produkt: Produkt;
  tipps: number[];
  gewonnen: boolean;
}) {
  const erster = tipps[0];
  const prozent = erster == null ? null : abweichungProzent(erster, produkt.preis);
  const wort = TIPP_WORT[tipps.length - 1] ?? "letzten";
  return (
    <section className="space-y-1 text-center" aria-live="polite">
      <p className="text-xs tracking-[0.14em] text-[#787c7e] uppercase dark:text-[#818384]">
        {BEISPIELPREISE ? "Beispielpreis" : "Preis"}
      </p>
      <p className="text-4xl font-bold tabular-nums">{formatChf(produkt.preis)}</p>
      <p className="text-sm text-[#787c7e] dark:text-[#818384]">
        Stichdatum {formatStichdatum(produkt.stichdatum)}
      </p>
      <p className="text-sm">
        {gewonnen ? `Getroffen im ${wort} Tipp.` : "Kein Treffer in vier Tipps."}
        {prozent == null
          ? null
          : prozent === 0
            ? " Der erste Tipp lag genau richtig."
            : ` Der erste Tipp lag ${formatProzent(prozent)} daneben.`}
      </p>
    </section>
  );
}

function TippListe({ tipps, preis }: { tipps: number[]; preis: number }) {
  return (
    <ol className="flex flex-col gap-1.5" aria-label="Deine Tipps">
      {Array.from({ length: MAX_TIPPS }, (_, index) => {
        const tipp = tipps[index];
        if (tipp == null) {
          return (
            <li
              key={index}
              aria-hidden
              className="h-[52px] border-2 border-[#d3d6da] dark:border-[#3a3a3c]"
            />
          );
        }
        const farbe = wertung(tipp, preis);
        const weg = richtung(tipp, preis);
        const zeichen = weg === "hoeher" ? "↑" : weg === "tiefer" ? "↓" : "✓";
        const ansage =
          weg === "hoeher" ? "Preis liegt höher" : weg === "tiefer" ? "Preis liegt tiefer" : "Treffer";
        return (
          <li
            key={`${index}-${tipp}`}
            className={cn(
              "flex h-[52px] items-center justify-between px-4 text-xl font-bold text-white",
              KACHEL[farbe],
            )}
          >
            <span className="tabular-nums">{formatChf(tipp)}</span>
            <span aria-hidden>{zeichen}</span>
            <span className="sr-only">
              {formatProzent(abweichungProzent(tipp, preis))}, {ansage}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function ProduktBild({ src }: { src: string }) {
  const [fehlerSrc, setFehlerSrc] = useState<string | null>(null);
  const aktuell = fehlerSrc === src ? PLATZHALTER_BILD : src;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={aktuell}
      alt=""
      width={480}
      height={480}
      className="h-full w-auto max-w-full object-contain"
      onError={() => {
        if (src !== PLATZHALTER_BILD) setFehlerSrc(src);
      }}
    />
  );
}

function Geruest() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-52 w-full animate-pulse bg-[#f4f4f4] dark:bg-[#1a1a1b] sm:h-64" />
      <div className="h-6 w-40 animate-pulse bg-[#f4f4f4] dark:bg-[#1a1a1b]" />
      <div className="h-[52px] w-full border-2 border-[#d3d6da] dark:border-[#3a3a3c]" />
      <p className="sr-only">Chörblidle wird geladen.</p>
    </div>
  );
}
