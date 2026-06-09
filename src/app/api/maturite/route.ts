import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = message.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('')
    if (!text) return NextResponse.json({ error: 'Réponse vide' }, { status: 500 })
    return NextResponse.json({ text })
  } catch (error) {
    console.error('Erreur maturite:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
