import roh from "@/data/products.json";
import type { Produkt } from "@/lib/typen";

function gueltigerBetrag(wert: unknown): wert is number {
  return (
    typeof wert === "number" &&
    Number.isFinite(wert) &&
    wert > 0 &&
    wert <= 999.99 &&
    Math.abs(wert * 100 - Math.round(wert * 100)) < 1e-6
  );
}

function istProdukt(wert: unknown): wert is Produkt {
  if (!wert || typeof wert !== "object") return false;
  const produkt = wert as Produkt;
  return (
    typeof produkt.id === "string" &&
    /^[a-z0-9-]+$/.test(produkt.id) &&
    typeof produkt.name === "string" &&
    produkt.name.trim().length > 0 &&
    typeof produkt.menge === "string" &&
    produkt.menge.trim().length > 0 &&
    gueltigerBetrag(produkt.preis) &&
    (produkt.preisCoop === undefined || gueltigerBetrag(produkt.preisCoop)) &&
    (produkt.laden === "migros" || produkt.laden === "coop") &&
    typeof produkt.bild === "string" &&
    produkt.bild.startsWith("/products/") &&
    typeof produkt.stichdatum === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(produkt.stichdatum)
  );
}

function laden(): Produkt[] {
  if (!Array.isArray(roh) || roh.length === 0) {
    throw new Error("data/products.json muss eine nicht leere Liste sein.");
  }
  if (!roh.every(istProdukt)) {
    throw new Error("data/products.json enthält einen ungültigen Eintrag.");
  }
  const ids = new Set<string>();
  for (const produkt of roh) {
    if (ids.has(produkt.id)) {
      throw new Error(`Doppelte Produkt-Id «${produkt.id}».`);
    }
    ids.add(produkt.id);
  }
  return roh;
}

export const produkte: Produkt[] = laden();
