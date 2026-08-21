import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./auth/middleware";
import { cultureOf } from "./culture";
import { getSql } from "./db";
import { gridFor } from "./fields";

async function complete(system: string, user: string): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return { ok: false, error: "L’assistant n’est pas disponible ici." };

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      max_tokens: 700,
      temperature: 0.5,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) return { ok: false, error: `Erreur assistant (${res.status})` };
  const body = (await res.json()) as { choices: { message: { content: string } }[] };
  return { ok: true, text: body.choices[0]?.message.content ?? "" };
}

export const writeCoverLetter = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { jobId: number }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const jobs = await sql<{
      title: string;
      description: string;
      company: string;
      city: string;
      slug: string;
      collection: string | null;
      company_slug: string;
    }>`
      select j.title, j.description, c.name as company, j.city, j.slug, j.collection, c.slug as company_slug
      from jobs j join companies c on c.id = j.company_id
      where j.id = ${data.jobId}
      limit 1
    `;
    const job = jobs[0];
    if (!job) return { ok: false as const, error: "Offre introuvable" };
    const culture = cultureOf(job.company_slug);
    const grid = gridFor({ slug: job.slug, collection: job.collection, title: job.title });
    const profiles = await sql<{
      headline: string | null;
      bio: string | null;
      skills_json: string;
    }>`select headline, bio, skills_json from profiles where user_id = ${context.userId} limit 1`;
    const briefs = await sql<{
      shipped_json: string;
      refuse_json: string;
      next_chapter: string | null;
    }>`select shipped_json, refuse_json, next_chapter from briefs where user_id = ${context.userId} limit 1`;
    const p = profiles[0];
    const result = await complete(
      "Tu es un rédacteur d’emploi francophone, sobre, précis. Pas de superlatifs, pas d’emoji, pas de « passionné ». 180 à 220 mots. Tutoiement interdit. Vousvoiement. Termine sans formule creuse. Appuie-toi d’abord sur le brief (livraisons, refus, suite), pas sur des qualités vagues. Adapte le ton à la culture de l’entreprise : parole, hiérarchie, canal écrit vs oral, langues. Un candidat qui ignore le style de travail se fait recaler.",
      `Écris une lettre de motivation courte pour ${job.title} chez ${job.company} (${job.city}).
Culture entreprise : ${culture.essay}
Management : ${culture.management}
Semaine : ${culture.weekStyle}
Langues : ${culture.languages.join(", ")}
Axes (0–100) : parole ${culture.axes.directness}, hiérarchie ${culture.axes.hierarchy}, tempo ${culture.axes.tempo}, écrit ${culture.axes.writing}, risque ${culture.axes.risk}.
Grille publique « ${grid.title} » — critères : ${grid.fields.map((f) => f.label).join(", ")}.
Profil : ${p?.headline ?? "candidat"}, ${p?.bio ?? "sans bio"}.
Compétences : ${p?.skills_json ?? "[]"}.
Brief : livré ${briefs[0]?.shipped_json ?? "[]"}, refuse ${briefs[0]?.refuse_json ?? "[]"}, suite ${briefs[0]?.next_chapter ?? "—"}.
Offre : ${job.description.slice(0, 800)}`,
    );
    if (result.ok) {
      await sql`
        insert into coach_notes (user_id, job_id, kind, prompt, response)
        values (${context.userId}, ${data.jobId}, ${"letter"}, ${job.title}, ${result.text})
      `;
    }
    return result;
  });

export const explainMatch = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { jobId: number; match: number | null }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const jobs = await sql<{
      title: string;
      skills_json: string;
      seniority: string;
      company: string;
      company_slug: string;
    }>`
      select j.title, j.skills_json, j.seniority, c.name as company, c.slug as company_slug
      from jobs j join companies c on c.id = j.company_id
      where j.id = ${data.jobId}
      limit 1
    `;
    const job = jobs[0];
    if (!job) return { ok: false as const, error: "Offre introuvable" };
    const culture = cultureOf(job.company_slug);
    const profiles = await sql<{
      headline: string | null;
      skills_json: string;
      seniority: string | null;
    }>`select headline, skills_json, seniority from profiles where user_id = ${context.userId} limit 1`;
    const p = profiles[0];
    return complete(
      "Tu es un conseiller carrière francophone, franc, utile. 120 mots max. Pas d’emoji. Dis ce qui colle (compétences ET fit culturel), ce qui manque, et UNE question à poser en entretien — adaptée au style de l’entreprise.",
      `Score Vera : ${data.match ?? "inconnu"} / 100.
Poste : ${job.title} chez ${job.company}, séniorité ${job.seniority}, compétences ${job.skills_json}.
Culture : ${culture.essay} Langues ${culture.languages.join(", ")}. Interculturel ${culture.intercultural}.
Candidat : ${p?.headline ?? "?"}, séniorité ${p?.seniority ?? "?"}, compétences ${p?.skills_json ?? "[]"}.`,
    );
  });

export const interviewPrep = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { jobId?: number; question: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    let jobLine = "Sans offre précise.";
    if (data.jobId) {
      const jobs = await sql<{ title: string; company: string; description: string; company_slug: string }>`
        select j.title, c.name as company, j.description, c.slug as company_slug
        from jobs j join companies c on c.id = j.company_id
        where j.id = ${data.jobId}
        limit 1
      `;
      if (jobs[0]) {
        const culture = cultureOf(jobs[0].company_slug);
        jobLine = `${jobs[0].title} chez ${jobs[0].company}. ${jobs[0].description.slice(0, 400)}
Culture : ${culture.essay}
Management : ${culture.management}
Langues : ${culture.languages.join(", ")}
Axes : parole ${culture.axes.directness}, hiérarchie ${culture.axes.hierarchy}, écrit ${culture.axes.writing}.`;
      }
    }
    const profiles = await sql<{ headline: string | null; bio: string | null; skills_json: string }>`
      select headline, bio, skills_json from profiles where user_id = ${context.userId} limit 1
    `;
    const p = profiles[0];
    const result = await complete(
      "Tu es un préparateur d’entretien francophone. Concret, un peu sec. Structure : 1) ce qu’ils cherchent vraiment (compétences + culture) 2) une réponse type en 6–8 phrases, calée sur le style de l’entreprise 3) le piège interculturel à éviter. Pas d’emoji.",
      `Offre : ${jobLine}
Profil : ${p?.headline ?? ""}. ${p?.bio ?? ""}. Compétences ${p?.skills_json ?? "[]"}.
Demande : ${data.question.slice(0, 600)}`,
    );
    if (result.ok) {
      await sql`
        insert into coach_notes (user_id, job_id, kind, prompt, response)
        values (${context.userId}, ${data.jobId ?? null}, ${"coach"}, ${data.question.slice(0, 400)}, ${result.text})
      `;
    }
    return result;
  });

export const careerCompass = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const profiles = await sql<{
      headline: string | null;
      bio: string | null;
      skills_json: string;
      seniority: string | null;
      location: string | null;
    }>`select headline, bio, skills_json, seniority, location from profiles where user_id = ${context.userId} limit 1`;
    const p = profiles[0];
    if (!p?.skills_json || p.skills_json === "[]") {
      return { ok: false as const, error: "Complétez d’abord votre profil (compétences)." };
    }
    const jobs = await sql<{ title: string; company: string; city: string; skills: string }>`
      select j.title, c.name as company, j.city, j.skills_json as skills
      from jobs j join companies c on c.id = j.company_id
      where j.ghost_risk = 'low'
      order by j.posted_at desc
      limit 12
    `;
    return complete(
      "Tu es un conseiller de carrière francophone sur Vera. 160 mots. Propose 3 directions concrètes parmi les offres listées, avec pourquoi. Pas d’emoji, pas de coaching motivationnel.",
      `Profil : ${p.headline}, ${p.seniority}, ${p.location}. ${p.bio}. Compétences ${p.skills_json}.
Offres : ${JSON.stringify(jobs)}`,
    );
  });

export const draftBrief = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const profiles = await sql<{
      headline: string | null;
      bio: string | null;
      skills_json: string;
      seniority: string | null;
      location: string | null;
      role_targets_json: string;
    }>`
      select headline, bio, skills_json, seniority, location, role_targets_json
      from profiles where user_id = ${context.userId} limit 1
    `;
    const p = profiles[0];
    if (!p?.headline && (!p?.bio || p.bio.length < 20)) {
      return { ok: false as const, error: "Remplissez d’abord le profil (titre et note)." };
    }
    return complete(
      `Tu rédiges un Brief Vera, pas un CV. Réponds UNIQUEMENT en JSON valide, sans markdown :
{"shipped":[{"title":"","impact":"","year":""},{"title":"","impact":"","year":""},{"title":"","impact":"","year":""}],"refuse":["",""],"nextChapter":"","workingStyle":""}
Règles : français, sobre, concret, pas d’emoji, pas de « passionné ». shipped = 3 livraisons plausibles à partir du profil (invente des impacts chiffrés réalistes, pas des exploits). refuse = 2 ou 3 lignes nettes. nextChapter = 2 phrases. workingStyle = 2 phrases.`,
      `Profil : ${p?.headline}, ${p?.seniority}, ${p?.location}.
Note : ${p?.bio}
Compétences : ${p?.skills_json}
Cibles : ${p?.role_targets_json}`,
    );
  });
