import { markOf } from "@/lib/marks";
import { cn } from "@/lib/utils";

export function CompanyMark({
  name,
  slug,
  className,
}: {
  name: string;
  slug?: string;
  className?: string;
}) {
  const m = markOf(slug || name);
  return (
    <span
      aria-hidden
      className={cn(
        "relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl font-serif text-sm tracking-tight",
        className,
      )}
      style={{ background: m.tone.bg, color: m.tone.fg }}
    >
      <Glyph n={m.glyph} accent={m.tone.accent} />
      <span className="relative z-[1]">{m.initials}</span>
    </span>
  );
}

function Glyph({ n, accent }: { n: number; accent: string }) {
  if (n === 0) {
    return (
      <span
        className="absolute inset-1 rounded-full opacity-40"
        style={{ boxShadow: `inset 0 0 0 2px ${accent}` }}
      />
    );
  }
  if (n === 1) {
    return (
      <span
        className="absolute -right-2 -bottom-3 size-10 rotate-12 rounded-sm opacity-35"
        style={{ background: accent }}
      />
    );
  }
  if (n === 2) {
    return (
      <span
        className="absolute inset-y-0 right-0 w-1/3 opacity-30"
        style={{ background: accent }}
      />
    );
  }
  if (n === 3) {
    return (
      <span
        className="absolute top-1/2 left-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-sm opacity-25"
        style={{ background: accent }}
      />
    );
  }
  if (n === 4) {
    return (
      <span
        className="absolute top-0 left-0 h-full w-1/2 opacity-25"
        style={{ background: accent, clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
      />
    );
  }
  return (
    <span
      className="absolute inset-2 rounded-full opacity-30"
      style={{ background: accent }}
    />
  );
}
