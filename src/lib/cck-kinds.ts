export type CckKind =
  | "text"
  | "textarea"
  | "html"
  | "email"
  | "url"
  | "tel"
  | "bool"
  | "checkbox"
  | "radio"
  | "choice"
  | "multi"
  | "autocomplete"
  | "number"
  | "datetime"
  | "scale"
  | "image"
  | "gallery"
  | "video"
  | "audio"
  | "file"
  | "media"
  | "relation"
  | "status";

/** JoomCCK free field plugins → Vera kinds. passwd / paytodownload / readmore / og stay Joomla. */
export const CCK_KINDS: { id: CckKind; label: string; group: string; joom: string }[] = [
  { id: "text", label: "Texte", group: "Texte", joom: "text" },
  { id: "textarea", label: "Long", group: "Texte", joom: "textarea" },
  { id: "html", label: "HTML", group: "Texte", joom: "html" },
  { id: "email", label: "E-mail", group: "Texte", joom: "email" },
  { id: "url", label: "URL", group: "Texte", joom: "url" },
  { id: "tel", label: "Téléphone", group: "Texte", joom: "telephone" },
  { id: "bool", label: "Oui / non", group: "Choix", joom: "boolean" },
  { id: "checkbox", label: "Cases", group: "Choix", joom: "checkbox" },
  { id: "radio", label: "Radio", group: "Choix", joom: "radio" },
  { id: "choice", label: "Liste", group: "Choix", joom: "select" },
  { id: "multi", label: "Plusieurs", group: "Choix", joom: "multiselect" },
  { id: "autocomplete", label: "Autocomplete", group: "Choix", joom: "listautocomplete" },
  { id: "number", label: "Nombre", group: "Date / nombre", joom: "digits" },
  { id: "datetime", label: "Date", group: "Date / nombre", joom: "datetime" },
  { id: "scale", label: "Échelle", group: "Date / nombre", joom: "—" },
  { id: "image", label: "Image", group: "Médias", joom: "image" },
  { id: "gallery", label: "Galerie", group: "Médias", joom: "gallery" },
  { id: "video", label: "Vidéo", group: "Médias", joom: "video" },
  { id: "audio", label: "Audio", group: "Médias", joom: "audio" },
  { id: "file", label: "Fichier", group: "Médias", joom: "uploads" },
  { id: "media", label: "Média (legacy)", group: "Médias", joom: "image" },
  { id: "relation", label: "Fiche liée", group: "Relations", joom: "records" },
  { id: "status", label: "Statut", group: "Affichage", joom: "status" },
];

export const CCK_KIND_IDS: CckKind[] = CCK_KINDS.map((k) => k.id);

export function isCckKind(v: string): v is CckKind {
  return (CCK_KIND_IDS as string[]).includes(v);
}
