import { slugify } from "./format";
import type { JobListItem } from "./types";

export type GeoRegion = {
  slug: string;
  name: string;
  code: string;
  tension: number;
  salaryIndex: number;
  metiers: string[];
  intro: string;
};

export type GeoDept = {
  code: string;
  slug: string;
  name: string;
  prefecture: string;
  region: string;
  tension: number;
  salaryIndex: number;
  metiers: string[];
};

export type GeoCity = {
  slug: string;
  name: string;
  dept: string;
  extra?: boolean;
};

/** 13 métropole + Corse + 5 DROM. Tension / index salarial (France = 100) calés BMO 2026. */
export const REGIONS: GeoRegion[] = [
  { slug: "ile-de-france", name: "Île-de-France", code: "11", tension: 68, salaryIndex: 118, metiers: ["staff engineer", "risk", "product designer"], intro: "Salaires hauts, process longs, ghost fréquent. Vera n’y indexe que le salaire publié et le pacte daté." },
  { slug: "auvergne-rhone-alpes", name: "Auvergne-Rhône-Alpes", code: "84", tension: 76, salaryIndex: 102, metiers: ["auxiliaire de vie", "maintenance", "nucléaire"], intro: "Soin à domicile, industrie, vallée nucléaire. Lyon et Grenoble tirent. Les tournées à 9 personnes n’entrent pas." },
  { slug: "nouvelle-aquitaine", name: "Nouvelle-Aquitaine", code: "75", tension: 64, salaryIndex: 96, metiers: ["couvreur", "aide-soignant", "chauffagiste"], intro: "Artisanat qui cède, littoral qui recrute mal. Bordeaux paie, le Lot-et-Garonne cherche un geste." },
  { slug: "occitanie", name: "Occitanie", code: "76", tension: 71, salaryIndex: 97, metiers: ["GNC", "solaire", "aide à domicile"], intro: "Toulouse aéro, Montpellier soin, Pyrénées chantier. Un staff embarqué n’est pas un commercial inbound." },
  { slug: "hauts-de-france", name: "Hauts-de-France", code: "32", tension: 79, salaryIndex: 93, metiers: ["aide-soignant", "logistique", "maintenance"], intro: "Industrie et médico-social sous tension. Lille n’est pas un hub slides. Le geste compte." },
  { slug: "grand-est", name: "Grand Est", code: "44", tension: 74, salaryIndex: 98, metiers: ["nucléaire", "industrie", "logistique"], intro: "Rhin, Moselle, Ardennes. Maintenance et transfrontalier. L’allemand de chantier est un critère, pas un plus." },
  { slug: "provence-alpes-cote-dazur", name: "Provence-Alpes-Côte d’Azur", code: "93", tension: 80, salaryIndex: 101, metiers: ["électricien PV", "chauffagiste", "couvreur"], intro: "Chaleur, ombrières, Fos. La prime chaleur s’écrit. Août à 13 h, ou ce n’est pas une offre." },
  { slug: "pays-de-la-loire", name: "Pays de la Loire", code: "52", tension: 70, salaryIndex: 99, metiers: ["plombier", "naval", "aide à domicile"], intro: "Nantes, Saint-Nazaire, Vendée. Chantier naval et artisanat. Les cédants ont un âge." },
  { slug: "bretagne", name: "Bretagne", code: "53", tension: 73, salaryIndex: 95, metiers: ["électricien PV", "agro", "soin"], intro: "Rennes tire le tertiaire. Le Finistère cherche des gestes. Formation OPCO écrite, ou on passe." },
  { slug: "normandie", name: "Normandie", code: "28", tension: 72, salaryIndex: 94, metiers: ["nucléaire", "maintenance", "transport"], intro: "Flamanville, Rouen, Le Havre. Astreinte écrite. Un 3×8 non nommé reste sur Indeed." },
  { slug: "bourgogne-franche-comte", name: "Bourgogne-Franche-Comté", code: "27", tension: 69, salaryIndex: 92, metiers: ["industrie", "aide à domicile", "machiniste"], intro: "Usines, soin rural, cédants. Un bassin étroit : le scarcity score y est honnête." },
  { slug: "centre-val-de-loire", name: "Centre-Val de Loire", code: "24", tension: 67, salaryIndex: 93, metiers: ["nucléaire", "logistique", "aide-soignant"], intro: "Loire, A10, CNPE. Orléans et Tours paient moins que Paris — Vera affiche l’écart." },
  { slug: "corse", name: "Corse", code: "94", tension: 61, salaryIndex: 91, metiers: ["bâtiment", "soin", "tourisme technique"], intro: "Saison, insularité, permis bateau parfois. Les offres « mobilité Corse » sans logement sont refusées." },
  { slug: "guadeloupe", name: "Guadeloupe", code: "01", tension: 66, salaryIndex: 88, metiers: ["soin", "BTP", "énergie"], intro: "Vie chère, salaires à dire. Une offre sans vie chère écrite n’entre pas." },
  { slug: "martinique", name: "Martinique", code: "02", tension: 65, salaryIndex: 88, metiers: ["soin", "BTP", "énergie"], intro: "Même exigence : salaire, pacte, freins périphériques nommés." },
  { slug: "guyane", name: "Guyane", code: "03", tension: 70, salaryIndex: 90, metiers: ["BTP", "santé", "spatial"], intro: "Kourou n’est pas un slide. Astreinte, prime éloignement, logement : écrits." },
  { slug: "la-reunion", name: "La Réunion", code: "04", tension: 68, salaryIndex: 89, metiers: ["soin", "BTP", "énergie"], intro: "Cyclone, relief, soin. Les fiches métropole copiées-collées restent dehors." },
  { slug: "mayotte", name: "Mayotte", code: "06", tension: 77, salaryIndex: 84, metiers: ["soin", "BTP", "éducation"], intro: "Tension maximale, moyens à dire. Vera n’indexe pas le théâtre humanitaire." },
];

type DeptRow = [string, string, string, string, string, number, number, string];

const DEPT_ROWS: DeptRow[] = [
  ["01", "ain", "Ain", "Bourg-en-Bresse", "auvergne-rhone-alpes", 62, 98, "industrie,plasturgie,aide à domicile"],
  ["02", "aisne", "Aisne", "Laon", "hauts-de-france", 71, 90, "aide-soignant,agro,logistique"],
  ["03", "allier", "Allier", "Moulins", "auvergne-rhone-alpes", 64, 89, "soin,industrie,reprise"],
  ["04", "alpes-de-haute-provence", "Alpes-de-Haute-Provence", "Digne-les-Bains", "provence-alpes-cote-dazur", 58, 92, "BTP,soin,tourisme technique"],
  ["05", "hautes-alpes", "Hautes-Alpes", "Gap", "provence-alpes-cote-dazur", 56, 93, "BTP,soin,saison"],
  ["06", "alpes-maritimes", "Alpes-Maritimes", "Nice", "provence-alpes-cote-dazur", 74, 104, "BTP,restauration technique,soin"],
  ["07", "ardeche", "Ardèche", "Privas", "auvergne-rhone-alpes", 63, 91, "nucléaire,soin,artisanat"],
  ["08", "ardennes", "Ardennes", "Charleville-Mézières", "grand-est", 72, 90, "industrie,maintenance,soin"],
  ["09", "ariege", "Ariège", "Foix", "occitanie", 57, 88, "soin,BTP,reprise"],
  ["10", "aube", "Aube", "Troyes", "grand-est", 65, 92, "logistique,soin,industrie"],
  ["11", "aude", "Aude", "Carcassonne", "occitanie", 66, 90, "BTP,viticulture technique,soin"],
  ["12", "aveyron", "Aveyron", "Rodez", "occitanie", 60, 89, "agro,soin,reprise"],
  ["13", "bouches-du-rhone", "Bouches-du-Rhône", "Marseille", "provence-alpes-cote-dazur", 84, 102, "électricien PV,maintenance Fos,BTP"],
  ["14", "calvados", "Calvados", "Caen", "normandie", 69, 95, "nucléaire,soin,BTP"],
  ["15", "cantal", "Cantal", "Aurillac", "auvergne-rhone-alpes", 55, 86, "soin,reprise,agro"],
  ["16", "charente", "Charente", "Angoulême", "nouvelle-aquitaine", 61, 91, "industrie,soin,reprise"],
  ["17", "charente-maritime", "Charente-Maritime", "La Rochelle", "nouvelle-aquitaine", 67, 96, "naval,soin,BTP"],
  ["18", "cher", "Cher", "Bourges", "centre-val-de-loire", 64, 90, "défense,industrie,soin"],
  ["19", "correze", "Corrèze", "Tulle", "nouvelle-aquitaine", 59, 88, "soin,industrie,reprise"],
  ["2A", "corse-du-sud", "Corse-du-Sud", "Ajaccio", "corse", 62, 92, "BTP,soin,énergie"],
  ["2B", "haute-corse", "Haute-Corse", "Bastia", "corse", 60, 90, "BTP,soin,saison"],
  ["21", "cote-dor", "Côte-d’Or", "Dijon", "bourgogne-franche-comte", 66, 96, "logistique,soin,agro"],
  ["22", "cotes-darmor", "Côtes-d’Armor", "Saint-Brieuc", "bretagne", 70, 93, "agro,soin,électricien"],
  ["23", "creuse", "Creuse", "Guéret", "nouvelle-aquitaine", 54, 84, "soin,reprise,BTP"],
  ["24", "dordogne", "Dordogne", "Périgueux", "nouvelle-aquitaine", 58, 88, "soin,BTP,reprise"],
  ["25", "doubs", "Doubs", "Besançon", "bourgogne-franche-comte", 71, 97, "industrie,horlogerie,soin"],
  ["26", "drome", "Drôme", "Valence", "auvergne-rhone-alpes", 68, 96, "nucléaire,industrie,soin"],
  ["27", "eure", "Eure", "Évreux", "normandie", 67, 94, "logistique,industrie,soin"],
  ["28", "eure-et-loir", "Eure-et-Loir", "Chartres", "centre-val-de-loire", 66, 95, "logistique,pharma,soin"],
  ["29", "finistere", "Finistère", "Quimper", "bretagne", 72, 94, "naval,agro,soin"],
  ["30", "gard", "Gard", "Nîmes", "occitanie", 69, 94, "nucléaire,BTP,soin"],
  ["31", "haute-garonne", "Haute-Garonne", "Toulouse", "occitanie", 78, 108, "GNC,aéro,soin"],
  ["32", "gers", "Gers", "Auch", "occitanie", 55, 86, "soin,agro,reprise"],
  ["33", "gironde", "Gironde", "Bordeaux", "nouvelle-aquitaine", 73, 104, "BTP,soin,aéronautique"],
  ["34", "herault", "Hérault", "Montpellier", "occitanie", 72, 99, "soin,BTP,énergie"],
  ["35", "ille-et-vilaine", "Ille-et-Vilaine", "Rennes", "bretagne", 75, 102, "électricien PV,numérique,soin"],
  ["36", "indre", "Indre", "Châteauroux", "centre-val-de-loire", 58, 87, "logistique,soin,défense"],
  ["37", "indre-et-loire", "Indre-et-Loire", "Tours", "centre-val-de-loire", 67, 96, "soin,logistique,industrie"],
  ["38", "isere", "Isère", "Grenoble", "auvergne-rhone-alpes", 77, 105, "industrie,nucléaire,BTP"],
  ["39", "jura", "Jura", "Lons-le-Saunier", "bourgogne-franche-comte", 63, 92, "industrie,lunetterie,soin"],
  ["40", "landes", "Landes", "Mont-de-Marsan", "nouvelle-aquitaine", 64, 92, "industrie bois,soin,BTP"],
  ["41", "loir-et-cher", "Loir-et-Cher", "Blois", "centre-val-de-loire", 62, 91, "logistique,soin,industrie"],
  ["42", "loire", "Loire", "Saint-Étienne", "auvergne-rhone-alpes", 73, 95, "industrie,soin,BTP"],
  ["43", "haute-loire", "Haute-Loire", "Le Puy-en-Velay", "auvergne-rhone-alpes", 57, 87, "soin,industrie,reprise"],
  ["44", "loire-atlantique", "Loire-Atlantique", "Nantes", "pays-de-la-loire", 76, 104, "naval,plombier,soin"],
  ["45", "loiret", "Loiret", "Orléans", "centre-val-de-loire", 68, 96, "logistique,pharma,soin"],
  ["46", "lot", "Lot", "Cahors", "occitanie", 54, 85, "soin,reprise,BTP"],
  ["47", "lot-et-garonne", "Lot-et-Garonne", "Agen", "nouvelle-aquitaine", 60, 88, "agro,soin,logistique"],
  ["48", "lozere", "Lozère", "Mende", "occitanie", 52, 83, "soin,reprise,BTP"],
  ["49", "maine-et-loire", "Maine-et-Loire", "Angers", "pays-de-la-loire", 71, 97, "industrie,soin,végétal"],
  ["50", "manche", "Manche", "Saint-Lô", "normandie", 74, 94, "nucléaire,naval,soin"],
  ["51", "marne", "Marne", "Châlons-en-Champagne", "grand-est", 66, 94, "logistique,agro,soin"],
  ["52", "haute-marne", "Haute-Marne", "Chaumont", "grand-est", 59, 87, "industrie,soin,reprise"],
  ["53", "mayenne", "Mayenne", "Laval", "pays-de-la-loire", 68, 93, "industrie,soin,agro"],
  ["54", "meurthe-et-moselle", "Meurthe-et-Moselle", "Nancy", "grand-est", 70, 96, "industrie,soin,transfrontalier"],
  ["55", "meuse", "Meuse", "Bar-le-Duc", "grand-est", 61, 88, "soin,industrie,Cigéo"],
  ["56", "morbihan", "Morbihan", "Vannes", "bretagne", 71, 95, "naval,soin,agro"],
  ["57", "moselle", "Moselle", "Metz", "grand-est", 73, 97, "industrie,logistique,transfrontalier"],
  ["58", "nievre", "Nièvre", "Nevers", "bourgogne-franche-comte", 58, 86, "soin,reprise,industrie"],
  ["59", "nord", "Nord", "Lille", "hauts-de-france", 82, 97, "aide-soignant,logistique,industrie"],
  ["60", "oise", "Oise", "Beauvais", "hauts-de-france", 70, 96, "logistique,soin,aéroport"],
  ["61", "orne", "Orne", "Alençon", "normandie", 60, 88, "soin,industrie,reprise"],
  ["62", "pas-de-calais", "Pas-de-Calais", "Arras", "hauts-de-france", 80, 92, "industrie,soin,logistique"],
  ["63", "puy-de-dome", "Puy-de-Dôme", "Clermont-Ferrand", "auvergne-rhone-alpes", 69, 97, "industrie,soin,recherche"],
  ["64", "pyrenees-atlantiques", "Pyrénées-Atlantiques", "Pau", "nouvelle-aquitaine", 68, 98, "aéronautique,soin,BTP"],
  ["65", "hautes-pyrenees", "Hautes-Pyrénées", "Tarbes", "occitanie", 62, 90, "aéronautique,soin,BTP"],
  ["66", "pyrenees-orientales", "Pyrénées-Orientales", "Perpignan", "occitanie", 67, 91, "soin,BTP,saison"],
  ["67", "bas-rhin", "Bas-Rhin", "Strasbourg", "grand-est", 75, 103, "nucléaire,industrie,transfrontalier"],
  ["68", "haut-rhin", "Haut-Rhin", "Colmar", "grand-est", 74, 101, "industrie,énergie,transfrontalier"],
  ["69", "rhone", "Rhône", "Lyon", "auvergne-rhone-alpes", 81, 110, "soin,industrie,produit"],
  ["70", "haute-saone", "Haute-Saône", "Vesoul", "bourgogne-franche-comte", 61, 88, "industrie,soin,reprise"],
  ["71", "saone-et-loire", "Saône-et-Loire", "Mâcon", "bourgogne-franche-comte", 66, 92, "industrie,soin,BTP"],
  ["72", "sarthe", "Sarthe", "Le Mans", "pays-de-la-loire", 69, 95, "auto,soin,logistique"],
  ["73", "savoie", "Savoie", "Chambéry", "auvergne-rhone-alpes", 70, 99, "énergie,BTP,saison"],
  ["74", "haute-savoie", "Haute-Savoie", "Annecy", "auvergne-rhone-alpes", 74, 108, "industrie,BTP,transfrontalier"],
  ["75", "paris", "Paris", "Paris", "ile-de-france", 70, 128, "staff,finance,design"],
  ["76", "seine-maritime", "Seine-Maritime", "Rouen", "normandie", 76, 96, "chimie,portuaire,soin"],
  ["77", "seine-et-marne", "Seine-et-Marne", "Melun", "ile-de-france", 69, 108, "logistique,aéroport,soin"],
  ["78", "yvelines", "Yvelines", "Versailles", "ile-de-france", 67, 114, "auto,staff,soin"],
  ["79", "deux-sevres", "Deux-Sèvres", "Niort", "nouvelle-aquitaine", 63, 94, "assurance,soin,industrie"],
  ["80", "somme", "Somme", "Amiens", "hauts-de-france", 72, 91, "industrie,soin,logistique"],
  ["81", "tarn", "Tarn", "Albi", "occitanie", 63, 90, "industrie,soin,BTP"],
  ["82", "tarn-et-garonne", "Tarn-et-Garonne", "Montauban", "occitanie", 62, 89, "logistique,soin,agro"],
  ["83", "var", "Var", "Toulon", "provence-alpes-cote-dazur", 73, 99, "naval,BTP,soin"],
  ["84", "vaucluse", "Vaucluse", "Avignon", "provence-alpes-cote-dazur", 68, 95, "agro,BTP,soin"],
  ["85", "vendee", "Vendée", "La Roche-sur-Yon", "pays-de-la-loire", 72, 96, "industrie,naval,soin"],
  ["86", "vienne", "Vienne", "Poitiers", "nouvelle-aquitaine", 64, 93, "soin,logistique,enseignement"],
  ["87", "haute-vienne", "Haute-Vienne", "Limoges", "nouvelle-aquitaine", 63, 90, "industrie,soin,reprise"],
  ["88", "vosges", "Vosges", "Épinal", "grand-est", 65, 89, "industrie,soin,reprise"],
  ["89", "yonne", "Yonne", "Auxerre", "bourgogne-franche-comte", 61, 89, "logistique,soin,agro"],
  ["90", "territoire-de-belfort", "Territoire de Belfort", "Belfort", "bourgogne-franche-comte", 70, 97, "énergie,industrie,ferroviaire"],
  ["91", "essonne", "Essonne", "Évry-Courcouronnes", "ile-de-france", 66, 112, "spatial,logistique,soin"],
  ["92", "hauts-de-seine", "Hauts-de-Seine", "Nanterre", "ile-de-france", 64, 122, "staff,finance,siège"],
  ["93", "seine-saint-denis", "Seine-Saint-Denis", "Bobigny", "ile-de-france", 71, 108, "logistique,BTP,soin"],
  ["94", "val-de-marne", "Val-de-Marne", "Créteil", "ile-de-france", 67, 114, "santé,logistique,BTP"],
  ["95", "val-doise", "Val-d’Oise", "Pontoise", "ile-de-france", 68, 110, "aéroport,logistique,soin"],
  ["971", "guadeloupe", "Guadeloupe", "Basse-Terre", "guadeloupe", 66, 88, "soin,BTP,énergie"],
  ["972", "martinique", "Martinique", "Fort-de-France", "martinique", 65, 88, "soin,BTP,énergie"],
  ["973", "guyane", "Guyane", "Cayenne", "guyane", 70, 90, "BTP,santé,spatial"],
  ["974", "la-reunion", "La Réunion", "Saint-Denis", "la-reunion", 68, 89, "soin,BTP,énergie"],
  ["976", "mayotte", "Mayotte", "Mamoudzou", "mayotte", 77, 84, "soin,BTP,éducation"],
];

export const DEPTS: GeoDept[] = DEPT_ROWS.map(([code, slug, name, prefecture, region, tension, salaryIndex, metiers]) => ({
  code,
  slug,
  name,
  prefecture,
  region,
  tension,
  salaryIndex,
  metiers: metiers.split(","),
}));

const EXTRA_CITIES: [string, string, string][] = [
  ["fos-sur-mer", "Fos-sur-Mer", "13"],
  ["aix-en-provence", "Aix-en-Provence", "13"],
  ["villeurbanne", "Villeurbanne", "69"],
  ["le-havre", "Le Havre", "76"],
  ["reims", "Reims", "51"],
  ["saint-nazaire", "Saint-Nazaire", "44"],
  ["lorient", "Lorient", "56"],
  ["brest", "Brest", "29"],
  ["mulhouse", "Mulhouse", "68"],
  ["roubaix", "Roubaix", "59"],
  ["tourcoing", "Tourcoing", "59"],
  ["dunkerque", "Dunkerque", "59"],
  ["calais", "Calais", "62"],
  ["antibes", "Antibes", "06"],
  ["cannes", "Cannes", "06"],
  ["la-seyne-sur-mer", "La Seyne-sur-Mer", "83"],
  ["beziers", "Béziers", "34"],
  ["narbonne", "Narbonne", "11"],
  ["bayonne", "Bayonne", "64"],
  ["biarritz", "Biarritz", "64"],
  ["annecy", "Annecy", "74"],
  ["chambery", "Chambéry", "73"],
  ["valence", "Valence", "26"],
  ["nimes", "Nîmes", "30"],
  ["perpignan", "Perpignan", "66"],
  ["toulon", "Toulon", "83"],
  ["avignon", "Avignon", "84"],
  ["clermont-ferrand", "Clermont-Ferrand", "63"],
  ["limoges", "Limoges", "87"],
  ["amiens", "Amiens", "80"],
  ["metz", "Metz", "57"],
  ["nancy", "Nancy", "54"],
  ["orleans", "Orléans", "45"],
  ["tours", "Tours", "37"],
  ["angers", "Angers", "49"],
  ["le-mans", "Le Mans", "72"],
  ["la-rochelle", "La Rochelle", "17"],
  ["pau", "Pau", "64"],
  ["colmar", "Colmar", "68"],
  ["argenteuil", "Argenteuil", "95"],
  ["montreuil", "Montreuil", "93"],
  ["saint-etienne", "Saint-Étienne", "42"],
  ["grenoble", "Grenoble", "38"],
  ["rennes", "Rennes", "35"],
  ["nantes", "Nantes", "44"],
  ["lille", "Lille", "59"],
  ["strasbourg", "Strasbourg", "67"],
  ["bordeaux", "Bordeaux", "33"],
  ["montpellier", "Montpellier", "34"],
  ["nice", "Nice", "06"],
  ["rouen", "Rouen", "76"],
  ["dijon", "Dijon", "21"],
  ["caen", "Caen", "14"],
  ["saint-denis", "Saint-Denis", "93"],
  ["boulogne-billancourt", "Boulogne-Billancourt", "92"],
  ["courbevoie", "Courbevoie", "92"],
  ["asnieres-sur-seine", "Asnières-sur-Seine", "92"],
  ["vitry-sur-seine", "Vitry-sur-Seine", "94"],
  ["aubervilliers", "Aubervilliers", "93"],
  ["issy-les-moulineaux", "Issy-les-Moulineaux", "92"],
  ["levallois-perret", "Levallois-Perret", "92"],
  ["neuilly-sur-seine", "Neuilly-sur-Seine", "92"],
  ["cergy", "Cergy", "95"],
  ["aulnay-sous-bois", "Aulnay-sous-Bois", "93"],
  ["meaux", "Meaux", "77"],
  ["saint-quentin", "Saint-Quentin", "02"],
  ["valenciennes", "Valenciennes", "59"],
  ["douai", "Douai", "59"],
  ["lens", "Lens", "62"],
  ["bethune", "Béthune", "62"],
  ["martigues", "Martigues", "13"],
  ["arles", "Arles", "13"],
  ["salon-de-provence", "Salon-de-Provence", "13"],
  ["aubagne", "Aubagne", "13"],
  ["saint-malo", "Saint-Malo", "35"],
  ["cherbourg-en-cotentin", "Cherbourg-en-Cotentin", "50"],
  ["cholet", "Cholet", "49"],
  ["les-sables-dolonne", "Les Sables-d’Olonne", "85"],
  ["dax", "Dax", "40"],
  ["brive-la-gaillarde", "Brive-la-Gaillarde", "19"],
  ["castres", "Castres", "81"],
  ["ales", "Alès", "30"],
  ["sete", "Sète", "34"],
  ["montelimar", "Montélimar", "26"],
  ["chalon-sur-saone", "Chalon-sur-Saône", "71"],
  ["saint-nazaire", "Saint-Nazaire", "44"],
];

export const CITIES: GeoCity[] = (() => {
  const map = new Map<string, GeoCity>();
  for (const d of DEPTS) {
    const slug = slugify(d.prefecture);
    if (!map.has(slug)) map.set(slug, { slug, name: d.prefecture, dept: d.code });
  }
  for (const [slug, name, dept] of EXTRA_CITIES) {
    const existing = map.get(slug);
    if (existing && existing.dept !== dept) {
      const relocated = `${existing.slug}-${existing.dept.toLowerCase()}`;
      map.set(relocated, { ...existing, slug: relocated });
    }
    map.set(slug, { slug, name, dept, extra: true });
  }
  return [...map.values()];
})();

const DEPT_BY_CODE = new Map(DEPTS.map((d) => [d.code, d]));
const DEPT_BY_SLUG = new Map(DEPTS.map((d) => [d.slug, d]));
const REGION_BY_SLUG = new Map(REGIONS.map((r) => [r.slug, r]));
const CITY_BY_SLUG = new Map(CITIES.map((c) => [c.slug, c]));
const CITY_BY_NAME = new Map(CITIES.map((c) => [slugify(c.name), c]));

export const EU_CITIES: { slug: string; name: string; country: string; aliases?: string[] }[] = [
  { slug: "lisbonne", name: "Lisbonne", country: "Portugal", aliases: ["lisbon"] },
  { slug: "amsterdam", name: "Amsterdam", country: "Pays-Bas" },
  { slug: "copenhague", name: "Copenhague", country: "Danemark", aliases: ["copenhagen"] },
  { slug: "bruxelles", name: "Bruxelles", country: "Belgique", aliases: ["brussels"] },
  { slug: "londres", name: "Londres", country: "Royaume-Uni", aliases: ["london"] },
  { slug: "berlin", name: "Berlin", country: "Allemagne" },
  { slug: "munich", name: "Munich", country: "Allemagne", aliases: ["munchen", "muenchen"] },
  { slug: "stockholm", name: "Stockholm", country: "Suède" },
  { slug: "dublin", name: "Dublin", country: "Irlande" },
  { slug: "utrecht", name: "Utrecht", country: "Pays-Bas" },
];

export function regionOf(slug: string): GeoRegion | undefined {
  return REGION_BY_SLUG.get(slug);
}
export function deptOf(codeOrSlug: string): GeoDept | undefined {
  return DEPT_BY_CODE.get(codeOrSlug) ?? DEPT_BY_SLUG.get(codeOrSlug);
}
export function cityOf(slug: string): GeoCity | undefined {
  return CITY_BY_SLUG.get(slug) ?? CITY_BY_NAME.get(slug);
}

export function placeOf(city: GeoCity): { city: GeoCity; dept: GeoDept; region: GeoRegion } | null {
  const dept = DEPT_BY_CODE.get(city.dept);
  if (!dept) return null;
  const region = REGION_BY_SLUG.get(dept.region);
  if (!region) return null;
  return { city, dept, region };
}

export function placeOfCity(name: string): { city: GeoCity; dept: GeoDept; region: GeoRegion } | null {
  const city = CITY_BY_SLUG.get(name) ?? cityOf(slugify(name));
  if (!city) return null;
  return placeOf(city);
}

export function tensionLabel(n: number): string {
  if (n >= 78) return "pénurie";
  if (n >= 68) return "marché tendu";
  if (n >= 58) return "tension moyenne";
  return "bassin plus large";
}

export function regionCopy(r: GeoRegion): { title: string; description: string; intro: string[]; faqs: { q: string; a: string }[] } {
  return {
    title: `Emplois en ${r.name} — salaires publiés, tension ${r.tension} | Vera`,
    description: `Offres ${r.name} : salaire vs médiane (index ${r.salaryIndex}), pacte, grilles. Métiers : ${r.metiers.join(", ")}. Pas de selon profil.`,
    intro: [
      r.intro,
      `Index salarial ${r.salaryIndex} (France = 100). Tension ${r.tension}/100 — ${tensionLabel(r.tension)}. Vera n’indexe une offre que si le salaire est public et le process nommé.`,
    ],
    faqs: [
      { q: `Quel salaire en ${r.name} sur Vera ?`, a: `Chaque fiche publie min/max. L’index régional est ${r.salaryIndex}. Sous le P25, l’offre est marquée en rouge.` },
      { q: `Quels métiers sont tendus en ${r.name} ?`, a: `${r.metiers.join(", ")}. La carte de tension et le Scarcity Score le découpent au département.` },
    ],
  };
}

export function deptCopy(d: GeoDept, r: GeoRegion): { title: string; description: string; intro: string[]; faqs: { q: string; a: string }[] } {
  const i = d.code.charCodeAt(d.code.length - 1) % 3;
  const open = [
    `${d.prefecture} n’a pas besoin de plus d’annonces. Le ${d.name} a besoin d’annonces lisibles.`,
    `Dans le ${d.code}, le volume Pôle emploi n’est pas la pénurie. Vera ne garde que le salaire publié.`,
    `Le ${d.name} se lit au bassin de ${d.prefecture}, pas au slogan RH.`,
  ][i]!;
  return {
    title: `Emplois ${d.name} (${d.code}) — ${d.prefecture} | Vera`,
    description: `Offres ${d.name} / ${d.prefecture} : salaire publié, pacte, tension ${d.tension}/100. ${d.metiers.join(", ")}. Région ${r.name}.`,
    intro: [
      open,
      `Département ${d.code}, préfecture ${d.prefecture}, ${r.name}. Tension ${d.tension}/100 (${tensionLabel(d.tension)}). Index salarial ${d.salaryIndex}. Métiers qui tirent : ${d.metiers.join(", ")}.`,
      `Les fiches « selon profil » du bassin restent sur Indeed. Ici : grille, épreuve, honneur public.`,
    ],
    faqs: [
      { q: `Salaire médian dans le ${d.name} ?`, a: `Index ${d.salaryIndex} (France = 100). Chaque offre Vera affiche min/max et la médiane de marché du métier.` },
      { q: `Y a-t-il des offres à ${d.prefecture} ?`, a: `Les offres du département s’affichent ici, plus le bassin régional et le remote Europe à salaire publié.` },
    ],
  };
}

export function cityCopy(c: GeoCity, d: GeoDept, r: GeoRegion): { title: string; description: string; intro: string[]; faqs: { q: string; a: string }[] } {
  return {
    title: `Emplois à ${c.name} (${d.code}) — salaire publié | Vera`,
    description: `Offres ${c.name}, ${d.name} : salaire vs médiane, pacte, grilles. ${d.metiers.join(", ")}. ${r.name}.`,
    intro: [
      `${c.name} n’est pas un filtre. C’est un bassin : ${d.name} (${d.code}), ${r.name}. Vera n’y laisse une offre que si le salaire est public.`,
      `Tension départementale ${d.tension}/100 — ${tensionLabel(d.tension)}. Index ${d.salaryIndex}. ${d.metiers.join(", ")}.`,
    ],
    faqs: [
      { q: `Les offres ${c.name} sont-elles vraiment sur place ?`, a: `Onsite / hybride : la ville est celle du poste. Remote : fuseau écrit. Le Schema JobPosting porte le lieu.` },
      { q: `Et le reste du ${d.name} ?`, a: `Le bassin départemental s’affiche sous les offres locales. Page ${d.name} : /lieux/departements/${d.slug}.` },
    ],
  };
}

export function jobsForCity(jobs: JobListItem[], city: GeoCity): { local: JobListItem[]; bassin: JobListItem[]; remote: JobListItem[] } {
  const local = jobs.filter((j) => slugify(j.city) === city.slug);
  const bassin = jobs.filter((j) => {
    if (slugify(j.city) === city.slug) return false;
    const p = placeOfCity(j.city);
    return p?.dept.code === city.dept;
  });
  const remote = jobs.filter((j) => j.remoteType === "remote" && slugify(j.city) !== city.slug);
  return { local, bassin, remote };
}

export function jobsForDept(jobs: JobListItem[], dept: GeoDept): { local: JobListItem[]; region: JobListItem[]; remote: JobListItem[] } {
  const local = jobs.filter((j) => placeOfCity(j.city)?.dept.code === dept.code);
  const region = jobs.filter((j) => {
    const p = placeOfCity(j.city);
    return p?.region.slug === dept.region && p.dept.code !== dept.code;
  });
  const remote = jobs.filter((j) => j.remoteType === "remote");
  return { local, region, remote };
}

export function jobsForRegion(jobs: JobListItem[], region: GeoRegion): { local: JobListItem[]; remote: JobListItem[] } {
  const local = jobs.filter((j) => placeOfCity(j.city)?.region.slug === region.slug);
  const remote = jobs.filter((j) => j.remoteType === "remote");
  return { local, remote };
}

export function detectPlace(q: string): { rest: string; city?: GeoCity; dept?: GeoDept; region?: GeoRegion; eu?: (typeof EU_CITIES)[number] } {
  const raw = q.trim();
  const lower = slugify(raw);
  const region = REGIONS.find((r) => lower.includes(r.slug) || lower.includes(slugify(r.name)));
  if (region) return { rest: raw, region };
  const dept = DEPTS.find((d) => lower.includes(d.slug) || lower.includes(slugify(d.name)) || lower === d.code.toLowerCase());
  if (dept) return { rest: raw, dept };
  const city = CITIES.find((c) => lower.includes(c.slug) || lower.includes(slugify(c.name)));
  if (city) return { rest: raw, city };
  const eu = EU_CITIES.find(
    (c) => lower.includes(c.slug) || lower.includes(slugify(c.name)) || c.aliases?.some((a) => lower.includes(a)),
  );
  if (eu) return { rest: raw, eu };
  return { rest: raw };
}
