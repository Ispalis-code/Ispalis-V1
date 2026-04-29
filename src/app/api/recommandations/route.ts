import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es le sommelier IA d'Ispalis. Reponds UNIQUEMENT en JSON valide sans texte avant ou apres. Structure exacte : {"accords":[{"plat":"nom","accord_accessible":{"vin":"appellation","prix":"8-15€","argument":"phrase courte"},"accord_intermediaire":{"vin":"appellation","prix":"15-28€","argument":"phrase courte"},"accord_prestige":{"vin":"appellation","prix":"28-55€","argument":"phrase courte"},"accord_sans_alcool":{"boisson":"boisson artisanale","argument":"phrase courte"}}],"alertes_stock":[{"reference":"nom","type":"RUPTURE","message":"msg","action":"action"}],"a_valoriser":[{"reference":"nom","plat":"plat","argument":"pourquoi"}]}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plats, stock, ton } = body;
    if (!plats || plats.length === 0) {
      return NextResponse.json({ error: "Aucun plat fourni" }, { status: 400 });
    }
    const stockText = stock && stock.length > 0
      ? stock.map((s: { nom: string; quantite: number; jours_sans_mouvement: number }) =>
          `- ${s.nom} — ${s.quantite} bouteilles (${s.jours_sans_mouvement}j sans mouvement)`
        ).join("\n")
      : "Aucun stock renseigne";
    const userMessage = `STOCK:\n${stockText}\n\nMENU:\n${plats.map((p: string, i: number) => `${i + 1}. ${p}`).join("\n")}\n\nTON: ${ton || "professionnel"}`;
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });
    const rawText = message.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const result = JSON.parse(rawText.replace(/```json|```/g, "").trim());
    return NextResponse.json({ success: true, data: result, usage: message.usage });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
