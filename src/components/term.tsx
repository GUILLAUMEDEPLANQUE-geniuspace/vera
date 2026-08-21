import { useEffect, useId, useRef, useState } from "react";
import { GLOSSARY, termOf, type GlossaryTerm } from "@/lib/glossary";
import { cn } from "@/lib/utils";

export function Term({
  k,
  children,
  className,
}: {
  k: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const t = termOf(k);
  const label = children ?? t?.label ?? k;
  if (!t) return <span className={className}>{label}</span>;
  return (
    <span className={cn("inline", className)}>
      {label}
      <TermBang term={t} />
    </span>
  );
}

export function TermBang({ term }: { term: GlossaryTerm }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={wrap} className="relative inline-block">
      <button
        type="button"
        className="term-bang"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Définition : ${term.label}`}
        onClick={() => setOpen((v) => !v)}
      >
        !
      </button>
      {open && (
        <span
          id={id}
          role="dialog"
          aria-label={term.label}
          className="absolute top-[1.4rem] left-1/2 z-40 w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-border bg-surface p-4 text-left shadow-soft"
        >
          <span className="block text-xs tracking-wide text-primary uppercase">{term.label}</span>
          <span className="mt-1 block text-sm leading-relaxed text-ink">{term.definition}</span>
          <span className="mt-3 grid gap-3 sm:grid-cols-2">
            <span className="block">
              <span className="block text-[10px] tracking-wide text-muted uppercase">Candidat</span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">{term.candidate}</span>
            </span>
            <span className="block">
              <span className="block text-[10px] tracking-wide text-muted uppercase">Entreprise</span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">{term.house}</span>
            </span>
          </span>
        </span>
      )}
    </span>
  );
}

export function TermLegend({ keys }: { keys?: string[] }) {
  const items = keys ? GLOSSARY.filter((t) => keys.includes(t.key)) : GLOSSARY.slice(0, 8);
  return (
    <p className="text-xs text-subtle">
      Le{" "}
      <span className="term-bang mx-0.5 inline-grid align-middle" aria-hidden>
        !
      </span>{" "}
      explique le mot — usage candidat et entreprise.{" "}
      {items.map((t) => t.label).join(" · ")}
      {" · "}
      <a href="/lexique" className="text-primary">
        Lexique
      </a>
    </p>
  );
}
