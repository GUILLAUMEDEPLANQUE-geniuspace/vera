import { VOLUME_PACT } from "./seed-volume";

export const HOUSE_PACT: Record<
  string,
  { slaDays: number; honorScore: number; honorAnswered: number; honorDue: number }
> = {
  lumina: { slaDays: 10, honorScore: 94, honorAnswered: 67, honorDue: 71 },
  sable: { slaDays: 7, honorScore: 97, honorAnswered: 89, honorDue: 92 },
  mireille: { slaDays: 12, honorScore: 91, honorAnswered: 52, honorDue: 57 },
  orbital: { slaDays: 14, honorScore: 88, honorAnswered: 44, honorDue: 50 },
  "atelier-nord": { slaDays: 7, honorScore: 98, honorAnswered: 41, honorDue: 42 },
  helios: { slaDays: 10, honorScore: 82, honorAnswered: 61, honorDue: 74 },
  "maison-vale": { slaDays: 21, honorScore: 61, honorAnswered: 28, honorDue: 46 },
  northline: { slaDays: 10, honorScore: 90, honorAnswered: 38, honorDue: 42 },
  kora: { slaDays: 8, honorScore: 93, honorAnswered: 33, honorDue: 35 },
  relais: { slaDays: 14, honorScore: 44, honorAnswered: 11, honorDue: 25 },
  releve: { slaDays: 7, honorScore: 96, honorAnswered: 54, honorDue: 56 },
  lise: { slaDays: 8, honorScore: 95, honorAnswered: 47, honorDue: 49 },
  "armor-volt": { slaDays: 8, honorScore: 91, honorAnswered: 18, honorDue: 20 },
  "loire-chaleur": { slaDays: 10, honorScore: 88, honorAnswered: 22, honorDue: 25 },
  "flandre-soin": { slaDays: 9, honorScore: 86, honorAnswered: 31, honorDue: 36 },
  "rhin-atome": { slaDays: 10, honorScore: 90, honorAnswered: 16, honorDue: 18 },
  "garonne-toits": { slaDays: 8, honorScore: 84, honorAnswered: 11, honorDue: 13 },
  "alpes-chantier": { slaDays: 9, honorScore: 87, honorAnswered: 14, honorDue: 16 },
  "midi-soin": { slaDays: 8, honorScore: 89, honorAnswered: 19, honorDue: 21 },
  "finistere-routes": { slaDays: 10, honorScore: 83, honorAnswered: 27, honorDue: 32 },
  "aether-ops": { slaDays: 7, honorScore: 96, honorAnswered: 28, honorDue: 29 },
  "nimbus-eu": { slaDays: 7, honorScore: 95, honorAnswered: 41, honorDue: 43 },
  "willem-soc": { slaDays: 8, honorScore: 92, honorAnswered: 22, honorDue: 24 },
  "lumen-nordic": { slaDays: 10, honorScore: 90, honorAnswered: 17, honorDue: 19 },
  "emc-munich": { slaDays: 9, honorScore: 94, honorAnswered: 12, honorDue: 13 },
  "fhir-berlin": { slaDays: 12, honorScore: 89, honorAnswered: 15, honorDue: 17 },
  ...VOLUME_PACT,
};

export function honorTone(score: number): "good" | "warn" | "bad" {
  if (score >= 88) return "good";
  if (score >= 72) return "warn";
  return "bad";
}

export function honorCaption(score: number, due: number): string {
  if (due === 0) return "Nouveau pacte";
  if (score >= 94) return "Pacte tenu";
  if (score >= 82) return "Pacte correct";
  if (score >= 70) return "Pacte fragile";
  return "Pacte rompu";
}

export function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.ceil((t - Date.now()) / 86_400_000);
}

export function recalcHonor(answered: number, due: number): number {
  if (due <= 0) return 100;
  return Math.max(20, Math.min(99, Math.round((answered / due) * 100)));
}
