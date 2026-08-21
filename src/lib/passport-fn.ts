import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { parseJsonList } from "@/lib/format";
import { ensureSeeded } from "@/lib/seed";

export type LedgerRow = {
  id: number;
  arenaId: string;
  skillTag: string;
  title: string;
  score: number;
  passed: boolean;
  attemptNo: number;
  evidence: string;
  createdAt: string;
};

export type AttemptRow = {
  arenaId: string;
  score: number;
  passed: boolean;
  missed: string[];
  attemptNo: number;
  createdAt: string;
};

export const listMyPassport = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ ledger: LedgerRow[]; attempts: AttemptRow[]; lessons: string[] }> => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const ledger = await sql<{
      id: number;
      arena_id: string;
      skill_tag: string;
      title: string;
      score: number;
      passed: boolean;
      attempt_no: number;
      evidence: string;
      created_at: string;
    }>`
      select id, arena_id, skill_tag, title, score, passed, attempt_no, evidence, created_at
      from skill_ledger
      where user_id = ${context.userId}
      order by created_at desc
    `;
    const attempts = await sql<{
      arena_id: string;
      score: number;
      passed: boolean;
      missed_json: string;
      attempt_no: number;
      created_at: string;
    }>`
      select arena_id, score, passed, missed_json, attempt_no, created_at
      from arena_attempts
      where user_id = ${context.userId}
      order by created_at desc
      limit 40
    `;
    const lessons = await sql<{ lesson_slug: string }>`
      select lesson_slug from lessons_done where user_id = ${context.userId}
    `;
    return {
      ledger: ledger.map((r) => ({
        id: r.id,
        arenaId: r.arena_id,
        skillTag: r.skill_tag,
        title: r.title,
        score: r.score,
        passed: r.passed,
        attemptNo: r.attempt_no,
        evidence: r.evidence,
        createdAt: r.created_at,
      })),
      attempts: attempts.map((r) => ({
        arenaId: r.arena_id,
        score: r.score,
        passed: r.passed,
        missed: parseJsonList(r.missed_json),
        attemptNo: r.attempt_no,
        createdAt: r.created_at,
      })),
      lessons: lessons.map((r) => r.lesson_slug),
    };
  });

export const recordArenaAttempt = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { arenaId: string; score: number; passed: boolean; missed: string[]; title: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureSeeded(sql);
    const prev = await sql<{ n: number }>`
      select count(*)::int as n from arena_attempts
      where user_id = ${context.userId} and arena_id = ${data.arenaId}
    `;
    const attemptNo = (prev[0]?.n ?? 0) + 1;
    await sql`
      insert into arena_attempts (user_id, arena_id, score, passed, missed_json, attempt_no)
      values (
        ${context.userId}, ${data.arenaId}, ${data.score}, ${data.passed},
        ${JSON.stringify(data.missed)}, ${attemptNo}
      )
    `;
    if (data.passed) {
      await sql`
        insert into skill_ledger (user_id, arena_id, skill_tag, title, score, passed, attempt_no, evidence)
        values (
          ${context.userId}, ${data.arenaId}, ${data.arenaId}, ${data.title}, ${data.score},
          true, ${attemptNo}, ${`arena:${data.arenaId}:attempt:${attemptNo}`}
        )
      `;
    }
    return { attemptNo };
  });
