import { BookOpen, Building2, GraduationCap, PenLine, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type OfferTabId = "lire" | "epreuve" | "maison" | "former" | "agir";

export const OFFER_TABS: {
  id: OfferTabId;
  label: string;
  hint: string;
  icon: typeof BookOpen;
}[] = [
  { id: "lire", label: "Lire", hint: "Poste, salaire, honnêteté", icon: BookOpen },
  { id: "epreuve", label: "Épreuve", hint: "Simulation et grille", icon: Zap },
  { id: "maison", label: "Maison", hint: "Culture, semaine, outils", icon: Building2 },
  { id: "former", label: "Former", hint: "Savoirs, Drive, freins", icon: GraduationCap },
  { id: "agir", label: "Agir", hint: "Postuler et pacte", icon: PenLine },
];

export function OfferOrb({
  active,
  onChange,
  mark,
}: {
  active: OfferTabId;
  onChange: (id: OfferTabId) => void;
  mark: ReactNode;
}) {
  const n = OFFER_TABS.length;
  return (
    <div className="offer-orb mx-auto hidden w-fit lg:block">
      <div className="offer-orb-sphere">
        <span className="offer-orb-meridian" style={{ transform: "rotateY(18deg)" }} />
        <span className="offer-orb-meridian" style={{ transform: "rotateY(-28deg) rotateX(12deg)" }} />
        <span className="offer-orb-meridian" style={{ transform: "rotateX(72deg)" }} />
        <div className="absolute inset-0 grid place-items-center">{mark}</div>
        {OFFER_TABS.map((t, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          const x = 50 + Math.cos(a) * 46;
          const y = 50 + Math.sin(a) * 38;
          const Icon = t.icon;
          const on = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={on}
              aria-label={t.label}
              title={`${t.label} — ${t.hint}`}
              onClick={() => onChange(t.id)}
              className={cn(
                "absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-xs transition-[transform,background,color] duration-200",
                on
                  ? "z-10 scale-110 border-primary bg-primary text-primary-fg"
                  : "border-border bg-surface text-ink hover:border-primary",
              )}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <Icon className="size-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function OfferToolbar({
  active,
  onChange,
}: {
  active: OfferTabId;
  onChange: (id: OfferTabId) => void;
}) {
  return (
    <nav
      aria-label="Sections de l’offre"
      className="sticky bottom-3 z-20 mx-auto mt-6 flex max-w-xl gap-1 rounded-full border border-border bg-surface/95 p-1 shadow-soft backdrop-blur-sm lg:bottom-auto lg:top-20"
    >
      {OFFER_TABS.map((t) => {
        const Icon = t.icon;
        const on = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 text-[10px] tracking-wide uppercase transition-colors",
              on ? "bg-primary text-primary-fg" : "text-muted hover:text-ink",
            )}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function OfferPanel({ children, tab }: { children: ReactNode; tab: string }) {
  return (
    <div className="offer-panel mt-8 space-y-10" key={tab}>
      {children}
    </div>
  );
}
