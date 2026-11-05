/** Kalendertag, an dem Chörblidle #1 beginnt (Europe/Zurich). */
export const START_DATUM = "2026-11-04";

/** Fester Seed für die Produktreihenfolge. Nicht ändern, sonst verschiebt sich der Kalender. */
export const SHUFFLE_SEED = 20261104;

/** Erster Tipp plus höchstens drei weitere. */
export const MAX_TIPPS = 4;

/**
 * true, solange data/products.json nur erfundene Beispielpreise enthält.
 * Die eingetragenen Otto's-Preise sind eine echte Erhebung.
 */
export const BEISPIELPREISE = false;

export const STORAGE_KEY = "choerblidle-v1";

export const PLATZHALTER_BILD = "/products/placeholder.svg";
