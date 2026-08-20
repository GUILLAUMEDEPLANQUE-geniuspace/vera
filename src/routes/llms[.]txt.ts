import { createFileRoute } from "@tanstack/react-router";
import { CITIES, DEPTS, REGIONS } from "@/lib/geo";
import { listCompanies, listJobs } from "@/lib/jobs-fn";
import { listArticles } from "@/lib/journal-fn";
import { listHubArticles, listHubCategories } from "@/lib/hub-fn";
import { requestOrigin } from "@/lib/origin";
import { PILLARS } from "@/lib/pillars";
import { SEM_METIERS } from "@/lib/sem";
import { VIVIERS } from "@/lib/viviers";

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = requestOrigin(request);
        const [jobs, companies, articles, cats, savoirs] = await Promise.all([
          listJobs({ data: {} }),
          listCompanies(),
          listArticles(),
          listHubCategories(),
          listHubArticles({ data: {} }),
        ]);
        const lines = [
          `# Vera`,
          `> L'emploi, enfin lisible. Verdict, pacte de réponse, brief, Savoirs (GeniusKnowledges), GeniusDrive, offres augmentées, grilles publiques, PPQC, viviers oubliés.`,
          ``,
          `Site: ${origin}`,
          `Langue: fr-FR`,
          ``,
          `## Machine`,
          `- JSON catalog: ${origin}/feed.json`,
          `- Markdown per job: ${origin}/feed/{slug}.md`,
          `- Markdown per house: ${origin}/feed/maisons/{slug}.md`,
          `- Sitemap: ${origin}/sitemap.xml`,
          `- Schema: JobPosting + FAQPage + Organization + Occupation + CollectionPage + Dataset`,
          `- Geo: ${REGIONS.length} régions, ${DEPTS.length} départements, ${CITIES.length} villes — chaque page liste les offres.`,
          ``,
          `## Guides (piliers)`,
          ...PILLARS.map((p) => `- [${p.title}](${origin}/guides/${p.slug}): ${p.excerpt}`),
          ``,
          `## Régions`,
          ...REGIONS.map((r) => `- [${r.name}](${origin}/lieux/regions/${r.slug}): tension ${r.tension}, index ${r.salaryIndex}, ${r.metiers.join(", ")}`),
          ``,
          `## Départements`,
          `- Index: ${origin}/lieux/departements`,
          ...DEPTS.map((d) => `- [${d.code} ${d.name}](${origin}/lieux/departements/${d.slug}) — ${d.prefecture}`),
          ``,
          `## Villes (préfectures + bassins)`,
          `- Index: ${origin}/lieux`,
          ...CITIES.map((c) => `- [${c.name}](${origin}/lieux/${c.slug})`),
          ``,
          `## Savoirs (GeniusKnowledges)`,
          `- Hub: ${origin}/savoirs`,
          `- Lexique: ${origin}/lexique`,
          ...cats.map((c) => `- [${c.title}](${origin}/savoirs/${c.slug}): ${c.description}`),
          ``,
          `## Fiches Savoirs`,
          ...savoirs.map(
            (a) =>
              `- [${a.title}](${origin}/savoirs/${a.catSlug}/${a.slug}) — ${a.minutes} min, proof ${a.proofScore}, ${a.skillTags.join(", ")}`,
          ),
          ``,
          `## GeniusDrive`,
          `- Lecteur: ${origin}/drive`,
          `- Vidéos et modes opératoires en chunks HTTP Range, liés aux offres et aux fiches.`,
          ``,
          `## Métiers`,
          ...SEM_METIERS.map((m) => `- [${m.name}](${origin}/metiers/${m.slug}): ${m.description}`),
          ``,
          `## Viviers`,
          ...VIVIERS.map((v) => `- [${v.name}](${origin}/viviers/${v.slug}): ${v.description}`),
          ``,
          `## Journal`,
          ...articles.map((a) => `- [${a.title}](${origin}/journal/${a.slug}) — ${a.authorName}`),
          ``,
          `## Observatoire`,
          `- Tension territoriale: ${origin}/tension`,
          `- PPQC (Pay-Per-Qualified-Candidate): ${origin}/ppqc`,
          ``,
          `## Maisons`,
          ...companies.map(
            (c) =>
              `- [${c.name}](${origin}/companies/${c.slug}) (${origin}/feed/maisons/${c.slug}.md): ${c.industry}, ${c.hqCity}, honneur ${c.honorScore}, ${c.jobCount} offre(s)`,
          ),
          ``,
          `## Offres`,
          ...jobs.map(
            (j) =>
              `- [${j.title} — ${j.company.name}](${origin}/jobs/${j.slug}) (${origin}/feed/${j.slug}.md) · ${j.city} · ${j.salaryMin ?? "?"}–${j.salaryMax ?? "?"} ${j.currency}${j.pool ? ` · vivier ${j.pool}` : ""}`,
          ),
          ``,
          `## Produit`,
          `- Le Verdict dit de passer. Le Pacte rend les retards visibles. Le Brief remplace le CV.`,
          `- Savoirs (GeniusKnowledges): hub SEO métier/droit/compta/robotique, lié aux offres. Préformation si geste manquant.`,
          `- GeniusDrive: fichiers et visites en chunks HTTP Range, lecteur intégré.`,
          `- Micro-simulation métier obligatoire avant envoi des coordonnées. Grilles publiques.`,
          `- Matching compétences + fit culturel (langues, axes). Talent Scarcity Score.`,
          `- Viviers: seniors fractional, binômes, RSA + freins, slashers, reprise.`,
          `- PPQC: publication gratuite, paiement si épreuve tenue + grille ≥ 55. Prix = geo-tension.`,
          `- Marketplace: ${origin}/marche`,
        ];
        return new Response(lines.join("\n") + "\n", {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
