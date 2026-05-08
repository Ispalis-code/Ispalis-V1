import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es le sommelier IA d'Ispalis. Reponds UNIQUEMENT en JSON valide sans texte avant ou apres.
Structure exacte pour UN seul plat :
{
  "plat": "nom exact",
  "accord_accessible": {"vin": "appellation", "prix": "8-15€", "argument": "phrase courte"},
  "accord_intermediaire": {"vin": "appellation", "prix": "15-28€", "argument": "phrase courte"},
  "accord_prestige": {"vin": "appellation", "prix": "28-55€", "argument": "phrase courte"},
  "accord_sans_alcool": {"boisson": "boisson artisanale", "argument": "phrase courte"}
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plats, stock, ton } = body;

    if (!plats || plats.length === 0) {
      return NextResponse.json({ error: "Aucun plat fourni" }, { status: 400 });
    }

    const platsLimites = plats.slice(0, 8);
    const stockText = stock && stock.length > 0
      ? stock.map((s: any) => `- ${s.nom} — ${s.quantite} bouteilles (${s.jours_sans_mouvement}j)`).join("\n")
      : "Aucun stock";

    // Générer les accords plat par plat
    const accords = [];
    for (const plat of platsLimites) {
      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: [{
          role: "user",
          content: `STOCK:\n${stockText}\n\nPLAT: ${plat}\nTON: ${ton || "professionnel"}`
        }],
      });
      const raw = message.content.map((b: any) => b.type === "text" ? b.text : "").join("");
      const clean = raw.replace(/```json|```/g, "").trim();
      accords.push(JSON.parse(clean));
    }

    // Alertes stock
    const alertes_stock = stock
      ? stock.filter((s: any) => s.quantite < 3 || s.jours_sans_mouvement > 60).map((s: any) => ({
          reference: s.nom,
          type: s.quantite < 3 ? "RUPTURE" : "ROTATION_LENTE",
          message: s.quantite < 3 ? `${s.quantite} bouteilles restantes` : `${s.jours_sans_mouvement} jours sans mouvement`,
          action: s.quantite < 3 ? "Passer commande rapidement" : "À mettre en avant ce soir"
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