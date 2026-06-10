import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, nom_etablissement } = await request.json()
    console.log('send-welcome appelé pour:', email)

    const res = await fetch(
      'https://skzdcyeafjgyrhshgmxp.supabase.co/functions/v1/welcome-email',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email, nom_etablissement }),
      }
    )

    const data = await res.json()
    console.log('Réponse Supabase:', res.status, JSON.stringify(data))

    return NextResponse.json({ success: res.ok, data })
  } catch (err) {
    console.error('Erreur send-welcome:', err)
    return NextResponse.json({ success: false, error: String(err) })
  }
}
