"use client";

import type { ReactNode } from "react";
import { ChartColumn, CircleQuestionMark, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { leereStatistik, sichtbareSerie } from "@/lib/raetsel";
import { setDunkel, useDunkel } from "@/lib/theme";
import type { Statistik } from "@/lib/typen";
import { cn } from "@/lib/utils";

export const MODAL =
  "max-h-[min(40rem,calc(100%-2rem))] gap-5 overflow-y-auto rounded-md border border-[#d3d6da] bg-white p-6 text-[#121213] shadow-[0_4px_24px_rgba(0,0,0,0.25)] sm:max-w-[500px] dark:border-[#3a3a3c] dark:bg-[#121213] dark:text-white";

const ICON =
  "size-10 text-[#121213] hover:bg-black/5 dark:text-white dark:hover:bg-white/10 [&_svg]:size-6";

export function Kopfzeile({
  statistik = leereStatistik(),
  heute = "",
  markiert = null,
}: {
  statistik?: Statistik;
  heute?: string;
  markiert?: number | null;
}) {
  return (
    <header className="relative flex h-14 shrink-0 items-center justify-between border-b border-[#d3d6da] px-1 dark:border-[#3a3a3c]">
      <HilfeDialog />
      <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[1.45rem] font-bold tracking-tight sm:text-[1.85rem]">
        Chörblidle
      </h1>
      <div className="flex items-center">
        <StatistikDialog statistik={statistik} heute={heute} markiert={markiert} />
        <EinstellungenDialog />
      </div>
    </header>
  );
}

export function Rahmen({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      {children}
    </div>
  );
}

export function Spalte({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-[500px] flex-1 flex-col gap-4 px-5 pt-5 pb-10">
      {children}
    </main>
  );
}

function HilfeDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" size="icon" className={ICON} aria-label="Spielregeln" />}>
        <CircleQuestionMark />
      </DialogTrigger>
      <DialogContent className={MODAL}>
        <DialogHeader className="items-center gap-2 pr-6">
          <DialogTitle className="text-center text-lg font-bold">Spielregeln</DialogTitle>
          <DialogDescription className="text-center text-sm text-[#787c7e] dark:text-[#818384]">
            Errate den Preis in vier Tipps.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm leading-6">
          <p>Jeden Tag dasselbe Produkt, mit Bild, Name, Menge und Laden. Komma und Punkt gehen beide.</p>
          <p>
            Endless spielt zufällige Migros-Artikel ohne Tageslimit. Ein Treffer gibt 4 Punkte im ersten Tipp,
            dann 3, 2 und 1. Ein Fehlversuch beendet die Runde. Der Highscore bleibt auf diesem Gerät.
          </p>
          <p>Der erste Tipp zählt für die Wertung. Abweichung ist |Tipp − Preis| / Preis.</p>
          <Beispiel zeile="CHF 1.00" pfeil="↑" farbe="bg-[#787c7e] dark:bg-[#3a3a3c]">
            Mehr als 10 % daneben.
          </Beispiel>
          <Beispiel zeile="CHF 2.15" pfeil="↓" farbe="bg-[#c9b458] dark:bg-[#b59f3b]">
            Bis 10 % daneben.
          </Beispiel>
          <Beispiel zeile="CHF 2.00" pfeil="✓" farbe="bg-[#6aaa64] dark:bg-[#538d4e]">
            Bis 2 % ist ein Treffer.
          </Beispiel>
          <p>⬆️ der Preis liegt höher. ⬇️ er liegt tiefer. Danach höchstens drei weitere Tipps.</p>
          <p>Am Ende siehst du den Preis und das Stichdatum. Liegt ein Coop-Preis vor: «Wo ist dieses Produkt günstiger, Migros oder Coop?» Richtig gibt einen Stern.</p>
          <p>Ein Versuch pro Tag, gespeichert auf diesem Gerät. Die Serie zählt Siege an aufeinanderfolgenden Tagen.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Beispiel({
  zeile,
  pfeil,
  farbe,
  children,
}: {
  zeile: string;
  pfeil: string;
  farbe: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className={cn("flex h-12 items-center justify-between px-4 text-lg font-bold text-white", farbe)}>
        <span className="tabular-nums">{zeile}</span>
        <span aria-hidden>{pfeil}</span>
      </div>
      <p>{children}</p>
    </div>
  );
}

function StatistikDialog({
  statistik,
  heute,
  markiert,
}: {
  statistik: Statistik;
  heute: string;
  markiert: number | null;
}) {
  const serie = heute ? sichtbareSerie(statistik, heute) : 0;
  const quote = statistik.gespielt === 0 ? 0 : Math.round((statistik.siege / statistik.gespielt) * 100);
  const maximum = Math.max(1, ...statistik.verteilung);

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" size="icon" className={ICON} aria-label="Statistik" />}>
        <ChartColumn />
      </DialogTrigger>
      <DialogContent className={MODAL}>
        <DialogHeader className="items-center pr-6">
          <DialogTitle className="text-center text-lg font-bold">Statistik</DialogTitle>
          <DialogDescription className="sr-only">Gespielte Runden auf diesem Gerät.</DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-4 gap-2 text-center">
          <Zahl label="Gespielt" wert={statistik.gespielt} />
          <Zahl label="Quote" wert={quote} />
          <Zahl label="Serie" wert={serie} />
          <Zahl label="Rekord" wert={statistik.besteSerie} />
        </dl>
        <div className="space-y-2">
          <p className="text-center text-sm font-bold">Verteilung</p>
          <ol className="space-y-1">
            {statistik.verteilung.map((anzahl, index) => {
              const nummer = index + 1;
              const breite = anzahl === 0 ? 8 : Math.max(12, Math.round((anzahl / maximum) * 100));
              const heuteGewonnen = markiert === nummer;
              return (
                <li key={nummer} className="flex items-center gap-2 text-sm font-bold">
                  <span className="w-3 tabular-nums">{nummer}</span>
                  <div className="flex h-8 flex-1">
                    <div
                      className={cn(
                        "flex h-full min-w-8 items-center justify-end px-2 text-white",
                        anzahl === 0 && !heuteGewonnen
                          ? "bg-[#787c7e] dark:bg-[#3a3a3c]"
                          : "bg-[#6aaa64] dark:bg-[#538d4e]",
                      )}
                      style={{ width: `${breite}%` }}
                    >
                      {anzahl}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Zahl({ label, wert }: { label: string; wert: number }) {
  return (
    <div>
      <dd className="text-3xl leading-none font-semibold tabular-nums">{wert}</dd>
      <dt className="mt-1 text-[0.65rem] tracking-wide text-[#787c7e] uppercase dark:text-[#818384]">
        {label}
      </dt>
    </div>
  );
}

function EinstellungenDialog() {
  const dunkel = useDunkel();
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" size="icon" className={ICON} aria-label="Einstellungen" />}>
        <Settings />
      </DialogTrigger>
      <DialogContent className={MODAL}>
        <DialogHeader className="items-center pr-6">
          <DialogTitle className="text-center text-lg font-bold">Einstellungen</DialogTitle>
          <DialogDescription className="sr-only">Darstellung des Spiels.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between gap-4 border-b border-[#d3d6da] py-3 dark:border-[#3a3a3c]">
          <span className="text-base font-bold">Dunkles Design</span>
          <button
            type="button"
            role="switch"
            aria-checked={dunkel}
            aria-label="Dunkles Design"
            onClick={() => setDunkel(!dunkel)}
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full transition-colors",
              dunkel ? "bg-[#6aaa64] dark:bg-[#538d4e]" : "bg-[#787c7e]",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-5 rounded-full bg-white transition-transform",
                dunkel ? "translate-x-[1.35rem]" : "translate-x-0.5",
              )}
            />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
