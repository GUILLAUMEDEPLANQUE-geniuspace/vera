import { useState } from "react";
import type { CareerNode } from "@/lib/offer";
import { cn } from "@/lib/utils";

export function CareerMap({ nodes }: { nodes: CareerNode[] }) {
  const current = nodes.find((n) => n.current) ?? nodes[0];
  const [active, setActive] = useState(current?.id ?? nodes[0]?.id);

  const node = nodes.find((n) => n.id === active) ?? current;
  if (!node) return null;

  return (
    <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Carte de carrière</p>
      <h2 className="mt-2 font-serif text-2xl sm:text-3xl">Où mène ce poste</h2>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Cliquez un nœud. Les années, le salaire, les compétences et les certifications — pas une promesse RH.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {nodes.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => setActive(n.id)}
            className={cn(
              "min-h-11 rounded-xl border px-4 py-3 text-left transition-colors",
              n.id === active
                ? "border-primary bg-primary text-primary-fg"
                : "border-border bg-bg text-ink hover:border-primary/40",
            )}
          >
            <span className="block text-[10px] tracking-wide uppercase opacity-70">{n.years}</span>
            <span className="mt-1 block font-serif text-lg leading-tight">{n.title}</span>
            <span className="mt-1 block text-xs tabular-nums opacity-80">{n.pay}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <h3 className="font-serif text-xl">{node.title}</h3>
        <p className="mt-1 text-sm text-muted">
          {node.years} · {node.pay}
          {node.current ? " · vous êtes ici" : ""}
        </p>
        {node.skills.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {node.skills.map((s) => (
              <li key={s} className="rounded-full bg-paper px-2.5 py-0.5 text-xs text-muted">
                {s}
              </li>
            ))}
          </ul>
        )}
        {node.certs.length > 0 && (
          <p className="mt-3 text-sm text-ink">
            <span className="text-muted">Certifications · </span>
            {node.certs.join(" · ")}
          </p>
        )}
      </div>
    </section>
  );
}
