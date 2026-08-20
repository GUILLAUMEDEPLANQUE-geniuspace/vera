import type { CultureProfile } from "./culture";

export type SimBeat = {
  prompt: string;
  choices: { id: string; text: string; ok: boolean; why: string }[];
};

export function cultureSim(slug: string, culture: CultureProfile): { brief: string; beats: SimBeat[] } {
  if (slug === "northline" || culture.intercultural >= 85) {
    return {
      brief: "Un partenaire singapourien dit « maybe we can consider ». Votre VP européen veut un yes/no ce soir.",
      beats: [
        {
          prompt: "Vous :",
          choices: [
            {
              id: "a",
              text: "Vous recadrez en visio élargie : « on a besoin d’un oui clair ».",
              ok: false,
              why: "Vous avez coincé la face en public. Le maybe vient de mourir.",
            },
            {
              id: "b",
              text: "Vous remerciez, vous proposez un canal à deux, vous reformulez les trois points encore ouverts.",
              ok: true,
              why: "La face reste intacte. Le maybe devient une liste. C’est le métier.",
            },
            {
              id: "c",
              text: "Vous ignorez et relancez le lendemain comme si de rien n’était.",
              ok: false,
              why: "Le silence européen se lit comme du mépris, pas de la patience.",
            },
          ],
        },
        {
          prompt: "Il envoie un emoji pouce. Votre VP : « on signe ? » Vous :",
          choices: [
            {
              id: "a",
              text: "Oui. Un pouce, c’est un oui.",
              ok: false,
              why: "Un pouce n’est pas un contrat. Vous venez de bruler un trimestre.",
            },
            {
              id: "b",
              text: "Non. Vous renvoyez un résumé écrit des points d’accord, à corriger.",
              ok: true,
              why: "L’écrit sauve. Northline vit aux contrats, pas aux emojis.",
            },
          ],
        },
      ],
    };
  }
  if (slug === "atelier-nord" || culture.axes.directness >= 85) {
    return {
      brief: "Critique quotidienne. On vient de dire que votre système est « lâche sur la typo ».",
      beats: [
        {
          prompt: "Vous :",
          choices: [
            {
              id: "a",
              text: "Vous défendez le fichier, l’équipe française se sentirait humiliée.",
              ok: false,
              why: "Ici la critique n’est pas une humiliation. Se défendre sans preuve l’est.",
            },
            {
              id: "b",
              text: "Vous demandez deux exemples, vous notez, vous revenez demain avec une règle.",
              ok: true,
              why: "C’est le geste Atelier Nord. La face n’est pas le sujet. La règle, si.",
            },
            {
              id: "c",
              text: "Vous souriez et vous changez de sujet.",
              ok: false,
              why: "Lu comme du mépris. On n’embauche pas le confort.",
            },
          ],
        },
      ],
    };
  }
  if (slug === "sable" || culture.axes.writing >= 85) {
    return {
      brief: "Un mid veut un call de 45 min « pour s’aligner ». C’est mercredi.",
      beats: [
        {
          prompt: "Vous :",
          choices: [
            {
              id: "a",
              text: "Vous prenez le call. L’humain d’abord.",
              ok: false,
              why: "Mercredi est mort. L’humain, ici, écrit. Vous venez de casser la maison.",
            },
            {
              id: "b",
              text: "Vous renvoyez : trois bullets, une décision demandée, RFC jeudi si ça dépasse 20 min.",
              ok: true,
              why: "Sable. L’écriture n’est pas une préférence. C’est l’infra.",
            },
          ],
        },
      ],
    };
  }
  return {
    brief: "Un N+1 change un arbitrage en réunion, sans écrit. L’équipe regarde.",
    beats: [
      {
        prompt: "Vous :",
        choices: [
          {
            id: "a",
            text: "Vous recadrez en public pour « poser un cadre ».",
            ok: culture.axes.directness >= 70 && culture.axes.hierarchy < 50,
            why:
              culture.axes.hierarchy >= 65
                ? "Ici la hiérarchie se recadre à deux, pas en spectacle."
                : "Franc et plat : le recadrage public est acceptable s’il est factuel. Sinon, non.",
          },
          {
            id: "b",
            text: "Vous notez, vous envoyez un écrit de 8 lignes après, copie l’équipe.",
            ok: true,
            why: "L’écrit protège tout le monde. C’est le défaut Vera.",
          },
          {
            id: "c",
            text: "Vous laissez passer. Ce n’est pas le moment.",
            ok: false,
            why: "Le moment, c’est maintenant. Demain l’arbitrage fantôme sera « décidé ».",
          },
        ],
      },
    ],
  };
}
