# Vera

Jobboard éditorial français — compétences d’abord, transparence, simulations métier, viviers, PPQC, **Savoirs** (hub de connaissance) et **Drive**.

Dépôt : [github.com/GUILLAUMEDEPLANQUE-geniuspace/vera](https://github.com/GUILLAUMEDEPLANQUE-geniuspace/vera)

## Lancer en local

Prérequis : **Node.js 22+**

```bash
git clone https://github.com/GUILLAUMEDEPLANQUE-geniuspace/vera.git
cd vera
npm install
npm run dev
```

Ouvre [http://localhost:8080](http://localhost:8080).

Sans `DATABASE_URL`, Vera tourne sur **PGLite** (Postgres en mémoire) et se seede toute seule. Les données disparaissent au redémarrage — normal.

## Ce qui est dans le produit

| Surface | Rôle |
| --- | --- |
| Offres | Salaire publié, PPQC, rareté, preuves, simulations |
| Savoirs | Forum / wiki métier (marché, droit, compta, formation) lié aux offres |
| Drive | Fichiers + lecteur (texte, PDF, vidéo chunkée) |
| Lexique | Tous les termes (Talent, Pacte, Brief, Verdict, PPQC…) |
| Admin | Catégories, champs, articles, assets Drive |
| Viviers | RSA, seniors fractionnels, slashers |

Operator (admin plateforme) : phrase de claim dans le profil `lhonneur-est-public`.

## Auth (optionnel)

Sans clés Google / X, l’auth email + mot de passe reste dispo en local.

```bash
cp .env.example .env
```

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | Postgres Neon (prod). Vide = PGLite. |
| `BETTER_AUTH_SECRET` | Secret de session (prod). |
| `BETTER_AUTH_URL` | URL publique (prod). |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Login Google. |
| `XAI_API_KEY` | Coach IA (optionnel). |

## Scripts

- `npm run dev` — serveur de dev
- `npm run build` — build Nitro (preset Vercel)
- `npm run typecheck`

Code source + assets (`public/`) + migrations SQL. **Pas** de `node_modules` — `npm install` les recrée.
