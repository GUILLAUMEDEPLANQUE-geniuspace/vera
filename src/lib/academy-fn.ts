import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./auth/middleware";
import { getSql } from "./db";
import { ensureSeeded } from "./seed";

export type AcademyCourseCard = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  audience: "employee" | "candidate" | "both";
  category: string;
  minutes: number;
  mandatory: boolean;
  moduleCount: number;
  enrolled: number;
  completed: number;
};

export type AcademyHouse = {
  id: number;
  slug: string;
  name: string;
  industry: string;
  hqCity: string;
  honorScore: number;
  courseCount: number;
  memberCount: number;
};

export type AcademyModule = {
  id: number;
  slug: string;
  title: string;
  kicker: string;
  body: string;
  kind: "lesson" | "quiz" | "drill";
  minutes: number;
  sortOrder: number;
  questions: { q: string; choices: string[] }[];
  done: boolean;
  score: number | null;
};

export type CourseDetail = {
  course: AcademyCourseCard & { companySlug: string; companyName: string; companyId: number };
  modules: AcademyModule[];
  enrollment: { status: string; progressPct: number; completedAt: string | null } | null;
  member: { role: string } | null;
};

export type MyEnrollment = {
  courseId: number;
  slug: string;
  title: string;
  excerpt: string;
  minutes: number;
  mandatory: boolean;
  category: string;
  companySlug: string;
  companyName: string;
  status: string;
  progressPct: number;
  completedAt: string | null;
};

type QuizItem = { q: string; choices: string[]; answer: number };

function parseQuiz(raw: string): QuizItem[] {
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const row = item as { q?: unknown; choices?: unknown; answer?: unknown };
      const choices = Array.isArray(row.choices) ? row.choices.map((c) => String(c)) : [];
      return [{ q: String(row.q ?? ""), choices, answer: Number(row.answer) || 0 }];
    });
  } catch {
    return [];
  }
}

async function ready() {
  const sql = await getSql();
  await ensureSeeded(sql);
  return sql;
}

export const listAcademies = createServerFn({ method: "GET" }).handler(async (): Promise<AcademyHouse[]> => {
  const sql = await ready();
  const rows = await sql<{
    id: number;
    slug: string;
    name: string;
    industry: string;
    hq_city: string;
    honor_score: number;
    course_count: number;
    member_count: number;
  }>`
    select c.id, c.slug, c.name, c.industry, c.hq_city, c.honor_score,
      (select count(*)::int from academy_courses a where a.company_id = c.id and a.published)
        as course_count,
      (select count(*)::int from academy_members m where m.company_id = c.id) as member_count
    from companies c
    where exists (select 1 from academy_courses a where a.company_id = c.id and a.published)
    order by c.honor_score desc, c.name
  `;
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    industry: r.industry,
    hqCity: r.hq_city,
    honorScore: r.honor_score,
    courseCount: r.course_count,
    memberCount: r.member_count,
  }));
});

export const listAcademySitemap = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await ready();
  return sql<{ company: string; course: string }>`
    select c.slug as company, a.slug as course
    from academy_courses a
    join companies c on c.id = a.company_id
    where a.published
    order by c.slug, a.sort_order
  `;
});

async function courseCards(
  sql: Awaited<ReturnType<typeof getSql>>,
  companyId: number,
  audience?: "employee" | "candidate" | "both" | "all",
): Promise<AcademyCourseCard[]> {
  const rows = await sql<{
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    audience: string;
    category: string;
    minutes: number;
    mandatory: boolean;
    module_count: number;
    enrolled: number;
    completed: number;
  }>`
    select a.id, a.slug, a.title, a.excerpt, a.audience, a.category, a.minutes, a.mandatory,
      (select count(*)::int from academy_modules m where m.course_id = a.id) as module_count,
      (select count(*)::int from academy_enrollments e where e.course_id = a.id) as enrolled,
      (select count(*)::int from academy_enrollments e where e.course_id = a.id and e.status = 'completed') as completed
    from academy_courses a
    where a.company_id = ${companyId} and a.published
    order by a.sort_order, a.id
  `;
  return rows
    .filter((r) => {
      if (!audience || audience === "all") return true;
      return r.audience === audience || r.audience === "both";
    })
    .map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      audience: r.audience as AcademyCourseCard["audience"],
      category: r.category,
      minutes: r.minutes,
      mandatory: r.mandatory,
      moduleCount: r.module_count,
      enrolled: r.enrolled,
      completed: r.completed,
    }));
}

export const getAcademy = createServerFn({ method: "POST" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const sql = await ready();
    const houses = await sql<{
      id: number;
      slug: string;
      name: string;
      tagline: string;
      about: string;
      industry: string;
      hq_city: string;
      honor_score: number;
    }>`
      select id, slug, name, tagline, about, industry, hq_city, honor_score
      from companies where slug = ${slug} limit 1
    `;
    const house = houses[0];
    if (!house) return null;
    const courses = await courseCards(sql, house.id);
    const [{ members }] = await sql<{ members: number }>`
      select count(*)::int as members from academy_members where company_id = ${house.id}
    `;
    return {
      company: {
        id: house.id,
        slug: house.slug,
        name: house.name,
        tagline: house.tagline,
        about: house.about,
        industry: house.industry,
        hqCity: house.hq_city,
        honorScore: house.honor_score,
        memberCount: members,
      },
      courses,
    };
  });

export const getAcademyCourse = createServerFn({ method: "POST" })
  .validator((input: { company: string; course: string }) => input)
  .handler(async ({ data }): Promise<CourseDetail | null> => {
    const sql = await ready();
    const rows = await sql<{
      id: number;
      slug: string;
      title: string;
      excerpt: string;
      audience: string;
      category: string;
      minutes: number;
      mandatory: boolean;
      company_id: number;
      company_slug: string;
      company_name: string;
    }>`
      select a.id, a.slug, a.title, a.excerpt, a.audience, a.category, a.minutes, a.mandatory,
        c.id as company_id, c.slug as company_slug, c.name as company_name
      from academy_courses a
      join companies c on c.id = a.company_id
      where c.slug = ${data.company} and a.slug = ${data.course} and a.published
      limit 1
    `;
    const course = rows[0];
    if (!course) return null;

    let userId: string | null = null;
    try {
      const { getSessionUser } = await import("./auth/verify.server");
      const u = await getSessionUser();
      userId = u?.id ?? null;
    } catch {
      userId = null;
    }

    const mods = await sql<{
      id: number;
      slug: string;
      title: string;
      kicker: string;
      body: string;
      kind: string;
      minutes: number;
      sort_order: number;
      quiz_json: string;
    }>`
      select id, slug, title, kicker, body, kind, minutes, sort_order, quiz_json
      from academy_modules where course_id = ${course.id} order by sort_order, id
    `;

    const done = userId
      ? await sql<{ module_id: number; score: number | null }>`
          select module_id, score from academy_progress where user_id = ${userId}
        `
      : [];
    const doneMap = new Map(done.map((d) => [d.module_id, d.score]));

    const enroll = userId
      ? await sql<{ status: string; progress_pct: number; completed_at: string | null }>`
          select status, progress_pct, completed_at from academy_enrollments
          where user_id = ${userId} and course_id = ${course.id} limit 1
        `
      : [];
    const member = userId
      ? await sql<{ role: string }>`
          select role from academy_members
          where user_id = ${userId} and company_id = ${course.company_id} limit 1
        `
      : [];

    const [{ enrolled }] = await sql<{ enrolled: number }>`
      select count(*)::int as enrolled from academy_enrollments where course_id = ${course.id}
    `;
    const [{ completed }] = await sql<{ completed: number }>`
      select count(*)::int as completed from academy_enrollments
      where course_id = ${course.id} and status = 'completed'
    `;

    return {
      course: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        excerpt: course.excerpt,
        audience: course.audience as AcademyCourseCard["audience"],
        category: course.category,
        minutes: course.minutes,
        mandatory: course.mandatory,
        moduleCount: mods.length,
        enrolled,
        completed,
        companySlug: course.company_slug,
        companyName: course.company_name,
        companyId: course.company_id,
      },
      modules: mods.map((m) => {
        const quiz = parseQuiz(m.quiz_json);
        return {
          id: m.id,
          slug: m.slug,
          title: m.title,
          kicker: m.kicker,
          body: m.body,
          kind: m.kind as AcademyModule["kind"],
          minutes: m.minutes,
          sortOrder: m.sort_order,
          questions: quiz.map((q) => ({ q: q.q, choices: q.choices })),
          done: doneMap.has(m.id),
          score: doneMap.get(m.id) ?? null,
        };
      }),
      enrollment: enroll[0]
        ? {
            status: enroll[0].status,
            progressPct: enroll[0].progress_pct,
            completedAt: enroll[0].completed_at ? String(enroll[0].completed_at) : null,
          }
        : null,
      member: member[0] ?? null,
    };
  });

async function enrollMandatory(sql: Awaited<ReturnType<typeof getSql>>, userId: string, companyId: number) {
  const courses = await sql<{ id: number }>`
    select id from academy_courses
    where company_id = ${companyId} and published and mandatory
  `;
  for (const c of courses) {
    await sql`
      insert into academy_enrollments (user_id, course_id, status, assigned_by)
      values (${userId}, ${c.id}, ${"assigned"}, ${"system"})
      on conflict (user_id, course_id) do nothing
    `;
  }
}

export const joinAcademy = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((companySlug: string) => companySlug)
  .handler(async ({ context, data: companySlug }) => {
    const sql = await ready();
    const houses = await sql<{ id: number }>`select id from companies where slug = ${companySlug} limit 1`;
    if (!houses[0]) return { ok: false as const, error: "Entreprise introuvable." };
    const profile = await sql<{ role: string; house_slug: string | null }>`
      select role, house_slug from profiles where user_id = ${context.userId} limit 1
    `;
    const isHr = profile[0]?.role === "house" && profile[0].house_slug === companySlug;
    await sql`
      insert into academy_members (company_id, user_id, role)
      values (${houses[0].id}, ${context.userId}, ${isHr ? "hr" : "learner"})
      on conflict (company_id, user_id) do update set
        role = case when excluded.role = 'hr' then 'hr' else academy_members.role end
    `;
    await enrollMandatory(sql, context.userId, houses[0].id);
    return { ok: true as const, role: isHr ? "hr" : "learner" };
  });

export const enrollCourse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((courseId: number) => courseId)
  .handler(async ({ context, data: courseId }) => {
    const sql = await ready();
    const rows = await sql<{ id: number; audience: string; company_id: number }>`
      select id, audience, company_id from academy_courses where id = ${courseId} and published limit 1
    `;
    const course = rows[0];
    if (!course) return { ok: false as const, error: "Parcours introuvable." };
    if (course.audience === "employee") {
      const mem = await sql<{ id: number }>`
        select id from academy_members
        where company_id = ${course.company_id} and user_id = ${context.userId} limit 1
      `;
      if (!mem[0]) return { ok: false as const, error: "Rejoignez l’académie salariés pour ce parcours." };
    }
    await sql`
      insert into academy_enrollments (user_id, course_id, status, started_at)
      values (${context.userId}, ${courseId}, ${"in_progress"}, now())
      on conflict (user_id, course_id) do update set
        status = case when academy_enrollments.status = 'assigned' then 'in_progress' else academy_enrollments.status end,
        started_at = coalesce(academy_enrollments.started_at, now())
    `;
    return { ok: true as const };
  });

export const completeModule = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { moduleId: number; answers?: number[] }) => input)
  .handler(async ({ context, data }) => {
    const sql = await ready();
    const mods = await sql<{
      id: number;
      course_id: number;
      kind: string;
      quiz_json: string;
      audience: string;
      company_id: number;
    }>`
      select m.id, m.course_id, m.kind, m.quiz_json, a.audience, a.company_id
      from academy_modules m
      join academy_courses a on a.id = m.course_id
      where m.id = ${data.moduleId} limit 1
    `;
    const mod = mods[0];
    if (!mod) return { ok: false as const, error: "Module introuvable.", score: 0 };

    if (mod.audience === "employee") {
      const mem = await sql<{ id: number }>`
        select id from academy_members
        where company_id = ${mod.company_id} and user_id = ${context.userId} limit 1
      `;
      if (!mem[0]) return { ok: false as const, error: "Rejoignez l’académie d’abord.", score: 0 };
    }

    let score = 100;
    if (mod.kind === "quiz") {
      const quiz = parseQuiz(mod.quiz_json);
      if (!quiz.length) score = 100;
      else {
        const answers = data.answers ?? [];
        let ok = 0;
        quiz.forEach((q, i) => {
          if (answers[i] === q.answer) ok += 1;
        });
        score = Math.round((ok / quiz.length) * 100);
        if (score < 70) {
          return {
            ok: false as const,
            error: `Score ${score}. 70 requis. Relisez, puis rejouez.`,
            score,
          };
        }
      }
    }

    await sql`
      insert into academy_progress (user_id, module_id, score, completed_at)
      values (${context.userId}, ${mod.id}, ${score}, now())
      on conflict (user_id, module_id) do update set score = excluded.score, completed_at = now()
    `;
    await sql`
      insert into academy_enrollments (user_id, course_id, status, started_at, progress_pct)
      values (${context.userId}, ${mod.course_id}, ${"in_progress"}, now(), 0)
      on conflict (user_id, course_id) do update set
        status = case when academy_enrollments.status = 'completed' then 'completed' else 'in_progress' end,
        started_at = coalesce(academy_enrollments.started_at, now())
    `;

    const [{ total }] = await sql<{ total: number }>`
      select count(*)::int as total from academy_modules where course_id = ${mod.course_id}
    `;
    const [{ done }] = await sql<{ done: number }>`
      select count(*)::int as done
      from academy_progress p
      join academy_modules m on m.id = p.module_id
      where p.user_id = ${context.userId} and m.course_id = ${mod.course_id}
    `;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const finished = total > 0 && done >= total;
    await sql`
      update academy_enrollments
      set progress_pct = ${pct},
          status = ${finished ? "completed" : "in_progress"},
          completed_at = ${finished ? new Date().toISOString() : null}
      where user_id = ${context.userId} and course_id = ${mod.course_id}
    `;
    if (finished) {
      const courses = await sql<{ slug: string; title: string; category: string }>`
        select slug, title, category from academy_courses where id = ${mod.course_id} limit 1
      `;
      const c = courses[0];
      if (c) {
        await sql`
          insert into skill_ledger (user_id, arena_id, skill_tag, title, score, passed, attempt_no, evidence)
          values (
            ${context.userId}, ${`academy:${c.slug}`}, ${c.category}, ${c.title}, ${score},
            true, ${1}, ${`academy:${mod.course_id}:user:${context.userId}`}
          )
        `;
      }
    }
    return { ok: true as const, score, progressPct: pct, completed: finished };
  });

export const myFormation = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await ready();
    const memberships = await sql<{
      company_id: number;
      slug: string;
      name: string;
      industry: string;
      role: string;
    }>`
      select m.company_id, c.slug, c.name, c.industry, m.role
      from academy_members m
      join companies c on c.id = m.company_id
      where m.user_id = ${context.userId}
      order by c.name
    `;
    const enrollments = await sql<{
      course_id: number;
      slug: string;
      title: string;
      excerpt: string;
      minutes: number;
      mandatory: boolean;
      category: string;
      company_slug: string;
      company_name: string;
      status: string;
      progress_pct: number;
      completed_at: string | null;
    }>`
      select e.course_id, a.slug, a.title, a.excerpt, a.minutes, a.mandatory, a.category,
        c.slug as company_slug, c.name as company_name,
        e.status, e.progress_pct, e.completed_at
      from academy_enrollments e
      join academy_courses a on a.id = e.course_id
      join companies c on c.id = a.company_id
      where e.user_id = ${context.userId}
      order by e.completed_at desc nulls last, a.title
    `;
    const profile = await sql<{ role: string; house_slug: string | null; headline: string | null }>`
      select role, house_slug, headline from profiles where user_id = ${context.userId} limit 1
    `;
    return {
      memberships: memberships.map((m) => ({
        companyId: m.company_id,
        slug: m.slug,
        name: m.name,
        industry: m.industry,
        role: m.role,
      })),
      enrollments: enrollments.map(
        (e): MyEnrollment => ({
          courseId: e.course_id,
          slug: e.slug,
          title: e.title,
          excerpt: e.excerpt,
          minutes: e.minutes,
          mandatory: e.mandatory,
          category: e.category,
          companySlug: e.company_slug,
          companyName: e.company_name,
          status: e.status,
          progressPct: e.progress_pct,
          completedAt: e.completed_at ? String(e.completed_at) : null,
        }),
      ),
      houseSlug: profile[0]?.house_slug ?? null,
      headline: profile[0]?.headline ?? null,
    };
  });

export const houseAcademy = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await ready();
    const profile = await sql<{ role: string; house_slug: string | null }>`
      select role, house_slug from profiles where user_id = ${context.userId} limit 1
    `;
    const slug = profile[0]?.house_slug;
    if (!slug || (profile[0]?.role !== "house" && profile[0]?.role !== "operator")) {
      return { ok: false as const, error: "Liez une entreprise dans l’espace recruteur." };
    }
    const houses = await sql<{ id: number; slug: string; name: string }>`
      select id, slug, name from companies where slug = ${slug} limit 1
    `;
    const house = houses[0];
    if (!house) return { ok: false as const, error: "Entreprise introuvable." };
    await sql`
      insert into academy_members (company_id, user_id, role)
      values (${house.id}, ${context.userId}, ${"hr"})
      on conflict (company_id, user_id) do update set role = 'hr'
    `;
    const courses = await courseCards(sql, house.id, "all");
    const members = await sql<{ user_id: string; role: string; job_title: string | null; created_at: string }>`
      select user_id, role, job_title, created_at from academy_members
      where company_id = ${house.id} order by created_at desc
    `;
    const progress = await sql<{
      user_id: string;
      course_id: number;
      status: string;
      progress_pct: number;
    }>`
      select e.user_id, e.course_id, e.status, e.progress_pct
      from academy_enrollments e
      join academy_courses a on a.id = e.course_id
      where a.company_id = ${house.id}
    `;
    return {
      ok: true as const,
      house,
      courses,
      members: members.map((m) => ({
        userId: m.user_id,
        role: m.role,
        jobTitle: m.job_title,
        createdAt: String(m.created_at),
      })),
      progress: progress.map((p) => ({
        userId: p.user_id,
        courseId: p.course_id,
        status: p.status,
        progressPct: p.progress_pct,
      })),
    };
  });

export const houseCreateCourse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      title: string;
      excerpt: string;
      category: string;
      audience: "employee" | "candidate" | "both";
      mandatory: boolean;
      body: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const sql = await ready();
    const profile = await sql<{ role: string; house_slug: string | null }>`
      select role, house_slug from profiles where user_id = ${context.userId} limit 1
    `;
    const slug = profile[0]?.house_slug;
    if (!slug || profile[0]?.role !== "house") return { ok: false as const, error: "Espace recruteur requis." };
    const houses = await sql<{ id: number }>`select id from companies where slug = ${slug} limit 1`;
    if (!houses[0]) return { ok: false as const, error: "Entreprise introuvable." };
    const title = data.title.trim();
    if (title.length < 4) return { ok: false as const, error: "Titre trop court." };
    const courseSlug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48);
    const blocks = data.body
      .split(/\n{2,}/)
      .map((b) => b.trim())
      .filter(Boolean)
      .slice(0, 8);
    if (!blocks.length) return { ok: false as const, error: "Écrivez au moins un module (paragraphes séparés)." };
    const rows = await sql<{ id: number }>`
      insert into academy_courses (
        company_id, slug, title, excerpt, audience, category, minutes, mandatory, published, sort_order
      ) values (
        ${houses[0].id}, ${`${courseSlug}-${Date.now().toString(36)}`}, ${title},
        ${data.excerpt.trim() || title}, ${data.audience}, ${data.category || "metier"},
        ${Math.max(4, blocks.length * 5)}, ${data.mandatory}, ${true}, ${50}
      )
      returning id
    `;
    const courseId = rows[0]?.id;
    if (!courseId) return { ok: false as const, error: "Insertion impossible." };
    let order = 10;
    for (const [i, block] of blocks.entries()) {
      const first = block.split("\n")[0] ?? `Module ${i + 1}`;
      await sql`
        insert into academy_modules (course_id, slug, title, kicker, body, kind, minutes, sort_order, quiz_json)
        values (
          ${courseId}, ${`m-${i + 1}`}, ${first.slice(0, 80)}, ${"Maison"}, ${block},
          ${"lesson"}, ${5}, ${order}, ${"[]"}
        )
      `;
      order += 10;
    }
    if (data.mandatory) {
      const learners = await sql<{ user_id: string }>`
        select user_id from academy_members where company_id = ${houses[0].id}
      `;
      for (const l of learners) {
        await sql`
          insert into academy_enrollments (user_id, course_id, status, assigned_by)
          values (${l.user_id}, ${courseId}, ${"assigned"}, ${context.userId})
          on conflict (user_id, course_id) do nothing
        `;
      }
    }
    return { ok: true as const, courseId };
  });

export const houseAssignAll = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((courseId: number) => courseId)
  .handler(async ({ context, data: courseId }) => {
    const sql = await ready();
    const profile = await sql<{ role: string; house_slug: string | null }>`
      select role, house_slug from profiles where user_id = ${context.userId} limit 1
    `;
    const slug = profile[0]?.house_slug;
    if (!slug || profile[0]?.role !== "house") return { ok: false as const, error: "Espace recruteur requis." };
    const course = await sql<{ id: number; company_id: number }>`
      select a.id, a.company_id from academy_courses a
      join companies c on c.id = a.company_id
      where a.id = ${courseId} and c.slug = ${slug} limit 1
    `;
    if (!course[0]) return { ok: false as const, error: "Parcours hors de votre entreprise." };
    const learners = await sql<{ user_id: string }>`
      select user_id from academy_members where company_id = ${course[0].company_id}
    `;
    for (const l of learners) {
      await sql`
        insert into academy_enrollments (user_id, course_id, status, assigned_by)
        values (${l.user_id}, ${courseId}, ${"assigned"}, ${context.userId})
        on conflict (user_id, course_id) do nothing
      `;
    }
    return { ok: true as const, n: learners.length };
  });
