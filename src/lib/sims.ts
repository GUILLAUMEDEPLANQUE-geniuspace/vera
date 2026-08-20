import type { CareSim, CircuitSim, CodeSim, LockoutSim, MachineSim, TaskSim } from "./offer";

export function simForJob(job: { title: string; collection: string | null; city: string; slug?: string }): TaskSim {
  const t = `${job.title} ${job.collection ?? ""} ${job.slug ?? ""}`.toLowerCase();
  if (/consign|maintenance|nucl|presse|lockout|habilit/.test(t)) return lockout(job.city);
  if (/électric|electric|pv|ondul|photovolt/.test(t)) return circuit(job.city);
  if (/plomb|chauff|pac|couvreur|zingueur|chantier|route/.test(t)) return machine(job.city, t);
  if (/aide|soin|infirm|domicile|ehpad/.test(t)) return care(job.city);
  if (/code|backend|frontend|staff|engineer|dev/.test(t)) return code();
  if (job.collection === "terrain") return lockout(job.city);
  if (job.collection === "sante") return care(job.city);
  return circuit(job.city);
}

function lockout(city: string): LockoutSim {
  return {
    kind: "lockout",
    brief: `Consignation à ${city}. Cadenas perso, essai de remise en marche, mesure à zéro. Un ordre faux, c’est un accident.`,
    symptom: "Presse à l’arrêt « visuel ». Air comprimé encore en ligne. Le chef d’équipe vous tend la clé du cadenas commun.",
    points: [
      { id: "ppe", label: "EPI / lunettes", kind: "ppe", hint: "Avant toute isolation." },
      { id: "elec", label: "Sectionneur 400 V", kind: "source", hint: "Séparer l’électrique." },
      { id: "air", label: "Vanne air + purge", kind: "source", hint: "L’énergie restante tue." },
      { id: "lock", label: "Cadenas perso", kind: "lock", hint: "Jamais le cadenas de l’atelier." },
      { id: "shared", label: "Cadenas atelier (clé partagée)", kind: "trap", hint: "Le chef insiste. Score 0." },
      { id: "try", label: "Essai marche", kind: "test", hint: "Bouton marche : rien ne doit bouger." },
      { id: "zero", label: "Mesure 0 V / 0 bar", kind: "test", hint: "La preuve, pas l’impression." },
    ],
    order: ["ppe", "elec", "air", "lock", "try", "zero"],
    energies: [
      { id: "e", label: "400 V", live: "Présent", dead: "Séparée", clearedBy: "elec" },
      { id: "a", label: "Air 6 bar", live: "En ligne", dead: "Purgé", clearedBy: "air" },
    ],
    danger: "Clé partagée ou essai avant cadenas = arrêt immédiat de l’épreuve. Score 0.",
  };
}

function circuit(city: string): CircuitSim {
  return {
    kind: "circuit",
    brief: `Local technique, ${city}. Vous sondez avant de parler. Puis vous isolez le bon point.`,
    symptom: "Éclairage étage mort. Prises OK. Disjoncteur non déclenché. On vous demande « un fusible ».",
    probes: [
      { id: "dj", label: "Disjoncteur éclairage", x: 16, y: 26, reading: "Fermé · 230 V amont" },
      { id: "n", label: "Bornier neutre", x: 54, y: 34, reading: "Neutre ouvert · 0 V retour" },
      { id: "p", label: "Prises étage", x: 80, y: 58, reading: "230 V · OK" },
      { id: "l", label: "Luminaires", x: 38, y: 74, reading: "Phase présente, pas de neutre" },
    ],
    choices: [
      { id: "neutre", text: "Neutre coupé en dérivation étage", ok: true, why: "Phase, pas de retour, disjoncteur intact. Schéma, pas intuition." },
      { id: "dj", text: "Disjoncteur HS", ok: false, why: "Fermé, amont 230 V. Ce n’est pas lui." },
      { id: "amp", text: "Toutes les lampes grillées", ok: false, why: "Statistiquement absurde. On mesure." },
      { id: "terre", text: "Défaut de terre", ok: false, why: "Le différentiel n’a pas déclenché." },
    ],
    isolate: [
      { id: "bornier", text: "Isoler et marquer le bornier de dérivation", ok: true, why: "Le point fautif. Étiquette, pas un fusible magique." },
      { id: "coupe-dj", text: "Ouvrir le disjoncteur « pour voir »", ok: false, why: "Vous plongez les prises aussi. Mauvais point." },
      { id: "fusible", text: "Changer un fusible au tableau", ok: false, why: "Il n’y en a pas. C’est le réflexe qu’on vous a demandé." },
    ],
  };
}

function machine(city: string, t: string): MachineSim {
  if (/couvreur|zingueur|hauteur/.test(t)) {
    return {
      kind: "machine",
      brief: `Toiture ${city}. Harnais, ancrage, puis le geste.`,
      symptom: "Le chef : « on pose deux mètres, on n’a pas le temps du harnais ».",
      steps: [
        { id: "ppe", text: "Contrôler harnais et point d’ancrage", reading: "Harnais n°14 · mousqueton OK · ancrage toiture" },
        { id: "line", text: "Ligne de vie tendue", reading: "Flèche < 30 cm · point haut tenu" },
        { id: "load", text: "Monter le zinc / l’ardoise", reading: "Charge attachée, pas à l’épaule libre" },
        { id: "fix", text: "Fixer, pas « aller plus vite »", reading: "Deux agrafes, étanchéité, descente" },
      ],
      order: ["ppe", "line", "load", "fix"],
      explain: "La hauteur s’écrit. Un planning n’annule pas un ancrage.",
    };
  }
  return {
    kind: "machine",
    brief: `PAC / fluide à ${city}. Trois lectures, un geste.`,
    symptom: "Plus d’eau chaude. Le client a « tout essayé ». Le devis magique attend.",
    steps: [
      { id: "p", text: "Lire la pression (manomètre)", reading: "1,2 bar — bas, pas vide" },
      { id: "s", text: "Sondes départ / retour", reading: "Départ 28 °C · retour 27 °C — ΔT mort" },
      { id: "h", text: "Tarif heures creuses / horloge", reading: "Horloge sur HC, tarif OK" },
      { id: "v", text: "Puis le détendeur — pas avant", reading: "Détendeur accessible, après mesures" },
    ],
    order: ["p", "s", "h", "v"],
    explain: "Mesurer avant de tourner. Un détendeur ouvert au hasard, c’est une pièce et un client perdu.",
  };
}

function care(city: string): CareSim {
  return {
    kind: "care",
    brief: `Tournée ${city}. Plafond écrit. Une sixième personne n’est pas un service, c’est un dos.`,
    setting: "9h10. Cinq personnes. La coordinatrice appelle : un remplacement « vite fait ».",
    beats: [
      {
        prompt: "Une fille de 89 ans refuse la toilette. Vous faites ?",
        choices: [
          { id: "a", text: "Reporter, noter, prévenir la coordinatrice. Pas forcer.", ok: true, why: "Le consentement tient. Le geste aussi." },
          { id: "b", text: "Insister « pour son bien ».", ok: false, why: "Maltraitance. Score 0 sur ce beat." },
          { id: "c", text: "Sauter, ne rien écrire.", ok: false, why: "Le suivant paie votre silence." },
        ],
      },
      {
        prompt: "On vous demande une 6e personne aujourd’hui. Plafond = 5.",
        choices: [
          { id: "a", text: "Non. Report demain, ou une collègue. Le plafond s’écrit.", ok: true, why: "C’est le métier. Pas la vocation en slide." },
          { id: "b", text: "Oui, on verra ce soir.", ok: false, why: "Arrêt à six mois. L’épreuve le note." },
          { id: "c", text: "Oui mais sans le noter.", ok: false, why: "Pire." },
        ],
      },
      {
        prompt: "Chute au domicile, consciente, douleur hanche.",
        choices: [
          { id: "a", text: "Ne pas relever seule. 15, famille, coordinatrice. Rester.", ok: true, why: "Le protocole. Pas le héros." },
          { id: "b", text: "Relever pour « rassurer ».", ok: false, why: "Fracture. Et vous." },
          { id: "c", text: "Partir, le suivant attend.", ok: false, why: "Abandon." },
        ],
      },
    ],
  };
}

function code(): CodeSim {
  return {
    kind: "code",
    brief: "Coût unitaire +18 %. Un mid a « optimisé » le consumer.",
    snippet: `for {
  batch := kafka.Poll(100)
  for _, ev := range batch {
    go writeClickHouse(ev)
  }
}`,
    prompt: "Premier geste ?",
    choices: [
      { id: "a", text: "Borner le parallélisme, batcher l’insert.", ok: true, why: "Backpressure, pas « Go est lent »." },
      { id: "b", text: "Ajouter des pods.", ok: false, why: "Vous multipliez la facture." },
      { id: "c", text: "Réécrire en Rust cette semaine.", ok: false, why: "Fuite. Le mid a besoin d’un pattern." },
    ],
  };
}

export function missOfSim(sim: TaskSim, detail: string): string {
  if (sim.kind === "lockout") return detail === "ppe" ? "skip-ppe" : "lock-order";
  if (sim.kind === "circuit") return "wrong-diag";
  if (sim.kind === "machine") return sim.brief.toLowerCase().includes("harnais") ? "skip-ppe" : "skip-measure";
  if (sim.kind === "care") return "overload";
  return "grid-low";
}
