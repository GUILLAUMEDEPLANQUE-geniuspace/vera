import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Term } from "@/components/term";
import { lessonOf, lessonsForMisses } from "@/lib/lessons";
import type { CareSim, CircuitSim, CodeSim, LockoutSim, MachineSim, SimChoice, SimOutcome, TaskSim } from "@/lib/offer";
import { missOfSim } from "@/lib/sims";
import { cn } from "@/lib/utils";

export function TaskSimPanel({
  sim,
  onResolved,
}: {
  sim: TaskSim;
  onResolved?: (out: SimOutcome) => void;
}) {
  const [out, setOut] = useState<SimOutcome | null>(null);
  function resolved(v: SimOutcome) {
    setOut(v);
    onResolved?.(v);
  }
  const lessons = out && !out.ok ? lessonsForMisses(out.misses) : [];
  return (
    <section id="epreuve" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
        <Term k="epreuve">Épreuve métier</Term>
      </p>
      <h2 className="mt-2 font-serif text-2xl sm:text-3xl">Montrez le geste, pas le CV</h2>
      <p className="mt-2 max-w-prose text-sm text-muted">{sim.brief}</p>
      <div className="mt-5">
        {sim.kind === "circuit" && <Circuit sim={sim} onResolved={resolved} />}
        {sim.kind === "care" && <Care sim={sim} onResolved={resolved} />}
        {sim.kind === "code" && <Code sim={sim} onResolved={resolved} />}
        {sim.kind === "machine" && <Machine sim={sim} onResolved={resolved} />}
        {sim.kind === "lockout" && <Lockout sim={sim} onResolved={resolved} />}
      </div>
      {out && (
        <aside className="mt-6 rounded-lg border border-border bg-paper p-4">
          <p className="text-xs tracking-wide text-muted uppercase">Score d’épreuve</p>
          <p className={cn("font-serif text-4xl tabular-nums", out.ok ? "text-good" : "text-bad")}>{out.score}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {out.ok
              ? "Geste tenu. Le score part avec la candidature — c’est ce que l’entreprise paie en PPQC."
              : "Pas un trou noir. Le score suit. Voici le diagnostic et le micro-apprentissage."}
          </p>
          {!out.ok && lessons.length > 0 && (
            <ul className="mt-3 space-y-2">
              {lessons.map((l) => (
                <li key={l.slug}>
                  <Link to="/apprendre/$slug" params={{ slug: l.slug }} className="text-sm font-medium text-primary">
                    {l.title}
                  </Link>
                  <span className="text-xs text-muted"> · {l.minutes} min</span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      )}
    </section>
  );
}

function Choices({
  choices,
  picked,
  onPick,
}: {
  choices: SimChoice[];
  picked: string | null;
  onPick: (id: string) => void;
}) {
  return (
    <ul className="space-y-2">
      {choices.map((c) => {
        const shown = picked != null;
        const mine = picked === c.id;
        return (
          <li key={c.id}>
            <button
              type="button"
              disabled={shown}
              onClick={() => onPick(c.id)}
              className={cn(
                "w-full rounded-lg border px-3 py-3 text-left text-sm leading-relaxed",
                !shown && "border-border hover:border-primary",
                shown && c.ok && "border-good bg-good/10 text-ink",
                shown && mine && !c.ok && "border-bad bg-bad/10 text-ink",
                shown && !mine && !c.ok && "border-border text-muted",
              )}
            >
              {c.text}
            </button>
            {shown && (c.ok || mine) && <p className="mt-1 px-1 text-xs text-muted">{c.why}</p>}
          </li>
        );
      })}
    </ul>
  );
}

function Circuit({ sim, onResolved }: { sim: CircuitSim; onResolved?: (o: SimOutcome) => void }) {
  const [probed, setProbed] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [isolated, setIsolated] = useState<string | null>(null);
  const ready = probed.length >= 2;
  const critical = probed.includes("n") || probed.includes("bornier");
  const diag = sim.choices.find((x) => x.id === picked);
  const right = Boolean(diag?.ok);

  function finish(isoId: string | null, diagOk: boolean) {
    const iso = (sim.isolate ?? []).find((x) => x.id === isoId);
    const isoOk = Boolean(iso?.ok);
    let score = 0;
    const misses: string[] = [];
    if (diagOk && critical && probed.length >= 2) score += 60;
    else if (diagOk && probed.length >= 2) score += 40;
    else if (diagOk) score += 25;
    else {
      score += probed.length >= 2 ? 15 : 8;
      misses.push("wrong-diag");
    }
    if (diagOk) {
      if ((sim.isolate ?? []).length === 0) score = Math.max(score, 100);
      else if (isoOk) score += 40;
      else if (isoId) {
        score += 5;
        misses.push("wrong-diag");
      }
    }
    score = Math.min(100, score);
    onResolved?.({
      ok: score >= 55,
      score,
      misses,
      lesson: misses.length ? "neutre-coupe" : null,
    });
  }

  function pickDiag(id: string) {
    setPicked(id);
    const c = sim.choices.find((x) => x.id === id);
    if (!c?.ok) finish(null, false);
    else if ((sim.isolate ?? []).length === 0) finish(null, true);
  }

  function pickIso(id: string) {
    setIsolated(id);
    finish(id, true);
  }

  return (
    <div>
      <p className="text-sm italic text-ink">{sim.symptom}</p>
      <p className="mt-3 text-xs tracking-wide text-muted uppercase">Sondez au moins deux points — le bornier compte</p>
      <div className="relative mt-3 h-56 overflow-hidden rounded-lg border border-border bg-paper">
        <div className="absolute inset-4 rounded-md border border-dashed border-primary/30" />
        {sim.probes.map((p) => {
          const on = probed.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              onClick={() => setProbed((xs) => (xs.includes(p.id) ? xs : [...xs, p.id]))}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-left text-xs leading-tight shadow-soft",
                on ? "bg-primary text-primary-fg" : "bg-surface text-ink ring-1 ring-border",
              )}
            >
              <span className="block font-medium">{p.label}</span>
              {on && <span className="block tabular-nums opacity-90">{p.reading}</span>}
            </button>
          );
        })}
      </div>
      {ready && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium">1 · Diagnostic</p>
          <Choices choices={sim.choices} picked={picked} onPick={pickDiag} />
        </div>
      )}
      {picked && right && (sim.isolate ?? []).length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium">2 · Isoler le point fautif</p>
          <Choices choices={sim.isolate ?? []} picked={isolated} onPick={pickIso} />
        </div>
      )}
    </div>
  );
}

function Care({ sim, onResolved }: { sim: CareSim; onResolved?: (o: SimOutcome) => void }) {
  const [beat, setBeat] = useState(0);
  const [picked, setPicked] = useState<(string | null)[]>(() => sim.beats.map(() => null));
  const current = sim.beats[beat];
  if (!current) return null;

  function pick(id: string) {
    const next = picked.slice();
    next[beat] = id;
    setPicked(next);
    const last = beat === sim.beats.length - 1;
    if (last) {
      const oks = next.map((pid, i) => Boolean(sim.beats[i]?.choices.find((c) => c.id === pid)?.ok));
      const nOk = oks.filter(Boolean).length;
      const score = Math.round((nOk / sim.beats.length) * 100);
      const misses = nOk < sim.beats.length ? ["overload"] : [];
      onResolved?.({
        ok: score >= 55,
        score,
        misses,
        lesson: misses.length ? "plafond-tournée" : null,
      });
    } else {
      window.setTimeout(() => setBeat((b) => b + 1), 450);
    }
  }

  return (
    <div>
      <p className="text-sm italic text-ink">{sim.setting}</p>
      <p className="mt-4 text-sm font-medium text-ink">
        {beat + 1}/{sim.beats.length} · {current.prompt}
      </p>
      <div className="mt-3">
        <Choices choices={current.choices} picked={picked[beat] ?? null} onPick={pick} />
      </div>
    </div>
  );
}

function Code({ sim, onResolved }: { sim: CodeSim; onResolved?: (o: SimOutcome) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div>
      <pre className="max-w-full overflow-x-auto rounded-lg bg-ink px-4 py-3 text-xs leading-relaxed text-primary-fg">
        <code>{sim.snippet}</code>
      </pre>
      <p className="mt-4 text-sm font-medium text-ink">{sim.prompt}</p>
      <div className="mt-3">
        <Choices
          choices={sim.choices}
          picked={picked}
          onPick={(id) => {
            setPicked(id);
            const ok = Boolean(sim.choices.find((c) => c.id === id)?.ok);
            onResolved?.({
              ok,
              score: ok ? 100 : 20,
              misses: ok ? [] : ["grid-low"],
              lesson: ok ? null : "grille-publique",
            });
          }}
        />
      </div>
    </div>
  );
}

function Machine({ sim, onResolved }: { sim: MachineSim; onResolved?: (o: SimOutcome) => void }) {
  const [queue, setQueue] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const remaining = sim.steps.filter((s) => !queue.includes(s.id));
  const ok = useMemo(
    () => queue.length === sim.order.length && queue.every((id, i) => id === sim.order[i]),
    [queue, sim.order],
  );

  function add(id: string) {
    if (done) return;
    const next = [...queue, id];
    setQueue(next);
    if (next.length === sim.steps.length) {
      setDone(true);
      const hits = next.filter((x, i) => x === sim.order[i]).length;
      const score = Math.round((hits / sim.order.length) * 100);
      const miss = missOfSim(sim, "order");
      onResolved?.({
        ok: score >= 55,
        score,
        misses: score >= 55 ? [] : [miss],
        lesson: score >= 55 ? null : lessonOf(miss === "skip-ppe" ? "harnais-avant-vitesse" : "mesure-avant-cle")?.slug ?? null,
      });
    }
  }

  return (
    <div>
      <p className="text-sm italic text-ink">{sim.symptom}</p>
      <p className="mt-3 text-xs tracking-wide text-muted uppercase">Ordonnez les gestes — chaque lecture compte</p>
      <ol className="mt-2 space-y-2">
        {queue.map((id, i) => {
          const step = sim.steps.find((s) => s.id === id);
          const right = sim.order[i] === id;
          return (
            <li
              key={id}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm",
                done ? (right ? "border-good bg-good/10" : "border-bad bg-bad/10") : "border-border",
              )}
            >
              <span className="mr-2 tabular-nums text-muted">{i + 1}.</span>
              {step?.text}
              {step?.reading && (
                <p className="mt-1 text-xs tabular-nums text-muted">{step.reading}</p>
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex flex-col gap-2">
        {remaining.map((s) => (
          <Button
            key={s.id}
            type="button"
            variant="secondary"
            size="sm"
            className="h-auto min-h-11 w-full whitespace-normal py-2 text-left"
            onClick={() => add(s.id)}
          >
            {s.text}
          </Button>
        ))}
      </div>
      {done && <p className={cn("mt-4 text-sm", ok ? "text-good" : "text-bad")}>{sim.explain}</p>}
    </div>
  );
}

function Lockout({ sim, onResolved }: { sim: LockoutSim; onResolved?: (o: SimOutcome) => void }) {
  const [queue, setQueue] = useState<string[]>([]);
  const [killed, setKilled] = useState(false);
  const [done, setDone] = useState(false);
  const remaining = sim.points.filter((p) => p.kind !== "trap" && !queue.includes(p.id));

  function add(id: string) {
    if (done || killed) return;
    const point = sim.points.find((p) => p.id === id);
    if (point?.kind === "trap") {
      setKilled(true);
      onResolved?.({
        ok: false,
        score: 0,
        misses: ["lock-order"],
        lesson: "consignation-cadenas",
      });
      return;
    }
    const expected = sim.order[queue.length];
    if (id !== expected && (id === "try" || id === "zero") && !queue.includes("lock")) {
      setKilled(true);
      onResolved?.({
        ok: false,
        score: 0,
        misses: ["lock-order"],
        lesson: "consignation-cadenas",
      });
      return;
    }
    const next = [...queue, id];
    setQueue(next);
    if (next.length === sim.order.length) {
      setDone(true);
      const hits = next.filter((x, i) => x === sim.order[i]).length;
      const score = Math.round((hits / sim.order.length) * 100);
      const missPpe = next[0] !== "ppe";
      onResolved?.({
        ok: score >= 80,
        score,
        misses: score >= 80 ? [] : missPpe ? ["skip-ppe", "lock-order"] : ["lock-order"],
        lesson: score >= 80 ? null : missPpe ? "harnais-avant-vitesse" : "consignation-cadenas",
      });
    }
  }

  return (
    <div>
      <p className="text-sm italic text-ink">{sim.symptom}</p>
      <p className="mt-2 text-xs text-muted">{sim.danger}</p>
      <dl className="mt-4 grid grid-cols-2 gap-2">
        {(sim.energies ?? []).map((e) => {
          const dead = queue.includes(e.clearedBy);
          return (
            <div key={e.id} className={cn("rounded-lg border px-3 py-2", dead ? "border-good bg-good/10" : "border-bad/40 bg-paper")}>
              <dt className="text-xs tracking-wide text-muted uppercase">{e.label}</dt>
              <dd className={cn("mt-0.5 font-serif text-xl", dead ? "text-good" : "text-bad")}>{dead ? e.dead : e.live}</dd>
            </div>
          );
        })}
      </dl>
      <p className="mt-3 text-xs tracking-wide text-muted uppercase">Ordre LOTO — cadenas perso, pas celui de l’atelier</p>
      <ol className="mt-3 grid gap-2 sm:grid-cols-2">
        {sim.points.map((p) => {
          const i = queue.indexOf(p.id);
          const on = i >= 0;
          const right = on && sim.order[i] === p.id;
          const trapHit = killed && p.kind === "trap";
          return (
            <li key={p.id}>
              <button
                type="button"
                disabled={on || done || killed}
                onClick={() => add(p.id)}
                className={cn(
                  "flex min-h-14 w-full flex-col items-start rounded-lg border px-3 py-2 text-left text-sm",
                  !on && !killed && "border-border hover:border-primary",
                  on && right && "border-good bg-good/10",
                  on && !right && "border-bad bg-bad/10",
                  trapHit && "border-bad bg-bad/10",
                  killed && !on && !trapHit && "border-border text-muted",
                )}
              >
                <span className="font-medium">{p.label}</span>
                <span className="text-xs text-muted">{p.hint}</span>
                {on && <span className="mt-1 text-xs tabular-nums text-subtle">étape {i + 1}</span>}
              </button>
            </li>
          );
        })}
      </ol>
      {killed && <p className="mt-4 text-sm text-bad">Cadenas partagé ou essai avant cadenas. L’épreuve s’arrête. Relisez la leçon consignation.</p>}
      {done && remaining.length === 0 && (
        <p className="mt-4 text-sm text-good">Séquence complète. Le score reflète chaque étape à sa place.</p>
      )}
    </div>
  );
}
