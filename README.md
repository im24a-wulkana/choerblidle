# Chörblidle

Tägliches Preisrätsel im Browser. Alle sehen am selben Tag dasselbe Produkt und tippen den Preis in Franken. Kein Konto, kein Backend. Der Stand liegt in `localStorage`.

Die Preise in [`data/products.json`](data/products.json) sind die am **5. November 2026** öffentlich angezeigten Online-Preise von Otto's (`api.ottos.ch`, Sortiment Supermarkt, Haushalt, Getränke, Wein, Bier, Spirituosen und Tiernahrung). Migros und Coop haben von dieser Umgebung aus keine Preise geliefert. Die Bilder sind eigene Zeichnungen, keine Produktfotos der Händler.

## Lokal starten

```bash
npm install
npm run dev
```

Die App läuft danach auf [http://localhost:3000](http://localhost:3000).

Oben links die Regeln, oben rechts Statistik und das Zahnrad für das dunkle Design. Ohne gespeicherte Wahl folgt die Seite der Systemeinstellung.

Produktionsbuild:

```bash
npm run build
npm start
```

## Auf Vercel deployen

Das Projekt ist eine normale Next.js-App (App Router). Es braucht keine Umgebungsvariablen und keinen Server mit Datenbank.

1. Repository bei GitHub oder GitLab bereitstellen.
2. Auf [vercel.com](https://vercel.com) ein neues Projekt anlegen und das Repository importieren.
3. Framework Preset **Next.js** lassen. Build-Befehl `npm run build`, Output bleibt leer (Next.js-Standard).
4. Deployen.

`main` als Produktionsbranch reicht. Jeder Push baut die Seite neu. Neue Produkte sind erst nach dem nächsten Deploy sichtbar, weil die Daten ins Frontend gebündelt werden.

Der Preis steht in diesem Bundle. Wer die Dateien durchsucht, sieht ihn. Das gehört zu einem Spiel ohne Backend.

## Neues Produkt eintragen

Produkte stehen in [`data/products.json`](data/products.json). Ein Eintrag sieht so aus:

```json
{
  "id": "rivella-rot",
  "name": "Rivella Rot",
  "menge": "1.5 l",
  "preis": 2.4,
  "preisCoop": 2.55,
  "laden": "migros",
  "bild": "/products/rivella-rot.svg",
  "stichdatum": "2026-10-02"
}
```

| Feld | Bedeutung |
| --- | --- |
| `id` | Kleinbuchstaben, Ziffern, Bindestrich. Einmalig. |
| `name` | Anzeigename. |
| `menge` | Packungsgrösse, z. B. `400 g` oder `6 × 1.5 l`. |
| `preis` | Preis in CHF im Laden `laden`. Das ist der gesuchte Preis. Punkt als Dezimalzeichen, höchstens zwei Stellen. |
| `preisCoop` | Optional. Preis bei Coop. Nur setzen, wenn `laden` `migros` ist. Dann erscheint die Bonusfrage. |
| `laden` | `migros`, `coop` oder `ottos`. |
| `bild` | Pfad ab `public`, z. B. `/products/rivella-rot.svg`. |
| `stichdatum` | Tag der Preiserhebung, `YYYY-MM-DD`. |

Bilddatei nach `public/products/` legen (SVG, PNG oder JPG). Fehlt die Datei oder ist der Pfad falsch, zeigt das Spiel [`public/products/placeholder.svg`](public/products/placeholder.svg).

Neue Produkte **hinten anhängen**. Reihenfolge und Anzahl bestimmen, welches Produkt auf welchen Tag fällt. Ein Umsortieren verschiebt den Kalender.

Die Bonusfrage «Wo ist dieses Produkt günstiger, Migros oder Coop?» gibt es, wenn `laden` `migros` ist und `preisCoop` gesetzt ist. `preis` ist dann der Migros-Preis, `preisCoop` der Coop-Preis. Bei Coop-Produkten das Feld weglassen: der gesuchte Preis ist dort schon der Coop-Preis, ein Migros-Vergleich ist im Format nicht vorgesehen.

Solange in [`lib/config.ts`](lib/config.ts) `BEISPIELPREISE` auf `true` steht, weist die Oberfläche darauf hin, dass die Zahlen Beispiele sind. Mit den Otto's-Preisen steht das Feld auf `false`.

## Tagesrätsel

- Zeitzone: `Europe/Zurich`. Der Tag wechselt um Mitternacht Schweizer Zeit.
- Start: 4. November 2026. Spielnummer `#N` ist die Anzahl Tage seit diesem Datum plus 1.
- Die Produkte werden einmal mit dem festen Seed `20261104` gemischt. Tag `t` zeigt `gemischt[t % anzahl]`.
- Der erste Tipp zählt für die Wertung: bis 2 % Abweichung grün, bis 10 % gelb, sonst weiss. Abweichung = |Tipp − Preis| / Preis.
- Danach höchstens drei weitere Tipps. ⬆️ heisst, der Preis liegt höher, ⬇️ heisst tiefer. Ein Treffer ist höchstens 2 % daneben.
- Danach siehst du Preis und Stichdatum. Die richtige Bonusantwort gibt einen Stern.
- Pro Tag ein Versuch. Nach dem Neuladen ist der Stand noch da. Die Serie zählt Siege an aufeinanderfolgenden Tagen.

Teilen kopiert eine Zeile wie `Chörblidle #12 🟨 → 🟩 in 3 ⭐` und den Link der Seite.
