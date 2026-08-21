import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Hand } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ApplyTrial } from "@/components/offer/offer-body";
import { CareerMap } from "@/components/offer/career-map";
import { HonestyBlock } from "@/components/offer/honesty";
import { SalaryBand } from "@/components/offer/salary-band";
import { TaskSimPanel } from "@/components/offer/task-sim";
import { ToolsRack } from "@/components/offer/tools-rack";
import { Voices } from "@/components/offer/voices";
import { WeekRing } from "@/components/offer/week-ring";
import { WorkplaceTour } from "@/components/offer/workplace-tour";
import { OfferOrb, OfferPanel, OfferToolbar, type OfferTabId } from "@/components/offer/offer-orb";
import { CultureRadar } from "@/components/culture-radar";
import { CultureSim } from "@/components/culture-sim";
import { DriveCard } from "@/components/drive-reader";
import { EvalGridPanel } from "@/components/eval-grid";
import { ScarcityBadge } from "@/components/scarcity-badge";
import { SeoFaq } from "@/components/seo-faq";
import { SkillPath } from "@/components/skill-path";
import { Term } from "@/components/term";
import { cultureOf } from "@/lib/culture";
import { BARRIERS, barrierFit } from "@/lib/barriers";
import { gridByFamily, gridFor, mergeCustom, type GridAnswers } from "@/lib/fields";
import { BRAND_HOST } from "@/lib/origin";
import { PILLARS } from "@/lib/pillars";
import { scarcityOf } from "@/lib/scarcity";
import { jobDescriptionTag, jobFaqs, jobJsonLd, jobLongform, jobTitleTag, ldScript } from "@/lib/seo";
import { CompanyMark } from "@/components/company-mark";
import { CckChips } from "@/components/company/cck-chips";
import { GhostMeter } from "@/components/ghost-meter";
import { MatchRing } from "@/components/match-ring";
import { PactBadge } from "@/components/pact-badge";
import { ProcessTimeline } from "@/components/process-timeline";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VerdictCard } from "@/components/verdict-card";
import { InterviewPrep } from "@/components/interview-prep";
import { explainMatch, writeCoverLetter } from "@/lib/ai-fn";
import { listDriveAssets } from "@/lib/drive-fn";
import { preformForJob } from "@/lib/hub-fn";
import { cityOfSlug, citySlug, metierForJob } from "@/lib/sem";
import { placeOfCity } from "@/lib/geo";
import { ppqcPrice } from "@/lib/ppqc";
import { vivierByPool } from "@/lib/viviers";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { toggleQuietSignal } from "@/lib/brief-fn";
import { formatPosted, formatSalary } from "@/lib/format";
import { getJob } from "@/lib/jobs-fn";
import { listCckValues } from "@/lib/cck-fn";
import { applyToJob, getMyProfile, toggleSaveJob } from "@/lib/profile-fn";
import { CONTRACT_LABEL, REMOTE_LABEL, SENIORITY_LABEL } from "@/lib/types";
import { computeVerdict } from "@/lib/verdict";
import { WEEKDAYS } from "@/lib/weekdays";

export const Route = createFileRoute("/jobs/$slug")({
  loader: async ({ params }) => {
    const job = await getJob({ data: params.slug });
    if (!job) return { job: null, preform: null, drive: [], cck: [] };
    const [preform, drive, cck] = await Promise.all([
      preformForJob({ data: { skills: job.skills, have: [] } }),
      listDriveAssets({ data: { entityType: "job", entityKey: job.slug } }),
      listCckValues({ data: { kind: "job", id: job.id } }),
    ]);
    return { job, preform, drive, cck };
  },
  head: ({ loaderData }) => {
    const job = loaderData?.job;
    if (!job) return { meta: [{ title: "Offre | Vera" }] };
    const scarcity = scarcityOf(job);
    const faqs = jobFaqs(job, scarcity);
    const origin = BRAND_HOST;
    return {
      meta: [
        { title: jobTitleTag(job) },
        { name: "description", content: jobDescriptionTag(job).slice(0, 170) },
        { name: "robots", content: "index,follow,max-image-preview:large" },
        { property: "og:title", content: jobTitleTag(job) },
        { property: "og:description", content: jobDescriptionTag(job).slice(0, 170) },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `${origin}/jobs/${job.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "canonical", href: `${origin}/jobs/${job.slug}` },
        { rel: "alternate", type: "text/markdown", href: `${origin}/feed/${job.slug}.md` },
        { rel: "alternate", type: "application/ld+json", href: `${origin}/jobs/${job.slug}` },
      ],
      scripts: jobJsonLd(job, origin, faqs).map(ldScript),
    };
  },
  component: JobPage,
});

function JobPage() {
  const { slug } = Route.useParams();
  const qc = useQueryClient();
  const { user, isPending: authPending } = useCurrentUserState();
  const packed = Route.useLoaderData();
  const initial = packed?.job ?? null;
  const jobQ = useQuery({
    queryKey: ["job", slug],
    queryFn: () => getJob({ data: slug }),
    initialData: initial ?? undefined,
  });
  const job = jobQ.data ?? initial;
  const profileQ = useQuery({
    queryKey: ["profile"],
    queryFn: () => getMyProfile(),
    enabled: Boolean(user),
  });
  const preformQ = useQuery({
    queryKey: ["preform", job?.slug, profileQ.data?.skills],
    queryFn: () => preformForJob({ data: { skills: job!.skills, have: profileQ.data?.skills ?? [] } }),
    enabled: Boolean(job),
    initialData: packed?.preform ?? undefined,
  });
  const driveQ = useQuery({
    queryKey: ["drive-job", job?.slug],
    queryFn: () => listDriveAssets({ data: { entityType: "job", entityKey: job!.slug } }),
    enabled: Boolean(job),
    initialData: packed?.drive ?? [],
  });
  const [letter, setLetter] = useState("");
  const [explain, setExplain] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [simOk, setSimOk] = useState<boolean | null>(null);
  const [simScore, setSimScore] = useState<number | null>(null);
  const [simMisses, setSimMisses] = useState<string[]>([]);
  const [gridScore, setGridScore] = useState<number | null>(null);
  const [gridAnswers, setGridAnswers] = useState<GridAnswers>({});
  const [tab, setTab] = useState<OfferTabId>("lire");
  useEffect(() => setAuthReady(true), []);
  const showLoginNudge = authReady && !authPending && !user;

  const saveM = useMutation({
    mutationFn: () => toggleSaveJob({ data: job!.id }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["job", slug] });
      toast.success(job?.saved ? "Retiré des sauvés" : "Offre sauvée");
    },
    onError: () => toast.error("Connectez-vous pour sauver une offre"),
  });

  const applyM = useMutation({
    mutationFn: () =>
      applyToJob({
        data: {
          jobId: job!.id,
          coverLetter: letter,
          trialScore: simScore ?? undefined,
          fitScore: gridScore ?? undefined,
          grid: gridAnswers,
          misses: simMisses,
        },
      }),
    onSuccess: async (res) => {
      await qc.invalidateQueries({ queryKey: ["job", slug] });
      toast.success(
        res.briefAttached
          ? `Candidature envoyée — brief joint, pacte ${res.slaDays} jours`
          : `Candidature envoyée — pacte ${res.slaDays} jours. Complétez votre brief.`,
      );
      if ((simScore ?? 0) < 55) {
        toast.warning("Épreuve sous le seuil PPQC. Le diagnostic est dans Apprendre — pas un silence.");
      }
    },
    onError: () => toast.error("Connexion requise pour postuler"),
  });

  const quietM = useMutation({
    mutationFn: () => toggleQuietSignal({ data: job!.id }),
    onSuccess: async (res) => {
      await qc.invalidateQueries({ queryKey: ["job", slug] });
      toast.success(res.raised ? "Main levée — votre nom reste privé" : "Signal retiré");
    },
    onError: () => toast.error("Connectez-vous pour lever la main"),
  });

  const letterM = useMutation({
    mutationFn: () => writeCoverLetter({ data: { jobId: job!.id } }),
    onSuccess: (res) => {
      if (res.ok) setLetter(res.text);
      else toast.error(res.error);
    },
  });

  const explainM = useMutation({
    mutationFn: () => explainMatch({ data: { jobId: job!.id, match: job?.match ?? null } }),
    onSuccess: (res) => {
      if (res.ok) setExplain(res.text);
      else toast.error(res.error);
    },
  });

  if (!job && jobQ.isPending) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="h-96 animate-pulse rounded-xl bg-paper" />
      </div>
    );
  }
  if (!job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-serif text-4xl">Offre introuvable</h1>
        <Link to="/jobs" className="mt-4 inline-block text-primary">
          Retour aux offres
        </Link>
      </div>
    );
  }

  const verdict = computeVerdict({
    ghostRisk: job.ghostRisk,
    hiringVelocity: job.company.hiringVelocity,
    honorScore: job.companyFull.honorScore,
    honorDue: job.companyFull.honorDue,
    slaDays: job.companyFull.responseSlaDays,
    hours: job.processHours,
    match: job.match,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    marketMedian: job.marketMedian,
    profile: null,
  });
  const culture = cultureOf(job.company.slug);
  const grid = mergeCustom(job.gridFamily ? gridByFamily(job.gridFamily) : gridFor(job), job.customFields);
  const scarcity = scarcityOf(job);
  const faqs = jobFaqs(job, scarcity);
  const longform = jobLongform(job, culture, grid);
  const relatedGuides = PILLARS.filter((p) => p.relatedJobs.includes(job.slug) || p.relatedCompanies.includes(job.company.slug));
  const cityHub = cityOfSlug(citySlug(job.city));
  const metierHub = metierForJob(job.title, job.skills, job.collection);
  const place = placeOfCity(job.city);
  const vivier = vivierByPool(job.pool);
  const ppqc = ppqcPrice(job);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 pb-28 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:pb-10">
      <article className="min-w-0">
        <nav className="text-xs text-muted">
          <Link to="/" className="hover:text-ink">
            Vera
          </Link>
          {" · "}
          <Link to="/jobs" className="hover:text-ink">
            Emplois
          </Link>
          {cityHub && (
            <>
              {" · "}
              <Link to="/lieux/$city" params={{ city: cityHub.slug }} className="hover:text-ink">
                {cityHub.name}
              </Link>
            </>
          )}
          {place && !cityHub && (
            <>
              {" · "}
              <Link to="/lieux/$city" params={{ city: place.city.slug }} className="hover:text-ink">
                {place.city.name}
              </Link>
            </>
          )}
          {place && (
            <>
              {" · "}
              <Link to="/lieux/departements/$slug" params={{ slug: place.dept.slug }} className="hover:text-ink">
                {place.dept.name}
              </Link>
            </>
          )}
          {vivier && (
            <>
              {" · "}
              <Link to="/viviers/$slug" params={{ slug: vivier.slug }} className="hover:text-ink">
                {vivier.name}
              </Link>
            </>
          )}
          {metierHub && (
            <>
              {" · "}
              <Link to="/metiers/$slug" params={{ slug: metierHub.slug }} className="hover:text-ink">
                {metierHub.name}
              </Link>
            </>
          )}
          {" · "}
          <Link to="/companies/$slug" params={{ slug: job.company.slug }} className="hover:text-ink">
            {job.company.name}
          </Link>
        </nav>
        <div className="mt-4 flex items-start gap-4">
          <CompanyMark name={job.company.name} slug={job.company.slug} className="size-14 text-lg" />
          <div className="min-w-0">
            <p className="text-xs tracking-wide text-muted uppercase">{job.company.industry}</p>
            <h1 className="font-serif text-4xl sm:text-5xl">{job.title}</h1>
            <p className="mt-2 text-lg text-muted">
              {job.company.name} · {job.location} · {REMOTE_LABEL[job.remoteType]} · {CONTRACT_LABEL[job.contract]} ·{" "}
              {SENIORITY_LABEL[job.seniority]}
            </p>
            {job.moduleHeld && (
              <p className="mt-2 text-sm text-good">
                Module tenu dans cette maison — le signal est relevé de 10 points.
              </p>
            )}
            <div className="mt-3">
              <CckChips values={packed?.cck} where="card" />
            </div>
          </div>
        </div>
        <p className="mt-2 text-sm text-subtle">
          {formatPosted(job.postedAt)} · {job.applicantsCount} candidatures visibles · {job.quietCount} main
          {job.quietCount > 1 ? "s" : ""} levée{job.quietCount > 1 ? "s" : ""}
        </p>

        <div className="mt-6 flex flex-wrap items-end gap-6 border-y border-border py-5">
          <div>
            <div className="text-xs tracking-wide text-muted uppercase">Salaire</div>
            <div className="font-serif text-3xl tabular-nums">
              {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
            </div>
            {job.marketMedian && (
              <p className="mt-1 text-xs text-muted">
                Médiane secteur {formatSalary(job.marketMedian, job.marketMedian)}
              </p>
            )}
          </div>
          <MatchRing value={job.match} />
          <GhostMeter
            risk={job.ghostRisk}
            postedAt={job.postedAt}
            velocity={job.company.hiringVelocity}
            detailed
          />
          <ScarcityBadge scarcity={scarcity} detailed />
        </div>

        <div className="mt-8">
          <VerdictCard verdict={verdict} />
        </div>

        <p className="mt-6 text-center text-xs tracking-wide text-muted uppercase">
          Cinq faces — plus de page-fleuve
        </p>
        <OfferOrb
          active={tab}
          onChange={setTab}
          mark={<CompanyMark name={job.company.name} slug={job.company.slug} className="size-16 text-xl" />}
        />
        <OfferToolbar active={tab} onChange={setTab} />

        {tab === "lire" && (
          <OfferPanel tab="lire">
            <p className="max-w-prose text-base leading-relaxed text-ink">{job.description}</p>
            <Block title="Vous ferez" items={job.responsibilities} />
            <Block title="Il vous faut" items={job.requirements} />
            {job.nice.length > 0 && <Block title="Un plus" items={job.nice} />}
            <SalaryBand
              min={job.salaryMin}
              max={job.salaryMax}
              currency={job.currency}
              mark={job.offer.pay}
            />
            <HonestyBlock honesty={job.offer.honesty} benefits={job.offer.benefits} />
          </OfferPanel>
        )}

        {tab === "epreuve" && (
          <OfferPanel tab="epreuve">
            {job.offer.sim ? (
              <TaskSimPanel
                sim={job.offer.sim}
                onResolved={(out) => {
                  setSimOk(out.ok);
                  setSimScore(out.score);
                  setSimMisses(out.misses);
                }}
              />
            ) : (
              <p className="text-sm text-muted">Pas d’épreuve machine sur cette offre — la grille tient encore.</p>
            )}
            <EvalGridPanel
              grid={grid}
              onScore={(s, a) => {
                setGridScore(s);
                setGridAnswers(a);
              }}
            />
          </OfferPanel>
        )}

        {tab === "entreprise" && (
          <OfferPanel tab="entreprise">
            <WeekRing slices={job.offer.week} />
            <CareerMap nodes={job.offer.career} />
            {job.offer.workplace && <WorkplaceTour workplace={job.offer.workplace} />}
            <Voices voices={job.offer.voices} />
            <ToolsRack tools={job.offer.tools} />
            <CultureRadar culture={culture} />
            <CultureSim slug={job.company.slug} culture={culture} />
          </OfferPanel>
        )}

        {tab === "former" && (
          <OfferPanel tab="former">
            {preformQ.data && (
              <SkillPath missing={preformQ.data.missing} path={preformQ.data.path} totalMinutes={preformQ.data.totalMinutes} />
            )}
            {(driveQ.data ?? []).length > 0 && (
              <section>
                <h2 className="font-serif text-2xl">
                  <Term k="drive">Fichiers</Term> de l’offre
                </h2>
                <ul className="mt-4 grid gap-3">
                  {(driveQ.data ?? []).map((d) => (
                    <li key={d.id}>
                      <DriveCard asset={d} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {(job.barriers.length > 0 || job.tryBuy) && (
              <section className="rounded-xl border border-border bg-surface p-5">
                <p className="text-xs tracking-wide text-primary uppercase">Freins périphériques</p>
                <h2 className="mt-1 font-serif text-2xl">Ce que l’entreprise lève — écrit</h2>
                {job.tryBuy && (
                  <p className="mt-3 text-sm leading-relaxed">
                    <Term k="trybuy">Try & Buy</Term> {job.tryBuy.days} jours · {job.tryBuy.dailyPay} € / jour · {job.tryBuy.supervisor}. {job.tryBuy.startNote}
                  </p>
                )}
                <ul className="mt-4 space-y-2">
                  {BARRIERS.filter((b) => job.barriers.includes(b.id)).map((b) => (
                    <li key={b.id} className="border-t border-border pt-2 text-sm">
                      <span className="font-medium">{b.label}</span>
                      <span className="text-muted"> — {b.house}</span>
                    </li>
                  ))}
                </ul>
                {user && (profileQ.data?.barriers.length ?? 0) > 0 && (
                  <BarrierFitNote need={profileQ.data!.barriers} cover={job.barriers} />
                )}
                <p className="mt-3 text-sm">
                  <Link to="/me" className="text-primary">Cocher vos freins au profil</Link>
                  {" · "}
                  <Link to="/viviers/$slug" params={{ slug: "rsa-freins" }} className="text-primary">RSA & freins</Link>
                </p>
              </section>
            )}
            {job.slots.length > 0 && (
              <section className="rounded-xl border border-border bg-surface p-5">
                <p className="text-xs tracking-wide text-primary uppercase">Senior à la journée</p>
                <h2 className="mt-1 font-serif text-2xl">Créneaux — un jour, une entreprise</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {job.slots.map((s, i) => (
                    <li key={`${s.weekday}-${s.startHour}-${i}`}>
                      {WEEKDAYS[s.weekday]} {s.startHour}h–{s.startHour + s.hours}h · {s.city} · {s.seats} place{s.seats > 1 ? "s" : ""}
                    </li>
                  ))}
                </ul>
                <Link to="/me/creneaux" className="mt-3 inline-block text-sm font-medium text-primary">
                  Tenir un créneau
                </Link>
              </section>
            )}
            <InterviewPrep jobId={job.id} signedIn={Boolean(user)} />
          </OfferPanel>
        )}

        {tab === "agir" && (
          <OfferPanel tab="agir">
            <section>
              <h2 className="font-serif text-2xl">Lecture complète</h2>
              <div className="mt-3 max-w-prose space-y-3 text-sm leading-relaxed text-ink">
                {longform.split("\n\n").map((p) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
              </div>
            </section>
            <SeoFaq items={faqs} />
            {relatedGuides.length > 0 && (
              <section>
                <h2 className="font-serif text-2xl">Guides</h2>
                <ul className="mt-3 space-y-2">
                  {relatedGuides.map((p) => (
                    <li key={p.slug}>
                      <Link to="/guides/$slug" params={{ slug: p.slug }} className="text-sm font-medium text-primary">
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <div className="lg:hidden">
              <ProcessTimeline steps={job.process} decisionDays={job.decisionDays} />
            </div>
            <p className="text-xs text-subtle">
              Version machine :{" "}
              <a className="text-primary" href={`/feed/${job.slug}.md`}>Markdown</a>
              {" · "}
              <a className="text-primary" href="/feed.json">feed.json</a>
              {" · "}
              <a className="text-primary" href="/llms.txt">llms.txt</a>
            </p>
          </OfferPanel>
        )}

        {explain && (
          <aside className="mt-8 rounded-xl border border-border bg-surface p-5">
            <h2 className="font-serif text-xl">Lecture du signal</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">{explain}</p>
          </aside>
        )}
      </article>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-soft">
          <Link to="/companies/$slug" params={{ slug: job.company.slug }} className="flex items-center gap-3">
            <CompanyMark name={job.company.name} slug={job.company.slug} />
            <div>
              <div className="font-medium">{job.company.name}</div>
              <div className="text-xs text-muted">{job.companyFull.tagline}</div>
            </div>
          </Link>
          <div className="mt-4 flex flex-col gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link to="/companies/$slug/rdv" params={{ slug: job.company.slug }}>
                Prendre rendez-vous
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/companies/$slug/academie" params={{ slug: job.company.slug }}>
                Académie salariés
              </Link>
            </Button>
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <PactBadge
              honor={job.companyFull.honorScore}
              slaDays={job.companyFull.responseSlaDays}
              due={job.companyFull.honorDue}
            />
            {job.companyFull.honorDue > 0 && (
              <p className="mt-2 text-xs text-muted">
                {job.companyFull.honorAnswered}/{job.companyFull.honorDue} dossiers clos à l’heure
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <ProcessTimeline steps={job.process} decisionDays={job.decisionDays} />
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="text-xs tracking-wide text-muted uppercase">
            <Term k="ppqc">PPQC</Term>
          </p>
          <p className="mt-1 font-serif text-3xl tabular-nums">{ppqc.euros} €</p>
          <p className="mt-2 text-xs leading-relaxed text-muted">{ppqc.why}</p>
          <p className="mt-2 text-xs text-subtle">
            Publication gratuite. Facture seulement si épreuve tenue et grille ≥ 55.
          </p>
          <Link to="/ppqc" className="mt-2 inline-block text-sm font-medium text-primary">
            Le modèle
          </Link>
        </div>

        {job.offer.depth === "full" ? (
          <ApplyTrial
            pack={job.offer}
            simOk={simOk}
            simScore={simScore}
            applied={job.applied}
            applying={applyM.isPending}
            saved={job.saved}
            quietRaised={job.quietRaised}
            briefReady={job.briefReady}
            showLoginNudge={showLoginNudge}
            letter={letter}
            onLetter={setLetter}
            onApply={() => applyM.mutate()}
            onSave={() => saveM.mutate()}
            onQuiet={() => quietM.mutate()}
            savePending={saveM.isPending}
            quietPending={quietM.isPending}
            letterPending={letterM.isPending}
            explainPending={explainM.isPending}
            onLetterAi={() => letterM.mutate()}
            onExplain={() => explainM.mutate()}
          />
        ) : (
          <div className="rounded-xl border border-border bg-surface p-5">
            {showLoginNudge && (
              <p className="mb-3 text-sm text-muted">
                <Link to="/login" className="text-primary">
                  Connectez-vous
                </Link>{" "}
                pour postuler, lever la main, ou joindre votre brief.
              </p>
            )}
            <div className="flex gap-2">
              <Button className="flex-1" disabled={job.applied || applyM.isPending} onClick={() => applyM.mutate()}>
                {job.applied ? "Déjà envoyée" : "Postuler"}
              </Button>
              <Button variant="secondary" aria-label="Sauver" onClick={() => saveM.mutate()} disabled={saveM.isPending}>
                {job.saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
              </Button>
            </div>
            <Button
              variant={job.quietRaised ? "secondary" : "ghost"}
              className="mt-2 w-full"
              disabled={quietM.isPending}
              onClick={() => quietM.mutate()}
            >
              <Hand className="size-4" />
              {job.quietRaised ? "Main levée" : "Lever la main — sans candidater"}
            </Button>
            <p className="mt-2 text-xs text-subtle">
              Le signal discret n’affiche pas votre nom. Votre employeur ne voit rien.
            </p>
            <Textarea
              className="mt-3"
              placeholder="Lettre courte (optionnelle)"
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
            />
            <p className="mt-2 text-xs text-muted">
              {job.briefReady ? (
                "Votre brief sera joint à la candidature."
              ) : (
                <>
                  Pas de brief complet.{" "}
                  <Link to="/me/brief" className="text-primary">
                    L’écrire
                  </Link>{" "}
                  — les entreprises le lisent avant la lettre.
                </>
              )}
            </p>
            <div className="mt-2 flex flex-col gap-2">
              <Button variant="ghost" size="sm" disabled={!user || letterM.isPending} onClick={() => letterM.mutate()}>
                {letterM.isPending ? "Rédaction…" : "Rédiger avec l’assistant"}
              </Button>
              <Button variant="ghost" size="sm" disabled={!user || explainM.isPending} onClick={() => explainM.mutate()}>
                {explainM.isPending ? "Lecture…" : "Pourquoi ce signal"}
              </Button>
              <a href="#prep" className="text-center text-xs font-medium text-primary">
                Préparer l’entretien
              </a>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h2 className="font-serif text-2xl">{title}</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function BarrierFitNote({ need, cover }: { need: string[]; cover: string[] }) {
  const fit = barrierFit(need, cover);
  if (fit.open.length === 0) {
    return <p className="mt-3 text-sm text-good">Vos freins sont couverts par cette entreprise. Le Try & Buy peut tenir.</p>;
  }
  const labels = BARRIERS.filter((b) => fit.open.includes(b.id)).map((b) => b.label);
  return (
    <p className="mt-3 text-sm text-warn">
      Non levés : {labels.join(", ")}. Cochez ailleurs, ou candidatez en le sachant — ce n’est plus un trou noir.
    </p>
  );
}