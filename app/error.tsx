"use client";

import { Button } from "@/components/ui/button";

export default function Fehler({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-4 px-5">
      <h1 className="text-2xl font-semibold tracking-tight">Chörblidle lässt sich nicht laden</h1>
      <p className="text-sm leading-6 text-muted-foreground">
        Die Produktdaten sind ungültig oder etwas ist schiefgelaufen.
      </p>
      <Button type="button" onClick={() => reset()} className="h-11 w-fit px-4">
        Nochmal versuchen
      </Button>
    </main>
  );
}
