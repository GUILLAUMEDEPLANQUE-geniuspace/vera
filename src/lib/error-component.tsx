import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="text-bad" aria-hidden="true">
        <TriangleAlert className="size-8" strokeWidth={1.75} />
      </span>
      <h1 className="font-serif text-2xl">Quelque chose s’est mal passé</h1>
      <p className="max-w-md text-sm break-words text-muted">
        {error.message || "Erreur inattendue. Rechargez la page."}
      </p>
    </main>
  );
}
