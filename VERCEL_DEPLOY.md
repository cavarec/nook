# Déploiement NOOK sur Vercel

## 1. Créer le projet Supabase

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Appliquer le schéma : `supabase link --project-ref <ref>` puis
   `supabase db push` (utilise `supabase/migrations/0001_init.sql`).
3. Vérifier dans **Storage** qu'un bucket privé `tickets` a bien été créé
   par la migration.
4. Récupérer dans **Project Settings → API** :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (jamais exposée côté
     client, réservée aux futures tâches serveur type recalcul planifié du
     stock).

## 2. Variables d'environnement Vercel

Dans **Project Settings → Environment Variables**, ajouter pour
Production/Preview/Development :

| Variable                        | Valeur                        |
| -------------------------------- | ------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`       | URL du projet Supabase         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Clé publique anonyme           |
| `SUPABASE_SERVICE_ROLE_KEY`      | Clé service role (secrète)     |

## 3. Déployer

```bash
npm i -g vercel
vercel link
vercel env pull .env.local   # verifier que les 3 variables sont presentes
vercel --prod
```

Ou directement via l'interface Vercel : *Import Project* → sélectionner le
repo → build command `next build` (déjà configuré dans `package.json`) →
déployer.

## 4. Vérifications post-déploiement

- Le service worker (`next-pwa`) n'est actif qu'en production
  (`NODE_ENV !== "development"`) — tester l'installation PWA sur le domaine
  Vercel, pas en local.
- Créer un compte de test : un foyer solo doit être créé automatiquement
  (trigger `on_auth_user_created`).
- Importer un ticket de test pour valider la chaîne OCR → normalisation →
  catégorisation → stock estimé de bout en bout.
- Vérifier que la RLS bloque bien l'accès aux données d'un autre foyer
  (tester avec deux comptes).

## Domaine personnalisé

Configurer le domaine dans **Project Settings → Domains**, puis mettre à
jour le `manifest.json` (`start_url`) si l'app n'est pas servie à la racine
du domaine.
