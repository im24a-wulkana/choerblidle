const ZEITZONE = "Europe/Zurich";

/** Kalendertag YYYY-MM-DD in Europe/Zurich. */
export function zurichDatum(jetzt: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZEITZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(jetzt);
}

/** Differenz der Kalendertage bis minus von. Unabhängig von Sommerzeit. */
export function tageZwischen(von: string, bis: string): number {
  const [y1, m1, d1] = von.split("-").map(Number);
  const [y2, m2, d2] = bis.split("-").map(Number);
  const start = Date.UTC(y1, m1 - 1, d1);
  const ende = Date.UTC(y2, m2 - 1, d2);
  return Math.round((ende - start) / 86_400_000);
}

export function gestern(datum: string): string {
  const [y, m, d] = datum.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  utc.setUTCDate(utc.getUTCDate() - 1);
  const jahr = utc.getUTCFullYear();
  const monat = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const tag = String(utc.getUTCDate()).padStart(2, "0");
  return `${jahr}-${monat}-${tag}`;
}

export function formatStichdatum(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("de-CH", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

function zurichUhr(jetzt: Date): { stunde: number; minute: number; sekunde: number } {
  const teile = new Intl.DateTimeFormat("en-GB", {
    timeZone: ZEITZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(jetzt);
  const zahl = (typ: string) => Number(teile.find((teil) => teil.type === typ)?.value ?? "0");
  let stunde = zahl("hour");
  if (stunde === 24) stunde = 0;
  return { stunde, minute: zahl("minute"), sekunde: zahl("second") };
}

/** Millisekunden bis zur nächsten Mitternacht in Europe/Zurich. */
export function msBisMitternacht(jetzt: Date = new Date()): number {
  const { stunde, minute, sekunde } = zurichUhr(jetzt);
  const vergangen = (stunde * 3600 + minute * 60 + sekunde) * 1000 + jetzt.getMilliseconds();
  const rest = 24 * 3600 * 1000 - vergangen;
  return rest <= 0 ? 0 : rest;
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const stunden = Math.floor(total / 3600);
  const minuten = Math.floor((total % 3600) / 60);
  const sekunden = total % 60;
  return [stunden, minuten, sekunden].map((wert) => String(wert).padStart(2, "0")).join(":");
}
