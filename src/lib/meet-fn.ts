import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "./auth/middleware";
import { seedCck } from "./cck-seed";
import { getSql } from "./db";
import { ensureSeeded } from "./seed";
import { WEEKDAYS } from "./weekdays";

export type MeetSlot = {
  id: number;
  weekday: number;
  weekdayLabel: string;
  startHour: number;
  minutes: number;
  seats: number;
  taken: number;
  kind: string;
  place: string;
  nextDay: string;
};

function nextDate(weekday: number): string {
  const now = new Date();
  const day = now.getDay() === 0 ? 7 : now.getDay();
  let delta = weekday - day;
  if (delta <= 0) delta += 7;
  const d = new Date(now);
  d.setDate(now.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

async function ready() {
  const sql = await getSql();
  await ensureSeeded(sql);
  await seedCck(sql);
  return sql;
}

export const listMeetSlots = createServerFn({ method: "POST" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }): Promise<MeetSlot[]> => {
    const sql = await ready();
    const rows = await sql<{
      id: number;
      weekday: number;
      start_hour: number;
      minutes: number;
      seats: number;
      kind: string;
      place: string;
    }>`
      select s.id, s.weekday, s.start_hour, s.minutes, s.seats, s.kind, s.place
      from meet_slots s
      join companies c on c.id = s.company_id
      where c.slug = ${slug}
      order by s.weekday, s.start_hour
    `;
    const out: MeetSlot[] = [];
    for (const r of rows) {
      const day = nextDate(r.weekday);
      const [{ n }] = await sql<{ n: number }>`
        select count(*)::int as n from meet_bookings
        where slot_id = ${r.id} and day = ${day} and status = ${"held"}
      `;
      out.push({
        id: r.id,
        weekday: r.weekday,
        weekdayLabel: WEEKDAYS[r.weekday] ?? String(r.weekday),
        startHour: r.start_hour,
        minutes: r.minutes,
        seats: r.seats,
        taken: n,
        kind: r.kind,
        place: r.place,
        nextDay: day,
      });
    }
    return out;
  });

export const bookMeet = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((slotId: number) => slotId)
  .handler(async ({ context, data: slotId }) => {
    const sql = await ready();
    const slots = await sql<{ id: number; weekday: number; seats: number }>`
      select id, weekday, seats from meet_slots where id = ${slotId} limit 1
    `;
    if (!slots[0]) return { ok: false as const, error: "Créneau introuvable." };
    const day = nextDate(slots[0].weekday);
    const [{ n }] = await sql<{ n: number }>`
      select count(*)::int as n from meet_bookings
      where slot_id = ${slotId} and day = ${day} and status = ${"held"}
    `;
    if (n >= slots[0].seats) return { ok: false as const, error: "Complet." };
    await sql`
      insert into meet_bookings (slot_id, user_id, day, status)
      values (${slotId}, ${context.userId}, ${day}, ${"held"})
      on conflict (slot_id, user_id, day) do nothing
    `;
    return { ok: true as const, day };
  });

export const listAcademyProofs = createServerFn({ method: "POST" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const sql = await ready();
    const houses = await sql<{ id: number }>`select id from companies where slug = ${slug} limit 1`;
    if (!houses[0]) return { hires: [], held: 0, completed: 0 };
    const hires = await sql<{ course_slug: string; hired: number; held: number; title: string }>`
      select h.course_slug, h.hired, h.held, coalesce(a.title, h.course_slug) as title
      from academy_hires h
      left join academy_courses a on a.company_id = h.company_id and a.slug = h.course_slug
      where h.company_id = ${houses[0].id}
    `;
    const [{ held }] = await sql<{ held: number }>`
      select count(*)::int as held from academy_enrollments e
      join academy_courses a on a.id = e.course_id
      where a.company_id = ${houses[0].id}
    `;
    const [{ completed }] = await sql<{ completed: number }>`
      select count(*)::int as completed from academy_enrollments e
      join academy_courses a on a.id = e.course_id
      where a.company_id = ${houses[0].id} and e.status = ${"completed"}
    `;
    return { hires, held, completed };
  });
