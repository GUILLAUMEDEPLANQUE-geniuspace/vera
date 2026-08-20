import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./auth/middleware";
import { getSql } from "./db";
import { parseJsonList } from "./format";
import { ensureSeeded } from "./seed";
import { briefScore, type Brief, type ShippedItem } from "./types";

function parseShipped(raw: string | null | undefined): ShippedItem[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const row = item as { title?: unknown; impact?: unknown; year?: unknown };
      return [
        {
          title: String(row.title ?? ""),
          impact: String(row.impact ?? ""),
          year: String(row.year ?? ""),
        },
      ];
    });
  } catch {
    return [];
  }
}

function emptyBrief(userId: string): Brief {
  return {
    userId,
    shipped: [
      { title: "", impact: "", year: "" },
      { title: "", impact: "", year: "" },
      { title: "", impact: "", year: "" },
    ],
    refuse: [],
    nextChapter: "",
    workingStyle: "",
    updatedAt: null,
  };
}

function mapBrief(
  row: {
    user_id: string;
    shipped_json: string;
    refuse_json: string;
    next_chapter: string | null;
    working_style: string | null;
    updated_at: string;
  },
): Brief {
  const shipped = parseShipped(row.shipped_json);
  while (shipped.length < 3) shipped.push({ title: "", impact: "", year: "" });
  return {
    userId: row.user_id,
    shipped: shipped.slice(0, 5),
    refuse: parseJsonList(row.refuse_json),
    nextChapter: row.next_chapter,
    workingStyle: row.working_style,
    updatedAt: String(row.updated_at),
  };
}

export const getMyBrief = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ brief: Brief; score: number }> => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const rows = await sql<{
      user_id: string;
      shipped_json: string;
      refuse_json: string;
      next_chapter: string | null;
      working_style: string | null;
      updated_at: string;
    }>`select * from briefs where user_id = ${context.userId} limit 1`;
    const brief = rows[0] ? mapBrief(rows[0]) : emptyBrief(context.userId);
    return { brief, score: briefScore(brief) };
  });

export type BriefInput = {
  shipped: ShippedItem[];
  refuse: string[];
  nextChapter: string;
  workingStyle: string;
};

export const saveBrief = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: BriefInput) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const shipped = data.shipped
      .map((s) => ({
        title: s.title.trim(),
        impact: s.impact.trim(),
        year: s.year.trim(),
      }))
      .filter((s) => s.title || s.impact);
    const refuse = data.refuse.map((s) => s.trim()).filter(Boolean);
    await sql`
      insert into briefs (user_id, shipped_json, refuse_json, next_chapter, working_style, updated_at)
      values (
        ${context.userId},
        ${JSON.stringify(shipped)},
        ${JSON.stringify(refuse)},
        ${data.nextChapter.trim()},
        ${data.workingStyle.trim()},
        now()
      )
      on conflict (user_id) do update set
        shipped_json = excluded.shipped_json,
        refuse_json = excluded.refuse_json,
        next_chapter = excluded.next_chapter,
        working_style = excluded.working_style,
        updated_at = now()
    `;
    return { ok: true as const, score: briefScore({ shipped, refuse, nextChapter: data.nextChapter, workingStyle: data.workingStyle }) };
  });

export const toggleQuietSignal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((jobId: number) => jobId)
  .handler(async ({ context, data: jobId }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const existing = await sql<{ n: number }>`
      select count(*)::int as n from quiet_signals where user_id = ${context.userId} and job_id = ${jobId}
    `;
    if ((existing[0]?.n ?? 0) > 0) {
      await sql`delete from quiet_signals where user_id = ${context.userId} and job_id = ${jobId}`;
      return { raised: false };
    }
    await sql`insert into quiet_signals (user_id, job_id) values (${context.userId}, ${jobId})`;
    return { raised: true };
  });
