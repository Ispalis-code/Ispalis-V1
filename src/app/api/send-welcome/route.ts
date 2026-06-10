import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, nom_etablissement } = await request.json()

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

    return NextResponse.json({ success: res.ok })
  } catch (err) {
    return NextResponse.json({ success: false })
  }
}
