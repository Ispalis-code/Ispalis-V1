import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  const { email, nom_etablissement } = await req.json()
  const nom = nom_etablissement || 'votre établissement'

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur Ispalis</title>
</head>
<body style="margin:0; padding:0; background:#F4EDE0; font-family: Georgia, serif; color:#1A1410;">

  <div style="max-width:600px; margin:40px auto; background:#FFFCF6; border-radius:18px; overflow:hidden; box-shadow:0 12px 40px -16px rgba(60,40,20,.2);">

    <!-- Header bordeaux -->
    <div style="background:#5E1119; padding:36px 44px; text-align:center;">
      <div style="color:#EEA300; font-weight:800; font-size:26px; letter-spacing:-0.01em;">
        ·ispalis·
      </div>
      <div style="color:rgba(244,237,224,0.6); font-size:11px; margin-top:6px; letter-spacing:0.16em; text-transform:uppercase;">
        Accords mets-boissons par IA
      </div>
    </div>

    <!-- Accroche -->
    <div style="padding:40px 44px 28px;">
      <div style="font-size:10.5px; letter-spacing:0.16em; text-transform:uppercase; color:#B5613B; font-weight:800; margin-bottom:10px;">
        Bienvenue
      </div>
      <h1 style="font-size:28px; font-weight:800; color:#1A1410; margin:0 0 14px; letter-spacing:-0.02em; line-height:1.15;">
        ${nom},<br/>
        <span style="color:#B5613B; font-style:italic;">vos accords vous attendent.</span>
      </h1>
      <p style="font-size:15px; color:#7A6A55; line-height:1.65; margin:0 0 32px;">
        Ispalis génère en quelques secondes des accords mets-boissons personnalisés pour votre service, en piochant en priorité dans votre cave. Voici comment tirer le meilleur de l'application.
      </p>

      <!-- Séparateur -->
      <div style="display:flex; align-items:center; gap:12px; margin-bottom:28px;">
        <span style="width:24px; height:1.5px; background:#B5613B; display:inline-block;"></span>
        <span style="font-size:10px; letter-spacing:0.16em; text-transform:uppercase; font-weight:800; color:#B5613B;">Guide de démarrage</span>
        <span style="flex:1; height:1.5px; background:rgba(181,97,59,0.2); display:inline-block;"></span>
      </div>

      <!-- Étape 1 -->
      <div style="display:flex; gap:16px; margin-bottom:24px;">
        <div style="width:36px; height:36px; border-radius:50%; background:#5E1119; color:#EEA300; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; flex-shrink:0; text-align:center; line-height:36px;">
          1
        </div>
        <div>
          <div style="font-size:15px; font-weight:800; color:#1A1410; margin-bottom:4px;">Importez votre cave</div>
          <p style="font-size:13px; color:#7A6A55; line-height:1.6; margin:0 0 8px;">
            Rendez-vous dans <strong>Cave</strong> et importez vos références. Vous pouvez :
          </p>
          <ul style="font-size:13px; color:#7A6A55; line-height:1.8; margin:0; padding-left:18px;">
            <li>Importer votre fichier <strong>Sommit</strong> (.xlsx) directement — Ispalis le détecte automatiquement</li>
            <li>Télécharger notre <strong>template Excel</strong> et le remplir avec vos références</li>
            <li>Ajouter des références <strong>une par une</strong> manuellement</li>
          </ul>
          <div style="margin-top:8px; padding:8px 12px; background:#E4E8D6; border-radius:8px; font-size:12px; color:#7D8A5C; font-weight:700;">
            🍇 Sur chaque référence, vous pouvez définir une fenêtre de maturité — Ispalis ne proposera pas un vin avant qu'il soit prêt à boire.
          </div>
        </div>
      </div>

      <!-- Étape 2 -->
      <div style="display:flex; gap:16px; margin-bottom:24px;">
        <div style="width:36px; height:36px; border-radius:50%; background:#5E1119; color:#EEA300; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; flex-shrink:0; text-align:center; line-height:36px;">
          2
        </div>
        <div>
          <div style="font-size:15px; font-weight:800; color:#1A1410; margin-bottom:4px;">Générez vos accords depuis le Dashboard</div>
          <p style="font-size:13px; color:#7A6A55; line-height:1.6; margin:0 0 8px;">
            Dans <strong>Accords</strong>, saisissez vos plats du soir et choisissez votre mode de génération :
          </p>
          <ul style="font-size:13px; color:#7A6A55; line-height:1.8; margin:0; padding-left:18px;">
            <li><strong>🍷 Accords au verre</strong> — un accord vin par plat, en 3 gammes de prix (accessible, intermédiaire, prestige)</li>
            <li><strong>🫧 Accords sans alcool</strong> — kombucha, jus frais, mocktail… une alternative pour chaque plat</li>
            <li><strong>🍾 Accord bouteille du menu</strong> — un seul vin qui accompagne l'ensemble du repas</li>
          </ul>
          <div style="margin-top:8px; padding:8px 12px; background:#FBF6EC; border-radius:8px; font-size:12px; color:#7A6A55; border-left:3px solid #EEA300;">
            💡 Donnez un nom à votre service avant de générer ("Menu du midi — Lundi") pour le retrouver facilement dans l'historique.
          </div>
        </div>
      </div>

      <!-- Étape 3 -->
      <div style="display:flex; gap:16px; margin-bottom:24px;">
        <div style="width:36px; height:36px; border-radius:50%; background:#5E1119; color:#EEA300; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; flex-shrink:0; text-align:center; line-height:36px;">
          3
        </div>
        <div>
          <div style="font-size:15px; font-weight:800; color:#1A1410; margin-bottom:4px;">Utilisez la page Carte pour vos menus complets</div>
          <p style="font-size:13px; color:#7A6A55; line-height:1.6; margin:0 0 8px;">
            Dans <strong>Carte</strong>, importez votre carte au format PDF ou saisissez vos plats manuellement. Vous pouvez aussi :
          </p>
          <ul style="font-size:13px; color:#7A6A55; line-height:1.8; margin:0; padding-left:18px;">
            <li>Générer un accord pour <strong>un seul plat</strong> avec le bouton ✨ sur chaque ligne</li>
            <li>Filtrer par <strong>type de boisson</strong> (vins, bières, pétillants, spiritueux, sans alcool) et affiner avec des sous-filtres</li>
            <li>Voir si un vin proposé est <strong>en cave</strong> (badge vert) ou trouver une alternative</li>
          </ul>
        </div>
      </div>

      <!-- Étape 4 -->
      <div style="display:flex; gap:16px; margin-bottom:24px;">
        <div style="width:36px; height:36px; border-radius:50%; background:#5E1119; color:#EEA300; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; flex-shrink:0; text-align:center; line-height:36px;">
          4
        </div>
        <div>
          <div style="font-size:15px; font-weight:800; color:#1A1410; margin-bottom:4px;">Pendant le service — vue mobile</div>
          <p style="font-size:13px; color:#7A6A55; line-height:1.6; margin:0 0 8px;">
            La page <strong>📱 Service</strong> est optimisée pour être consultée en salle depuis un téléphone. Elle affiche vos accords du soir en accordéon par plat, avec une barre de recherche rapide.
          </p>
        </div>
      </div>

      <!-- Étape 5 -->
      <div style="display:flex; gap:16px; margin-bottom:32px;">
        <div style="width:36px; height:36px; border-radius:50%; background:#5E1119; color:#EEA300; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; flex-shrink:0; text-align:center; line-height:36px;">
          5
        </div>
        <div>
          <div style="font-size:15px; font-weight:800; color:#1A1410; margin-bottom:4px;">Retrouvez tous vos accords dans l'Historique</div>
          <p style="font-size:13px; color:#7A6A55; line-height:1.6; margin:0;">
            La page <strong>Historique</strong> regroupe tous vos accords générés, classés par date et par type de service (au verre, à la bouteille, à la carte). Vous pouvez les rouvrir, les imprimer en PDF ou les supprimer.
          </p>
        </div>
      </div>

      <!-- Paramètres -->
      <div style="background:#FBF6EC; border-radius:14px; padding:20px 24px; margin-bottom:32px; border-left:4px solid #5E1119;">
        <div style="font-size:10.5px; letter-spacing:0.14em; text-transform:uppercase; font-weight:800; color:#5E1119; margin-bottom:8px;">À configurer dans Paramètres</div>
        <ul style="font-size:13px; color:#7A6A55; line-height:1.8; margin:0; padding-left:18px;">
          <li><strong>Ton de maison</strong> — professionnel ou décontracté, pour adapter la rédaction des accords</li>
          <li><strong>Type d'établissement</strong> — restaurant, hôtel, traiteur…</li>
          <li><strong>Seuils d'alertes stock</strong> — définissez à partir de combien de bouteilles Ispalis vous alerte par type de boisson</li>
          <li><strong>Infobulles d'aide</strong> — activez-les pour voir une explication au survol de chaque bouton</li>
        </ul>
      </div>

      <!-- CTA -->
      <div style="text-align:center; margin-bottom:8px;">
        <a href="https://ispalis-v1.vercel.app/dashboard"
          style="display:inline-block; background:#5E1119; color:#FFFCF6; text-decoration:none; padding:16px 40px; border-radius:12px; font-weight:800; font-size:15px; letter-spacing:-0.005em; box-shadow:0 8px 22px -10px rgba(94,17,25,.5);">
          Accéder à mon espace Ispalis →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#F4EDE0; padding:24px 44px; border-top:1px solid #E2D8C2; text-align:center;">
      <p style="font-size:13px; color:#7A6A55; line-height:1.6; margin:0 0 6px;">
        Une question ? Répondez directement à cet email ou écrivez-nous à
        <a href="mailto:camille@ispalis.com" style="color:#5E1119; font-weight:700; text-decoration:none;">camille@ispalis.com</a>
      </p>
      <p style="font-size:11px; color:rgba(122,106,85,0.5); margin:0;">
        Ispalis · Lille — Bordeaux · ispalis.com
      </p>
    </div>

  </div>

</body>
</html>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Camille · Ispalis <camille@ispalis.com>',
      to: [email],
      subject: `${nom}, vos accords vous attendent 🍷`,
      html,
    }),
  })

  const data = await res.json()
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status: res.ok ? 200 : 400,
  })
})
