import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es le sommelier IA d'Ispalis. Reponds UNIQUEMENT en JSON valide sans texte avant ou apres.

REGLE SANS ALCOOL — IMPORTANT :
Les suggestions sans alcool doivent etre STRICTEMENT non alcoolisees.
Sont interdits : cidre, biere.
Sont autorises : toute forme de boissons normalement alcoolisees mais sans alcool, kombucha, kefir, eau aromatisee maison, jus de fruits frais, the glace, infusion froide, limonade artisanale, lait vegetal, bouillon froid, jus de legumes, shrub (vinaigre + fruits), mocktail aux herbes.
Toujours preciser "artisanal" ou "maison" pour valoriser la suggestion.

REGLE MATURITE — IMPORTANT :
Si une référence de la cave a l'attribut "pas_encore_mature", tu peux la proposer MAIS tu dois :
1. Ajouter "(pas encore à maturité — prêt en [année])" à la fin de l'argument
2. Ne jamais la placer en accord "Prestige" si une autre référence mature est disponible en cave
3. Privilegier une alternative mature de la cave pour le niveau Prestige

Structure exacte pour UN seul plat :
{
  "plat": "nom exact",
  "accord_accessible": {"vin": "appellation", "prix_verre": "4-7EUR", "prix_bouteille": "18-28EUR", "argument": "phrase courte"},
  "accord_intermediaire": {"vin": "appellation", "prix_verre": "7-12EUR", "prix_bouteille": "28-48EUR", "argument": "phrase courte"},
  "accord_prestige": {"vin": "appellation", "prix_verre": "12-20EUR", "prix_bouteille": "48-90EUR", "argument": "phrase courte"},
  "accord_sans_alcool": {"boisson": "boisson artisanale precise", "argument": "phrase courte"}
}`;


const buildContraintes = (p: any): string => {
  if (!p) return ''
  const lines: string[] = []

  if (p.cave_priorite) lines.push('Priorite absolue aux references presentes en cave — propose-les en accord intermediaire ou accessible si elles correspondent')

  if (p.types?.length) {
    lines.push(`Types de boisson OBLIGATOIRES : ${p.types.join(', ')} — tu ne proposes QUE ces types, aucun autre`)
  }

  // Lire les filtres par type depuis p.filtres
  const filtres = p.filtres || {}

  // Vin
  const couleurs = filtres['vin_couleur'] || []
  const styles = filtres['vin_style'] || []
  if (couleurs.length) lines.push(`Couleurs de vin OBLIGATOIRES : ${couleurs.join(', ')} — ne propose AUCUN vin d'une autre couleur`)
  if (styles.length) lines.push(`Style de vin souhaite : ${styles.join(', ')}`)

  // Bière
  const biereFamille = filtres['biere_famille'] || []
  const biereIntens = filtres['biere_intensite'] || []
  if (biereFamille.length) lines.push(`Famille de biere souhaitee : ${biereFamille.join(', ')}`)
  if (biereIntens.length) lines.push(`Intensite de biere souhaitee : ${biereIntens.join(', ')}`)

  // Pétillants
  const petFamille = filtres['petillant_famille'] || []
  const petDosage = filtres['petillant_dosage'] || []
  if (petFamille.length) lines.push(`Type de petillant souhaite : ${petFamille.join(', ')}`)
  if (petDosage.length) lines.push(`Dosage souhaite : ${petDosage.join(', ')}`)

  // Spiritueux
  const spirFamille = filtres['spiritueux_famille'] || []
  const spirService = filtres['spiritueux_service'] || []
  if (spirFamille.length) lines.push(`Famille de spiritueux souhaitee : ${spirFamille.join(', ')}`)
  if (spirService.length) lines.push(`Mode de service souhaite : ${spirService.join(', ')}`)

  // Sans alcool
  const saFamille = filtres['sans_alcool_famille'] || []
  const saIntens = filtres['sans_alcool_intensite'] || []
  if (saFamille.length) lines.push(`Famille de boisson sans alcool souhaitee : ${saFamille.join(', ')}`)
  if (saIntens.length) lines.push(`Intensite sans alcool souhaitee : ${saIntens.join(', ')}`)

  // Budget
  if (p.budget && p.budget !== 'Les trois niveaux') lines.push(`Budget bouteille : ${p.budget} — adapte les trois niveaux en consequence`)

  if (lines.length === 0) return ''
  return `\n\nCONTRAINTES DE GENERATION (A RESPECTER IMPERATIVEMENT — ne pas ignorer) :\n${lines.map((l: string) => `- ${l}`).join('\n')}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plats, stock, ton, parametres, type_service, mode} = body;

    if (!plats || plats.length === 0) {
      return NextResponse.json({ error: "Aucun plat fourni" }, { status: 400 });
    }

    const platsLimites = plats.slice(0, 8);

// ─── Mode bouteille menu : 1 seul appel pour tout le menu
if (mode === 'bouteille_menu') {
  const stockText = stock && stock.length > 0
    ? stock.map((s: any) => {
        const anneeActuelle = new Date().getFullYear()
        const maturite = s.maturite_debut && anneeActuelle < s.maturite_debut
          ? ` — pas encore à maturité (prêt en ${s.maturite_debut})`
          : ''
        return `- ${s.nom} — ${s.quantite} bouteilles (${s.jours_sans_mouvement}j)${maturite}`
      }).join("\n")
    : "Aucun stock";

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    system: `Tu es le sommelier IA d'Ispalis. Reponds UNIQUEMENT en JSON valide sans texte avant ou apres.
Tu dois recommander UN vin en bouteille qui accompagne au mieux l'ensemble du menu.
Structure exacte :
{
  "accord_principal": {
    "vin": "appellation precise",
    "prix_bouteille": "35-55EUR",
    "argument": "phrase expliquant pourquoi ce vin fonctionne sur l'ensemble du menu",
    "plats_couverts": ["plat1", "plat2"]
  },
  "accord_alternatif": {
    "vin": "appellation precise",
    "prix_bouteille": "25-40EUR",
    "argument": "phrase courte",
    "plats_couverts": ["plat1", "plat2"]
  }
}`,
    messages: [{
      role: "user",
      content: `STOCK:\n${stockText}\n\nMENU COMPLET:\n${platsLimites.map((p, i) => `${i+1}. ${p}`).join('\n')}\n\nTrouve le meilleur vin en bouteille pour accompagner l'ensemble de ce menu.`
    }],
  });

  const raw = message.content.map((b: any) => b.type === "text" ? b.text : "").join("");
  const clean = raw.replace(/```json|```/g, "").trim();
  const accord_bouteille = JSON.parse(clean);

  return NextResponse.json({
    success: true,
    data: { accord_bouteille, mode: 'bouteille_menu' },
  });
}
    const anneeActuelle = new Date().getFullYear()

const stockText = stock && stock.length > 0
  ? stock.map((s: any) => {
      const maturite = s.maturite_debut && anneeActuelle < s.maturite_debut
        ? ` — pas encore à maturité (prêt en ${s.maturite_debut})`
        : ''
      return `- ${s.nom} — ${s.quantite} bouteilles (${s.jours_sans_mouvement}j)${maturite}`
    }).join("\n")
  : "Aucun stock";
    
    const contraintes = buildContraintes(parametres)

    const accords = [];
    for (const plat of platsLimites) {
      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 700,
        system: SYSTEM_PROMPT,
        messages: [{
          role: "user",
          content: `STOCK:\n${stockText}${contraintes}\n\nPLAT: ${plat}\nTON: ${ton || "professionnel"}`
        }],
      });
      const raw = message.content.map((b: any) => b.type === "text" ? b.text : "").join("");
      const clean = raw.replace(/```json|```/g, "").trim();
      accords.push(JSON.parse(clean));
    }

    const alertes_stock = stock
      ? stock.filter((s: any) => s.quantite < 3 || s.jours_sans_mouvement > 60).map((s: any) => ({
          reference: s.nom,
          type: s.quantite < 3 ? "RUPTURE" : "ROTATION_LENTE",
          message: s.quantite < 3 ? `${s.quantite} bouteilles restantes` : `${s.jours_sans_mouvement} jours sans mouvement`,
          action: s.quantite < 3 ? "Passer commande rapidement" : "A mettre en avant ce soir"
        }))
      : [];

  // Logger les tokens et le coût
const totalInput = accords.length * 200
const totalOutput = accords.length * 350
const coutUsd = ((totalInput * 3 + totalOutput * 15) / 1000000)

try {
  const { createClient } = await import('@supabase/supabase-js')
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.replace('Bearer ', '')
  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (user) {
    await supabaseAdmin.from('logs_api').insert({
      user_id: user.id,
      nb_plats: accords.length,
      input_tokens: totalInput,
      output_tokens: totalOutput,
      cout_usd: coutUsd,
      duree_ms: 0
    })
  }
} catch (e) {
  console.error('Log error:', e)
}

return NextResponse.json({
  success: true,
  data: { accords, alertes_stock, a_valoriser: [] },
});

  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
