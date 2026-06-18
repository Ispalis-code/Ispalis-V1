'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// ─── Ispalis brand tokens ─────────────────────────────────────────
const ISP = {
  burgundy: '#5E1119',
  ochre: '#EEA300',
  ink: '#1A1410',
  paper: '#F4EDE0',
  paperWarm: '#FBF6EC',
  card: '#FFFCF6',
  terracotta: '#B5613B',
  rule: '#E2D8C2',
  muted: '#7A6A55',
}

export default function Connexion() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleConnexion = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfo('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message) } else { router.push('/dashboard') }
    setLoading(false)
  }

  const handleMotDePasseOublie = async () => {
    if (!email) { setError("Entrez votre email d'abord"); return }
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://ispalis-v1.vercel.app/reset-password',
    })
    if (error) { setError(error.message) } else { setInfo('Email de réinitialisation envoyé !') }
  }

  return (
    <main
      style={{
        background: ISP.paper,
        minHeight: '100vh',
        color: ISP.ink,
        fontFamily: "'Nunito', system-ui, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Décor : bouteilles fantômes en arrière-plan */}
      <BouteilleDecor color={ISP.burgundy} size={520} style={{ right: -120, bottom: -80, opacity: 0.06 }} />
      <BouteilleDecor color={ISP.terracotta} size={260} style={{ left: -60, top: 80, opacity: 0.05, transform: 'rotate(-12deg)' }} />

      {/* Header */}
      <header
        style={{
          padding: '28px 44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 2,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Logo />
        <div style={{ fontSize: 12.5, color: ISP.muted, fontWeight: 600 }}>
          Pas encore de compte ?{' '}
          <a
            href="/inscription"
            style={{
              color: ISP.burgundy,
              fontWeight: 800,
              textDecoration: 'none',
              borderBottom: `1.5px solid ${ISP.burgundy}`,
              paddingBottom: 1,
            }}
          >
            S'inscrire
          </a>
        </div>
      </header>

      {/* Corps */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          placeItems: 'center',
          padding: '20px 44px 60px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 920,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
            gap: 56,
            alignItems: 'center',
          }}
          className="ispalis-login-grid"
        >
          {/* Colonne éditoriale */}
          <div>
            <Eyebrow>Accès maison</Eyebrow>
            <h1
              style={{
                margin: '18px 0 0',
                fontSize: 'clamp(40px, 6vw, 64px)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 0.98,
                color: ISP.ink,
              }}
            >
              L'accord parfait,
              <br />
              <span style={{ color: ISP.terracotta, fontStyle: 'italic', fontWeight: 700 }}>avec ou sans alcool.</span>
            </h1>
            <p
              style={{
                marginTop: 18,
                fontSize: 15.5,
                color: ISP.muted,
                maxWidth: '36ch',
                lineHeight: 1.55,
              }}
            >
              "L'ingénierie au service de votre table."
            </p>

            <figure
              style={{
                margin: '36px 0 0',
                padding: '20px 0 0',
                borderTop: `2px solid ${ISP.ink}`,
                maxWidth: 420,
              }}
            >
              <blockquote
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 600,
                  lineHeight: 1.45,
                  fontStyle: 'italic',
                  color: ISP.ink,
                  letterSpacing: '-0.005em',
                }}
              >
                « Les accords entre un plat et sa boisson sont comme les notes d'un accord parfait en musique : ils ne doivent ni se couvrir, ni se jalouser, mais fusionner pour créer une mélodie nouvelle qui n'existait pas avant eux.  »
              </blockquote>
              <figcaption
                style={{
                  marginTop: 10,
                  fontSize: 11,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: ISP.terracotta,
                  fontWeight: 800,
                }}
              >
                — Jean Anthelme Brillat-Savarin
              </figcaption>
            </figure>
          </div>

          {/* Formulaire */}
          <form
            onSubmit={handleConnexion}
            style={{
              background: ISP.card,
              borderRadius: 20,
              padding: '36px 36px 32px',
              boxShadow: '0 1px 0 rgba(60,40,20,.04), 0 24px 60px -24px rgba(60,40,20,.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <div style={{ paddingBottom: 14, borderBottom: `2px solid ${ISP.ink}` }}>
              <div
                style={{
                  fontSize: 10.5,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: ISP.terracotta,
                  fontWeight: 800,
                }}
              >
                Connexion
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 0', letterSpacing: '-0.01em' }}>
                Votre service vous attend
              </h2>
            </div>

            <Field label="Email" htmlFor="email">
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vous@maison.fr"
                style={inputSx}
              />
            </Field>

            <Field
              label="Mot de passe"
              htmlFor="password"
              trailing={
                <button
                  type="button"
                  onClick={handleMotDePasseOublie}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    fontSize: 11.5,
                    color: ISP.burgundy,
                    fontWeight: 800,
                    padding: 0,
                  }}
                >
                  Oublié&nbsp;?
                </button>
              }
            >
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{ ...inputSx, paddingRight: 64 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: ISP.muted,
                    padding: '6px 8px',
                  }}
                >
                  {showPassword ? 'Masquer' : 'Voir'}
                </button>
              </div>
            </Field>

            {error && (
              <div
                role="alert"
                style={{
                  background: '#FBE9E9',
                  color: '#8B1A1A',
                  border: '1px solid #E8B8B8',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}
              >
                {error}
              </div>
            )}
            {info && (
              <div
                role="status"
                style={{
                  background: '#E4E8D6',
                  color: '#4A5A2C',
                  border: '1px solid #C5CFA9',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}
              >
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                background: loading ? ISP.rule : ISP.burgundy,
                color: ISP.card,
                border: 'none',
                borderRadius: 14,
                padding: '16px 22px',
                fontFamily: 'inherit',
                fontWeight: 800,
                fontSize: 15.5,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                boxShadow: loading ? 'none' : '0 10px 26px -12px rgba(94,17,25,.45)',
                letterSpacing: '-0.005em',
                transition: 'background .15s, box-shadow .15s',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                <SparkleIcon size={17} color={ISP.ochre} />
                {loading ? 'Connexion…' : 'Entrer'}
              </span>
              <ArrowRightIcon size={14} />
            </button>

            <div
              style={{
                marginTop: 4,
                fontSize: 11.5,
                color: ISP.muted,
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              En continuant, vous acceptez les{' '}
              <a href="/cgu" style={{ color: ISP.muted, textDecoration: 'underline' }}>
                conditions
              </a>{' '}
              et la{' '}
              <a href="/confidentialite" style={{ color: ISP.muted, textDecoration: 'underline' }}>
                confidentialité
              </a>
              .
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          padding: '20px 44px',
          borderTop: `1px solid ${ISP.rule}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 11.5,
          color: ISP.muted,
          position: 'relative',
          zIndex: 2,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <span>Ispalis · L'art de l'accord, en salle.</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
          <a href="/contact" style={{ color: ISP.muted, textDecoration: 'none' }}>
            Contact
          </a>
          <a href="/aide" style={{ color: ISP.muted, textDecoration: 'none' }}>
            Aide
          </a>
        </span>
      </footer>

      {/* Responsive : la grille passe en une colonne sous 880 px */}
      <style>{`
        @media (max-width: 880px) {
          .ispalis-login-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </main>
  )
}

// ─── Sous-composants ──────────────────────────────────────────────

const inputSx: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: ISP.paperWarm,
  border: `1.5px solid ${ISP.rule}`,
  borderRadius: 12,
  padding: '12px 14px',
  fontFamily: 'inherit',
  fontSize: 14.5,
  fontWeight: 600,
  color: ISP.ink,
  outline: 'none',
  transition: 'border-color .15s, box-shadow .15s',
}

function Field({
  label,
  htmlFor,
  trailing,
  children,
}: {
  label: string
  htmlFor: string
  trailing?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 6,
          gap: 12,
        }}
      >
        <label
          htmlFor={htmlFor}
          style={{
            fontSize: 11.5,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: ISP.ink,
            fontWeight: 800,
          }}
        >
          {label}
        </label>
        {trailing}
      </div>
      {children}
    </div>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        fontSize: 11,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        fontWeight: 800,
        color: ISP.terracotta,
      }}
    >
      <span style={{ width: 24, height: 1.5, background: ISP.terracotta }}></span>
      <span>{children}</span>
    </div>
  )
}

function Logo() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        fontWeight: 800,
        fontSize: 26,
        color: ISP.burgundy,
        letterSpacing: '-0.025em',
        lineHeight: 1,
      }}
    >
      <span style={{ fontStyle: 'italic', fontWeight: 800 }}>i</span>
      <span>spalis</span>
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: ISP.terracotta,
          marginLeft: 4,
          alignSelf: 'flex-end',
          marginBottom: 4,
        }}
      ></span>
    </div>
  )
}

function BouteilleDecor({
  color,
  size,
  style,
}: {
  color: string
  size: number
  style: React.CSSProperties
}) {
  return (
    <div
      aria-hidden
      style={{ position: 'absolute', pointerEvents: 'none', ...style }}
    >
      <svg width={size * 0.42} height={size} viewBox="0 0 42 100" style={{ display: 'block' }}>
        <circle cx="21" cy="10" r="9" fill={color} />
        <path
          d="M16 22 L16 36 Q10 42 10 52 L10 92 Q10 98 16 98 L26 98 Q32 98 32 92 L32 52 Q32 42 26 36 L26 22 Z"
          fill={color}
        />
      </svg>
    </div>
  )
}

function SparkleIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 3 L13.5 9 L20 12 L13.5 15 L12 21 L10.5 15 L4 12 L10.5 9 Z" />
    </svg>
  )
}

function ArrowRightIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="13 6 19 12 13 18" />
    </svg>
  )
}
