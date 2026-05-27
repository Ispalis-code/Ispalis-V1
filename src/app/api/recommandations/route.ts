import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es le sommelier IA d'Ispalis. Reponds UNIQUEMENT en JSON valide sans texte avant ou apres.

REGLE SANS ALCOOL — IMPORTANT :
Les suggestions sans alcool doivent etre STRICTEMENT non alcoolisees.
Sont interdits : cidre, biere.
Sont autorises : toute forme de boissons normalement alcoolisees mais sans alcool, kombucha, kefir, eau aromatisee maison, jus de fruits frais, the glace, infusion froide, limonade artisanale, lait vegetal, bouillon froid, jus de legumes, shrub (vinaigre + fruits), mocktail aux herbes.
Toujours preciser "artisanal" ou "maison" pour valoriser la suggestion.

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
  if (p.types?.length) lines.push(`Types de boisson souhaites : ${p.types.join(', ')} — adapte le champ "vin" en consequence (ex: biere artisanale, spiritueux, etc.)`)
  if (p.couleurs?.length) lines.push(`Couleurs souhaitees : ${p.couleurs.join(', ')} uniquement`)
  if (p.styles?.length) lines.push(`Style souhaite : ${p.styles.join(', ')}`)
  if (p.budget && p.budget !== 'Les trois niveaux') lines.push(`Budget bouteille : ${p.budget} — adapte les trois niveaux en consequence`)
  if (lines.length === 0) return ''
  return `\n\nCONTRAINTES DE GENERATION (a respecter imperativement) :\n${lines.map((l: string) => `- ${l}`).join('\n')}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plats, stock, ton, parametres } = body;

    if (!plats || plats.length === 0) {
      return NextResponse.json({ error: "Aucun plat fourni" }, { status: 400 });
    }

    const platsLimites = plats.slice(0, 8);
    const stockText = stock && stock.length > 0
      ? stock.map((s: any) => `- ${s.nom} — ${s.quantite} bouteilles (${s.jours_sans_mouvement}j)`).join("\n")
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

    return NextResponse.json({
      success: true,
      data: { accords, alertes_stock, a_valoriser: [] },
    });

  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
