import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf") as File;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64,
            },
          },
          {
            type: "text",
            text: "Extrais tous les noms de plats de cette carte de restaurant. Reponds UNIQUEMENT en JSON valide sans texte avant ou apres. Format exact : {\"plats\": [\"Nom du plat 1\", \"Nom du plat 2\"]}. Ne garde que les plats principaux (entrees, plats, desserts). Ignore les prix, descriptions, allergenes. Maximum 15 plats."
          }
        ],
      }],
    });

    const raw = message.content.map((b: any) => b.type === "text" ? b.text : "").join("");
    const clean = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);

    return NextResponse.json({ success: true, plats: result.plats, usage: message.usage });

  } catch (error) {
    console.error("Erreur extraction menu:", error);
    return NextResponse.json({ error: "Erreur extraction" }, { status: 500 });
  }
}
