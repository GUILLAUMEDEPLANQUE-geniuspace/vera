import { useRef, useState } from "react";
import type { Workplace } from "@/lib/offer";
import { cn } from "@/lib/utils";

export function WorkplaceTour({ workplace }: { workplace: Workplace }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(workplace.hotspots[0]?.id);
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ x: 0, sl: 0 });
  const spot = workplace.hotspots.find((h) => h.id === active) ?? workplace.hotspots[0];

  function onDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = scroller.current;
    if (!el) return;
    setDragging(true);
    drag.current = { x: e.clientX, sl: el.scrollLeft };
    el.setPointerCapture(e.pointerId);
  }
  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const el = scroller.current;
    if (!el) return;
    el.scrollLeft = drag.current.sl - (e.clientX - drag.current.x);
  }
  function onUp() {
    setDragging(false);
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Visite du poste</p>
      <h2 className="mt-2 font-serif text-2xl sm:text-3xl">{workplace.title}</h2>
      <p className="mt-2 max-w-prose text-sm text-muted">{workplace.caption} Glissez pour regarder. Touchez un point.</p>

      <div
        ref={scroller}
        className={cn(
          "mt-5 max-w-full overflow-x-auto rounded-lg border border-border",
          dragging ? "cursor-grabbing" : "cursor-grab",
        )}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div className="relative w-[46rem] max-w-none select-none">
          <img
            src={workplace.image}
            alt={workplace.title}
            className="block h-72 w-full object-cover sm:h-96"
            draggable={false}
          />
          {workplace.hotspots.map((h, i) => (
            <button
              key={h.id}
              type="button"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setActive(h.id)}
              className={cn(
                "absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-xs font-medium shadow-soft",
                h.id === active
                  ? "bg-primary text-primary-fg"
                  : "bg-surface/90 text-ink ring-1 ring-border",
              )}
              aria-label={h.title}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {spot && (
        <div className="mt-4 rounded-lg bg-paper px-4 py-3">
          <p className="text-sm font-medium text-ink">{spot.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{spot.body}</p>
        </div>
      )}
    </section>
  );
}
