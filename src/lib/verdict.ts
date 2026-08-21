import type { GhostRisk, Profile } from "./types";

export type VerdictDecision = "go" | "ask" | "pass";

export type VerdictReason = {
  tone: "good" | "warn" | "bad";
  text: string;
};

export type Verdict = {
  decision: VerdictDecision;
  label: string;
  score: number;
  hours: number;
  payDelta: number | null;
  honor: number;
  slaDays: number;
  reasons: VerdictReason[];
};

const LABEL: Record<VerdictDecision, string> = {
  go: "Allez-y",
  ask: "Posez la question",
  pass: "Passez",
};

export function computeVerdict(input: {
  ghostRisk: GhostRisk;
  hiringVelocity: string;
  honorScore: number;
  honorDue: number;
  slaDays: number;
  hours: number;
  match: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  marketMedian: number | null;
  profile: Pick<Profile, "salaryMin" | "salaryMax"> | null;
}): Verdict {
  const reasons: VerdictReason[] = [];
  let score = 72;

  if (input.ghostRisk === "high") {
    score -= 42;
    reasons.push({ tone: "bad", text: "Ghost probable. Votre soirée vaut plus que leur filet à CV." });
  } else if (input.ghostRisk === "medium") {
    score -= 14;
    reasons.push({ tone: "warn", text: "Pipeline lent. Demandez la date de décision avant le cas." });
  } else {
    score += 6;
    reasons.push({ tone: "good", text: "Annonce vivante — le radar ghost est clair." });
  }

  if (input.hiringVelocity === "frozen") {
    score -= 30;
    reasons.push({ tone: "bad", text: "Embauche gelée. Le pacte ne peut pas être tenu." });
  }

  if (input.honorDue === 0) {
    reasons.push({ tone: "warn", text: "Nouveau pacte : pas encore de dossier clos sur Vera." });
  } else if (input.honorScore < 65) {
    score -= 22;
    reasons.push({
      tone: "bad",
      text: `Honneur ${input.honorScore}. Cette entreprise manque trop souvent sa date.`,
    });
  } else if (input.honorScore < 82) {
    score -= 8;
    reasons.push({ tone: "warn", text: `Honneur ${input.honorScore}. Des retards, pas encore un désastre.` });
  } else if (input.honorScore >= 94) {
    score += 8;
    reasons.push({ tone: "good", text: `Honneur ${input.honorScore}. Elles répondent vraiment.` });
  }

  if (input.slaDays <= 7) {
    score += 5;
    reasons.push({ tone: "good", text: `Pacte serré : réponse sous ${input.slaDays} jours.` });
  } else if (input.slaDays > 14) {
    score -= 8;
    reasons.push({ tone: "warn", text: `SLA de ${input.slaDays} jours — trop long pour un senior occupé.` });
  }

  if (input.hours > 10) {
    score -= 10;
    reasons.push({ tone: "warn", text: `${input.hours} h de process. N’y allez que si le signal est haut.` });
  } else if (input.hours <= 4) {
    score += 5;
    reasons.push({ tone: "good", text: `Process court (${input.hours} h). Le respect du temps est écrit.` });
  } else {
    reasons.push({ tone: "good", text: `Process publié : ${input.hours} h, pas une boîte noire.` });
  }

  if (input.match != null) {
    if (input.match >= 80) {
      score += 10;
      reasons.push({ tone: "good", text: `Signal ${input.match}. L’adéquation n’est pas cosmétique.` });
    } else if (input.match < 48) {
      score -= 14;
      reasons.push({ tone: "warn", text: `Signal ${input.match}. Vous compenserez par le récit, ou vous perdrez du temps.` });
    }
  }

  let payDelta: number | null = null;
  if (input.profile?.salaryMin && input.salaryMax) {
    payDelta = input.salaryMax - input.profile.salaryMin;
    if (payDelta < 0) {
      score -= 24;
      reasons.push({
        tone: "bad",
        text: `Le plafond est sous votre plancher (${Math.round(Math.abs(payDelta) / 1000)} k€).`,
      });
    } else if (payDelta >= 8000) {
      score += 6;
      reasons.push({ tone: "good", text: "La fourchette couvre votre plancher, avec de la marge." });
    } else {
      reasons.push({ tone: "warn", text: "La fourchette touche juste votre plancher. Négociez tôt." });
    }
  } else if (input.marketMedian && input.salaryMax) {
    payDelta = input.salaryMax - input.marketMedian;
    if (payDelta < -8000) {
      score -= 8;
      reasons.push({ tone: "warn", text: "Sous la médiane du secteur visible sur Vera." });
    }
  }

  score = Math.max(4, Math.min(98, Math.round(score)));

  let decision: VerdictDecision = "ask";
  if (input.ghostRisk === "high" || input.hiringVelocity === "frozen" || score < 40) {
    decision = "pass";
  } else if (score >= 70 && input.ghostRisk === "low") {
    decision = "go";
  }

  return {
    decision,
    label: LABEL[decision],
    score,
    hours: input.hours,
    payDelta,
    honor: input.honorScore,
    slaDays: input.slaDays,
    reasons: reasons.slice(0, 5),
  };
}
