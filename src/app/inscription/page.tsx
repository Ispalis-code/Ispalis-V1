'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const ISP = {
  burgundy: '#5E1119',
  ochre: '#EEA300',
  ink: '#1A1410',
  paper: '#F4EDE0',
  paperWarm: '#FBF6EC',
  card: '#FFFCF6',
  sage: '#7D8A5C',
  sagePale: '#E4E8D6',
  terracotta: '#B5613B',
  rule: '#E2D8C2',
  muted: '#7A6A55',
}

function BottleI({ color = ISP.burgundy, size = 28 }: { color?: string; size?: number }) {
  return (
    <svg width={size * 0.42} height={size} viewBox="0 0 42 100" style={{ display: 'block', flexShrink: 0 }}>
      <circle cx="21" cy="10" r="9" fill={color} />
      <path d="M16 22 L16 36 Q10 42 10 52 L10 92 Q10 98 16 98 L26 98 Q32 98 32 92 L32 52 Q32 42 26 36 L26 22 Z" fill={color} />
    </svg>
  )
}

function IspalisLogo({ color = ISP.burgundy, dot = ISP.ochre, size = 26 }: { color?: string; dot?: string; size?: number }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.18, fontWeight: 800, fontSize: size, color, letterSpacing: '-0.01em', lineHeight: 1 }}>
      <span style={{ width: size * 0.22, height: size * 0.22, borderRadius: '50%', background: dot, flexShrink: 0 }} />
      <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: size * 0.04 }}>
        <BottleI color={color} size={size * 1.05} />
        <span>spalis</span>
      </span>
      <span style={{ width: size * 0.22, height: size * 0.22, borderRadius: '50%', background: dot, flexShrink: 0 }} />
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  border: `1.5px solid ${ISP.rule}`, borderRadius: 10,
  fontFamily: 'inherit', fontSize: 14.5, color: ISP.ink,
  backgroundColor: ISP.card, outline: 'none',
  fontWeight: 600, transition: 'border-color .15s',
  boxSizing: 'border-box',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: ISP.muted, marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </label>
  )
}

export default function Inscription() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nom, setNom] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleInscription = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError('')
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nom_etablissement: nom } }
  })
  if (error) {
    setError(error.message)
  } else {
    console.log('Inscription réussie, envoi email onboarding...')
    try {
      const r = await fetch('/api/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nom_etablissement: nom }),
      })
      console.log('Réponse send-welcome:', r.status)
    } catch (e) {
      console.error('Erreur email onboarding', e)
    }
    router.push('/dashboard')
  }
  setLoading(false)
}

  return (
    <main style={{ background: ISP.paper, minHeight: '100vh', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>

      {/* Logo */}
      <div style={{ marginBottom: 40 }}>
        <IspalisLogo size={28} />
      </div>

      {/* Carte */}
      <div style={{
        background: ISP.card, borderRadius: 20, padding: '36px 40px',
        width: '100%', maxWidth: 440,
        boxShadow: '0 1px 0 rgba(60,40,20,.04), 0 16px 48px -16px rgba(60,40,20,.22)',
      }}>

        {/* Header */}
        <div style={{ paddingBottom: 20, marginBottom: 24, borderBottom: `2px solid ${ISP.ink}` }}>
          <div style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: ISP.terracotta, fontWeight: 800, marginBottom: 4 }}>
            Bienvenue
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: '-0.015em', color: ISP.ink }}>
            Créer votre compte
          </h1>
          <p style={{ fontSize: 13.5, color: ISP.muted, margin: '6px 0 0', lineHeight: 1.5 }}>
            Accords mets-boissons par IA, pensés pour votre établissement.
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleInscription} style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>

          <Field label="Nom de votre établissement">
            <input
              type="text" value={nom} onChange={e => setNom(e.target.value)}
              required placeholder="ex : Club Marot"
              style={inputStyle}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = ISP.burgundy}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = ISP.rule}
            />
          </Field>

          <Field label="Adresse email">
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="ex : contact@monrestaurant.fr"
              style={inputStyle}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = ISP.burgundy}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = ISP.rule}
            />
          </Field>

          <Field label="Mot de passe">
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required placeholder="8 caractères minimum"
              style={inputStyle}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = ISP.burgundy}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = ISP.rule}
            />
          </Field>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FBE9EB', color: ISP.burgundy, fontSize: 13, fontWeight: 700, border: `1px solid ${ISP.burgundy}33` }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              marginTop: 4,
              background: loading ? ISP.muted : ISP.burgundy,
              color: ISP.card, border: 'none', borderRadius: 12,
              padding: '15px 20px', fontFamily: 'inherit',
              fontWeight: 800, fontSize: 15, cursor: loading ? 'wait' : 'pointer',
              boxShadow: '0 8px 22px -10px rgba(94,17,25,.45)',
              letterSpacing: '-0.005em', transition: 'all .2s',
            }}>
            {loading ? 'Création en cours…' : 'Créer mon compte'}
          </button>
        </form>

        {/* Lien connexion */}
        <div style={{ marginTop: 22, paddingTop: 20, borderTop: `1px solid ${ISP.rule}`, textAlign: 'center' as const }}>
          <span style={{ fontSize: 13.5, color: ISP.muted }}>Déjà un compte ? </span>
          <a href="/connexion" style={{ fontSize: 13.5, color: ISP.burgundy, fontWeight: 800, textDecoration: 'none' }}>
            Se connecter
          </a>
        </div>
      </div>

      {/* Baseline */}
      <div style={{ marginTop: 28, fontSize: 12, color: ISP.muted, textAlign: 'center' as const, lineHeight: 1.6 }}>
        En créant un compte, vous acceptez les{' '}
        <a href="#" style={{ color: ISP.burgundy, fontWeight: 700, textDecoration: 'none' }}>conditions d'utilisation</a>
        {' '}d'Ispalis.
      </div>

    </main>
  )
}
