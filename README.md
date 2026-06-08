# Ispalis — SaaS B2B d'accords mets-boissons par IA

Ispalis est une plateforme SaaS destinée aux professionnels de la restauration (CHR). Elle permet de générer en quelques secondes des accords mets-boissons personnalisés par intelligence artificielle, en tenant compte du stock de cave du restaurateur, de son style de maison et de ses contraintes de service.

**Production :** https://ispalis-v1.vercel.app  
**Repo :** https://github.com/Ispalis-code/Ispalis-V1

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Next.js 16 + TypeScript + Tailwind CSS |
| Base de données | Supabase (PostgreSQL) |
| IA | API Anthropic Claude Sonnet (`claude-sonnet-4-6`) |
| Déploiement | Vercel (auto-deploy sur push `main`) |
| Email | Resend (onboarding) |
| Excel | Package `xlsx` (import fichiers Sommit) |

---

## Variables d'environnement

À configurer dans Vercel → Settings → Environment Variables :

```
ANTHROPIC_API_KEY        # Clé API Claude (Anthropic)
NEXT_PUBLIC_SUPABASE_URL # URL du projet Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY # Clé anon Supabase
RESEND_API_KEY           # Clé API Resend (emails onboarding)
```

> ⚠️ Ne jamais committer ces valeurs dans le code. Elles sont uniquement dans Vercel.

---

## Workflow de développement

```
1. Ouvrir github.dev/Ispalis-code/Ispalis-V1
2. Modifier les fichiers directement dans le navigateur
3. Committer sur la branche main
4. Vercel redéploie automatiquement en ~2 minutes
5. Vérifier le déploiement sur https://ispalis-v1.vercel.app
```

> ⚠️ Le WiFi de certains réseaux scolaires bloque `api.anthropic.com`.  
> Pour tester la génération d'accords, utiliser un **hotspot téléphone**.

---

## Structure du projet

```
src/
├── app/
│   ├── dashboard/        # Accords rapides + menus sauvegardés
│   ├── carte/            # Import PDF + saisie manuelle + filtres
│   ├── stock/            # Gestion cave + import CSV/Excel Sommit
│   ├── service/          # Vue mobile service en salle
│   ├── historique/       # Historique accords par date et type
│   ├── parametres/       # Ton, type CHR, alertes stock, infobulles
│   ├── admin/            # Tableau de bord coûts API (mdp: ispalis2026)
│   ├── inscription/      # Auth Supabase
│   ├── connexion/        # Auth Supabase + reset password
│   └── api/
│       ├── recommandations/   # Route principale génération accords
│       └── extraire-menu/     # Extraction plats depuis PDF
├── components/
│   ├── Footer.tsx
│   ├── Tooltip.tsx        # Système d'infobulles (on/off via /parametres)
│   └── ...
└── context/
    └── TooltipContext.tsx  # Contexte global tooltips (localStorage)
```

---

## Base de données Supabase

**ID projet :** `skzdcyeafjgyrhshgmxp`

### Tables principales

#### `users`
| Colonne | Type | Description |
|---|---|---|
| id | uuid | Clé primaire (= auth.uid) |
| nom_etablissement | text | Nom du restaurant |
| type_chr | text | `restaurant`, `hotel`, `traiteur`, `autre` |
| ton_maison | text | `professionnel` ou `decontracte` |
| seuils_alertes | jsonb | Seuils stock par type de boisson |

#### `stocks`
| Colonne | Type | Description |
|---|---|---|
| id | uuid | Clé primaire |
| user_id | uuid | FK → users |
| nom_reference | text | Nom du vin / boisson |
| appellation | text | AOC, région |
| couleur | text | `rouge`, `blanc`, `rose`, `effervescent` |
| type_boisson | text | `vin`, `biere`, `spiritueux`, `sans_alcool`… |
| millesime | int | Année |
| quantite | int | Nombre de bouteilles |
| derniere_vente | date | Pour calculer la rotation |
| seuil_alerte | int | Seuil perso (écrase le seuil global) |
| maturite_debut | int | Année début fenêtre de maturité |
| maturite_fin | int | Année fin fenêtre de maturité |
| maturite_verrouillee | bool | Si l'estimation a été validée manuellement |

#### `menus`
| Colonne | Type | Description |
|---|---|---|
| id | uuid | Clé primaire |
| user_id | uuid | FK → users |
| plats | jsonb | Liste des plats |
| date_menu | date | Date du menu |
| nom_menu | text | Nom pour menus sauvegardés (null = menu non sauvegardé) |

#### `recommandations`
| Colonne | Type | Description |
|---|---|---|
| id | uuid | Clé primaire |
| user_id | uuid | FK → users |
| menu_id | uuid | FK → menus |
| accords | jsonb | Résultats de génération |
| alertes_stock | jsonb | Alertes générées |
| a_valoriser | jsonb | Références à mettre en avant |
| type_service | text | `verre`, `bouteille`, `carte` |

#### `logs_api`
| Colonne | Type | Description |
|---|---|---|
| id | uuid | Clé primaire |
| user_id | uuid | FK → users |
| created_at | timestamp | Date de l'appel |
| nb_plats | int | Nombre de plats générés |
| input_tokens | int | Tokens envoyés à Claude |
| output_tokens | int | Tokens reçus de Claude |
| cout_usd | float | Coût estimé en dollars |
| duree_ms | int | Durée de l'appel |

---

## Route API `/api/recommandations`

Route principale de génération d'accords. Accepte un POST avec :

```json
{
  "plats": ["Magret de canard", "Saint-Jacques poêlées"],
  "stock": [{ "nom": "Château Margaux 2018", "quantite": 6, "jours_sans_mouvement": 12 }],
  "ton": "professionnel",
  "parametres": {
    "types": ["vin"],
    "filtres": { "vin_couleur": ["rouge"] },
    "budget": "20-50€",
    "cave_priorite": true
  },
  "type_service": "verre",
  "mode": "bouteille_menu"
}
```

**3 modes de génération :**

| Mode | Description |
|---|---|
| *(défaut)* | 1 appel Claude par plat, retourne accords accessible / intermédiaire / prestige / sans alcool |
| `mode: 'bouteille_menu'` | 1 seul appel pour tout le menu, retourne 1 accord bouteille principal + 1 alternatif |
| `parametres.types: ['sans_alcool']` | Même mode défaut mais forcé sans alcool uniquement |

**Format de réponse :**
```json
{
  "success": true,
  "data": {
    "accords": [...],
    "alertes_stock": [...],
    "a_valoriser": [...]
  }
}
```

---

## Bugs connus & règles importantes

### ⚠️ Bug focus inputs
Les composants `LeftPanel`, `RightPanel`, `formSection`, `accordsSection` **doivent être des variables JSX**, pas des fonctions imbriquées. Une fonction imbriquée recrée le composant à chaque render et fait perdre le focus à chaque frappe.

```tsx
// ✅ Correct
const formSection = (
  <section>...</section>
)

// ❌ Incorrect — bug de focus
const FormSection = () => (
  <section>...</section>
)
```

### ⚠️ onClick sur les fonctions async
```tsx
// ✅ Correct
onClick={() => genererAccords()}

// ❌ Incorrect — passe l'événement MouseEvent à la fonction
onClick={genererAccords}
```

### ⚠️ Import Excel
Toujours utiliser le package `xlsx` installé dans le projet. Ne jamais importer depuis un CDN.

```tsx
// ✅ Correct
const XLSX = await import('xlsx')

// ❌ Incorrect
// <script src="https://cdn.sheetjs.com/xlsx.js">
```

### ⚠️ Emojis dans React
Les emojis dans les boutons peuvent causer des erreurs d'hydratation. Toujours les entourer de `suppressHydrationWarning` :

```tsx
<span suppressHydrationWarning>🍷</span>
```

---

## Accès admin

- **URL :** https://ispalis-v1.vercel.app/admin
- **Mot de passe :** `ispalis2026`
- **⚠️ Changer ce mot de passe dès la passation effectuée**

Le dashboard admin affiche : restaurants inscrits, appels API, coûts Anthropic, et un simulateur de rentabilité par restaurant.

---

## Pilotes actifs

| Établissement | Statut | Notes |
|---|---|---|
| Club Marot (Lille) | RDV confirmé | 438 références Sommit importées |
| Vandendriessche Boissons | Contact initié | Email envoyé, à relancer |

---

## Backlog prioritaire

| ID | Description | Priorité |
|---|---|---|
| S2-06 | Signer 2 restaurants payants | 🔴 Urgent |
| S3-02 | Freemium/Pro (5 générations/mois gratuit) | 🟠 Haute |
| S3-03 | Fiche accord imprimable PDF | 🟡 Moyenne |
| S3-04 | Notation accords (pouce haut/bas) | 🟡 Moyenne |
| S3-07 | Intégration Stripe | 🟠 Haute |
| S4-01→08 | Sprint design avec Sam | 🟡 Moyenne |

---

## Contact

**Email :** camille@ispalis.com  
**Téléphone :** 03 74 09 93 27  
**Localisation :** Lille — Bordeaux  
**Site :** ispalis.com
