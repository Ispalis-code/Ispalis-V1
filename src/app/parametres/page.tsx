'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Tooltip from '@/components/Tooltip'
import { useTooltip } from '@/context/TooltipContext'

// ─── Ispalis tokens
const ISP = {
  burgundy: '#5E1119',
  burgundyDeep: '#3F0B11',
  ochre: '#EEA300',
  ochreSoft: '#F2BD4E',
  ink: '#1A1410',
  paper: '#F4EDE0',
  paperWarm: '#FBF6EC',
  card: '#FFFCF6',
  sage: '#7D8A5C',
  sageSoft: '#A8B488',
  sagePale: '#E4E8D6',
  terracotta: '#B5613B',
  rule: '#E2D8C2',
  muted: '#7A6A55',
}

// ─── Brand mark
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
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: size * 0.18,
      fontWeight: 800, fontSize: size, color, letterSpacing: '-0.01em', lineHeight: 1,
    }}>
      <span style={{ width: size * 0.22, height: size * 0.22, borderRadius: '50%', background: dot, flexShrink: 0 }} />
      <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: size * 0.04 }}>
        <BottleI color={color} size={size * 1.05} />
        <span>spalis</span>
      </span>
      <span style={{ width: size * 0.22, height: size * 0.22, borderRadius: '50%', background: dot, flexShrink: 0 }} />
    </div>
  )
}

const LogoutIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)
const CheckIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const TYPE_ETABLISSEMENT = [
  { value: 'restaurant', label: 'Restaurant', desc: 'Service à table classique' },
  { value: 'hotel', label: 'Hôtel', desc: 'Restaurant d\u2019hôtel ou table d\u2019hôtes' },
  { value: 'traiteur', label: 'Traiteur', desc: 'Événementiel, réceptions' },
  { value: 'autre', label: 'Autre', desc: 'Bar à vins, cave, etc.' },
]

export default function Parametres() {
 const [nom, setNom] = useState('')
  const [type, setType] = useState('restaurant')
  const [ton, setTon] = useState('professionnel')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const { tooltipsEnabled, toggleTooltips } = useTooltip()

  useEffect(() => { chargerProfil() }, [])

  const chargerProfil = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/connexion'); return }
    setEmail(user.email || '')
    const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
    if (data) {
      setNom(data.nom_etablissement || '')
      setType(data.type_chr || 'restaurant')
      setTon(data.ton_maison || 'professionnel')
    }
  }

  const sauvegarder = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('users').update({
      nom_etablissement: nom,
      type_chr: type,
      ton_maison: ton
    }).eq('id', user.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setLoading(false)
  }

  const handleDeconnexion = async () => {
    await supabase.auth.signOut()
    router.push('/connexion')
  }

  return (
    <main style={{ background: ISP.paper, minHeight: '100vh', color: ISP.ink }}>
      {/* ─── Top nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 44px', borderBottom: `1px solid ${ISP.rule}`,
        background: ISP.paper, position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>
          <IspalisLogo size={24} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <NavBtn label="Accords" onClick={() => router.push('/dashboard')} />
          <NavBtn label="Carte" onClick={() => router.push('/carte')} />
          <NavBtn label="Cave" onClick={() => router.push('/stock')} />
          <NavBtn label="Paramètres" active />
        </div>
      </nav>

      {/* ─── Editorial hero */}
      <header style={{ padding: '32px 44px 8px', maxWidth: 880, margin: '0 auto' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
          fontWeight: 800, color: ISP.terracotta,
        }}>
          <span style={{ width: 24, height: 1.5, background: ISP.terracotta }} />
          <span>Votre établissement</span>
          <span style={{ flex: 1, height: 1.5, background: `${ISP.terracotta}33` }} />
        </div>
        <h1 style={{
          margin: '14px 0 0', fontSize: 46, fontWeight: 800,
          letterSpacing: '-0.025em', lineHeight: 1.02, maxWidth: '20ch',
        }}>
          La maison,{' '}
          <span style={{ color: ISP.terracotta, fontStyle: 'italic' }}>sa voix</span>, ses accords.
        </h1>
        <p style={{
          marginTop: 12, fontSize: 15, color: ISP.muted, maxWidth: 580,
          lineHeight: 1.55,
        }}>
          Ces paramètres influencent la rédaction des accords. Plus Ispalis vous connaît, plus les recommandations sonnent juste.
        </p>
      </header>

      {/* ─── Form */}
      <form
        onSubmit={sauvegarder}
        style={{
          padding: '24px 44px 64px', maxWidth: 880, margin: '0 auto',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}
      >
        {/* Identité */}
        <section style={{
          background: ISP.card, borderRadius: 18,
          padding: '26px 30px',
          boxShadow: '0 1px 0 rgba(60,40,20,.04), 0 12px 32px -16px rgba(60,40,20,.18)',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          <div style={{ paddingBottom: 12, borderBottom: `2px solid ${ISP.ink}` }}>
            <div style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: ISP.terracotta, fontWeight: 800 }}>
              Acte I
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0 0', letterSpacing: '-0.01em' }}>
              Identité
            </h2>
          </div>

          <Field label="Nom de votre établissement">
            <input
              type="text" value={nom} onChange={e => setNom(e.target.value)}
              placeholder="ex: Club Marot"
              style={inputStyle}
            />
          </Field>

          {email && (
            <Field label="Email du compte">
              <div style={{
                ...inputStyle,
                background: ISP.paperWarm,
                color: ISP.muted, cursor: 'not-allowed',
                fontWeight: 600,
              }}>
                {email}
              </div>
            </Field>
          )}
        </section>

        {/* Type d'établissement */}
        <section style={{
          background: ISP.card, borderRadius: 18,
          padding: '26px 30px',
          boxShadow: '0 1px 0 rgba(60,40,20,.04), 0 12px 32px -16px rgba(60,40,20,.18)',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          <div style={{ paddingBottom: 12, borderBottom: `2px solid ${ISP.ink}` }}>
            <div style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: ISP.terracotta, fontWeight: 800 }}>
              Acte II
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0 0', letterSpacing: '-0.01em' }}>
              Type d&apos;établissement
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {TYPE_ETABLISSEMENT.map(opt => (
              <ChoiceCard
                key={opt.value}
                title={opt.label}
                desc={opt.desc}
                active={type === opt.value}
                onClick={() => setType(opt.value)}
              />
            ))}
          </div>
        </section>

        {/* Ton de maison */}
        <section style={{
          background: ISP.card, borderRadius: 18,
          padding: '26px 30px',
          boxShadow: '0 1px 0 rgba(60,40,20,.04), 0 12px 32px -16px rgba(60,40,20,.18)',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          <div style={{ paddingBottom: 12, borderBottom: `2px solid ${ISP.ink}` }}>
            <div style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: ISP.terracotta, fontWeight: 800 }}>
              Acte III
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0 0', letterSpacing: '-0.01em' }}>
              Ton de maison
            </h2>
            <p style={{ fontSize: 13, color: ISP.muted, margin: '6px 0 0', lineHeight: 1.5 }}>
              La voix utilisée pour les arguments d&apos;accord proposés au service.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <TonCard
              title="Professionnel"
              active={ton === 'professionnel'}
              quote="Ce Meursault accompagnera idéalement vos Saint-Jacques."
              onClick={() => setTon('professionnel')}
            />
            <TonCard
              title="Décontracté"
              active={ton === 'decontracte'}
              quote="Ce vin va super bien avec vos Saint-Jacques !"
              onClick={() => setTon('decontracte')}
            />
          </div>
        </section>

      {/* Infobulles */}
        <section style={{
          background: ISP.card, borderRadius: 18,
          padding: '26px 30px',
          boxShadow: '0 1px 0 rgba(60,40,20,.04), 0 12px 32px -16px rgba(60,40,20,.18)',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          <div style={{ paddingBottom: 12, borderBottom: `2px solid ${ISP.ink}` }}>
            <div style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: ISP.terracotta, fontWeight: 800 }}>
              Acte IV
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0 0', letterSpacing: '-0.01em' }}>
              Interface
            </h2>
            <p style={{ fontSize: 13, color: ISP.muted, margin: '6px 0 0', lineHeight: 1.5 }}>
              Personnalisez votre expérience sur Ispalis.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: ISP.ink }}>Infobulles d'aide</div>
              <div style={{ fontSize: 12.5, color: ISP.muted, marginTop: 3 }}>
                Affiche une explication au survol des boutons
              </div>
            </div>
            <Tooltip text={tooltipsEnabled ? 'Cliquez pour désactiver les infobulles' : 'Cliquez pour activer les infobulles'} position="left">
              <button
                type="button"
                onClick={toggleTooltips}
                aria-label="Activer/désactiver les infobulles"
                style={{
                  position: 'relative', width: 48, height: 26, borderRadius: 999,
                  background: tooltipsEnabled ? ISP.burgundy : ISP.rule,
                  border: 'none', cursor: 'pointer',
                  transition: 'background .2s', flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute', top: 3,
                  left: tooltipsEnabled ? 25 : 3,
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,.18)',
                  transition: 'left .2s',
                }} />
              </button>
            </Tooltip>
          </div>
        </section>

        {/* Sticky save bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, marginTop: 4,
        }}>
          <button
            type="button"
            onClick={handleDeconnexion}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 18px', borderRadius: 10,
              background: 'transparent', color: ISP.muted,
              border: `1.5px solid ${ISP.rule}`,
              fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', transition: 'all .15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = ISP.burgundy
              ;(e.currentTarget as HTMLButtonElement).style.color = ISP.burgundy
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = ISP.rule
              ;(e.currentTarget as HTMLButtonElement).style.color = ISP.muted
            }}
          >
            <LogoutIcon size={13} />
            Se déconnecter
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {saved && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', borderRadius: 999,
                background: ISP.sagePale, color: ISP.sage,
                fontSize: 12.5, fontWeight: 800,
              }}>
                <CheckIcon size={12} />
                Paramètres sauvegardés
              </div>
            )}
            <button
              type="submit" disabled={loading}
              style={{
                background: loading ? ISP.muted : ISP.burgundy,
                color: ISP.card, border: 'none', borderRadius: 12,
                padding: '14px 28px',
                fontFamily: 'inherit', fontWeight: 800, fontSize: 14.5,
                cursor: loading ? 'wait' : 'pointer',
                boxShadow: '0 8px 22px -10px rgba(94,17,25,.45)',
                letterSpacing: '-0.005em',
              }}
            >
              {loading ? 'Sauvegarde…' : 'Sauvegarder les paramètres'}
            </button>
          </div>
        </div>
      </form>
    </main>
  )
}

// ─── Sub-components

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  border: `1.5px solid ${ISP.rule}`, borderRadius: 10,
  fontFamily: 'inherit', fontSize: 14.5, color: ISP.ink,
  backgroundColor: ISP.card, outline: 'none',
  fontWeight: 600,
  transition: 'border-color .15s',
  boxSizing: 'border-box',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{
        fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: ISP.muted, marginBottom: 6,
      }}>
        {label}
      </div>
      {children}
    </label>
  )
}

function NavBtn({ label, badge, active, muted, onClick }: {
  label: string; badge?: number; active?: boolean; muted?: boolean; onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '8px 13px', borderRadius: 10,
        background: active ? ISP.burgundy : 'transparent',
        color: active ? ISP.card : muted ? ISP.muted : ISP.ink,
        border: 'none', cursor: 'pointer',
        fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
        transition: 'background .15s',
      }}
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = `${ISP.sagePale}80` }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
    >
      <span>{label}</span>
      {badge !== undefined && (
        <span style={{
          fontSize: 10.5, fontWeight: 800, padding: '2px 7px', borderRadius: 999,
          background: active ? ISP.ochre : `${ISP.sage}33`,
          color: active ? ISP.burgundy : ISP.ink,
        }}>{badge}</span>
      )}
    </button>
  )
}

function ChoiceCard({ title, desc, active, onClick }: {
  title: string; desc: string; active?: boolean; onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 16px', borderRadius: 12,
        background: active ? `${ISP.terracotta}10` : ISP.paperWarm,
        border: `1.5px solid ${active ? ISP.terracotta : ISP.rule}`,
        cursor: 'pointer', transition: 'all .15s',
        position: 'relative',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 4,
      }}>
        <div style={{ fontSize: 14.5, fontWeight: 800, color: ISP.ink, letterSpacing: '-0.005em' }}>
          {title}
        </div>
        <div style={{
          width: 18, height: 18, borderRadius: '50%',
          background: active ? ISP.terracotta : 'transparent',
          border: `1.5px solid ${active ? ISP.terracotta : ISP.rule}`,
          display: 'grid', placeItems: 'center', color: '#fff',
          transition: 'all .15s',
        }}>
          {active && <CheckIcon size={9} />}
        </div>
      </div>
      <div style={{ fontSize: 12, color: ISP.muted, lineHeight: 1.45 }}>{desc}</div>
    </div>
  )
}

function TonCard({ title, quote, active, onClick }: {
  title: string; quote: string; active?: boolean; onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '18px 20px', borderRadius: 14,
        background: active ? ISP.burgundy : ISP.paperWarm,
        color: active ? ISP.card : ISP.ink,
        border: `1.5px solid ${active ? ISP.burgundy : ISP.rule}`,
        cursor: 'pointer', transition: 'all .15s',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: 10,
        minHeight: 130,
      }}
    >
      {active && (
        <div style={{ position: 'absolute', bottom: -16, right: -10, opacity: 0.12 }}>
          <BottleI color={ISP.ochre} size={90} />
        </div>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 800,
          color: active ? ISP.ochre : ISP.terracotta,
        }}>
          Ton
        </div>
        <div style={{
          width: 20, height: 20, borderRadius: '50%',
          background: active ? ISP.ochre : 'transparent',
          border: `1.5px solid ${active ? ISP.ochre : ISP.rule}`,
          display: 'grid', placeItems: 'center', color: ISP.burgundy,
          transition: 'all .15s',
        }}>
          {active && <CheckIcon size={10} />}
        </div>
      </div>
      <div style={{
        fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em',
        position: 'relative',
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 13, fontStyle: 'italic', lineHeight: 1.5,
        color: active ? ISP.ochreSoft : ISP.muted,
        position: 'relative',
      }}>
        « {quote} »
      </div>
    </div>
  )
}
