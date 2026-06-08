'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import PrintAccords from '@/components/PrintAccords'

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

function NavBtn({ label, badge, active, onClick }: { label: string; badge?: number; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 13px', borderRadius: 10, background: active ? ISP.burgundy : 'transparent', color: active ? ISP.card : ISP.ink, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700, transition: 'background .15s' }}
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = `${ISP.sagePale}80` }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
      <span>{label}</span>
      {badge !== undefined && (
        <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 7px', borderRadius: 999, background: active ? ISP.ochre : `${ISP.sage}33`, color: active ? ISP.burgundy : ISP.ink }}>{badge}</span>
      )}
    </button>
  )
}

// Groupe les sessions par période
function getPeriode(date: string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Hier'
  if (diff <= 7) return 'Cette semaine'
  if (diff <= 30) return 'Ce mois'
  return 'Plus ancien'
}

const ORDRE_PERIODES = ["Aujourd'hui", 'Hier', 'Cette semaine', 'Ce mois', 'Plus ancien']

// Accordéon d'un accord plat
const AccordPlat = ({ accord }: { accord: any }) => {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderRadius: 10, border: `1px solid ${ISP.rule}`, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '10px 14px', background: 'transparent',
          border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BottleI color={ISP.burgundy} size={18} />
          <span style={{ fontSize: 14, fontWeight: 800, color: ISP.ink }}>{accord.plat}</span>
        </div>
        <span style={{ fontSize: 16, color: ISP.muted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▾</span>
      </button>

      {open && (
        <div style={{ padding: '0 14px 14px', borderTop: `1px dashed ${ISP.rule}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginTop: 12 }}>
            {[
              { label: 'Accessible', data: accord.accord_accessible, color: ISP.sage },
              { label: 'Intermédiaire', data: accord.accord_intermediaire, color: ISP.terracotta },
              { label: 'Prestige', data: accord.accord_prestige, color: ISP.burgundy },
            ].map(({ label, data, color }) => (
              <div key={label} style={{ background: ISP.paperWarm, borderRadius: 10, padding: '12px 14px', borderTop: `3px solid ${color}` }}>
                <div style={{ fontSize: 10, fontWeight: 800, color, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 6 }}>{label}</div>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: ISP.ink, lineHeight: 1.3 }}>{data?.vin}</div>
                <div style={{ fontSize: 11, color: ISP.muted, marginTop: 4, fontWeight: 600 }}>
                  🍷 {data?.prix_verre} · 🍾 {data?.prix_bouteille}
                </div>
                <div style={{ fontSize: 12, fontStyle: 'italic', color: ISP.ink, marginTop: 8, lineHeight: 1.4 }}>« {data?.argument} »</div>
              </div>
            ))}
          </div>
          {accord.accord_sans_alcool && (
            <div style={{ marginTop: 10, background: ISP.sagePale, borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 10, borderLeft: `3px solid ${ISP.sage}` }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: ISP.sage, textTransform: 'uppercase' as const, whiteSpace: 'nowrap' as const, paddingTop: 1 }}>Sans alcool</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13, color: ISP.ink }}>{accord.accord_sans_alcool?.boisson}</div>
                <div style={{ fontSize: 12, fontStyle: 'italic', color: ISP.muted, marginTop: 2 }}>« {accord.accord_sans_alcool?.argument} »</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Carte d'une session
const SessionCard = ({ session, search }: { session: any; search: string }) => {
  const [open, setOpen] = useState(false)
  const date = new Date(session.created_at)
  const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const heureStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const accords: any[] = session.accords || []
  

  const accordsFiltres = search.trim()
    ? accords.filter(a => a.plat?.toLowerCase().includes(search.toLowerCase()))
    : accords

  if (search.trim() && accordsFiltres.length === 0) return null

  const typeLabels: Record<string, { label: string; color: string; bg: string }> = {
    verre: { label: 'Au verre', color: ISP.burgundy, bg: '#F5E6E8' },
    bouteille: { label: 'À la bouteille', color: ISP.terracotta, bg: '#F9EDE7' },
    carte: { label: 'À la carte', color: ISP.sage, bg: ISP.sagePale },
  }
  const typeInfo = typeLabels[session.type_service || 'verre']

  return (
    <div style={{ background: ISP.card, borderRadius: 16, boxShadow: '0 1px 0 rgba(60,40,20,.04), 0 8px 24px -12px rgba(60,40,20,.15)', overflow: 'hidden' }}>
      {/* Header session */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'left' as const }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: ISP.ink, letterSpacing: '-0.005em' }}>
              {dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}
            </div>
            <div style={{ fontSize: 12, color: ISP.muted, marginTop: 2 }}>
              {heureStr} · {accords.length} plat{accords.length > 1 ? 's' : ''}
            </div>
          </div>
          <div style={{
            fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 999,
            background: typeInfo.bg, color: typeInfo.color,
          }}>
            {typeInfo.label}
          </div>
        </div>
        <span style={{ fontSize: 18, color: ISP.muted, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▾</span>
      </button>

      {/* Accords */}
      {(open || search.trim()) && accordsFiltres.length > 0 && (
  <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column' as const, gap: 8, borderTop: `1px dashed ${ISP.rule}`, paddingTop: 16 }}>
    {accordsFiltres.map((accord: any, i: number) => (
      <AccordPlat key={i} accord={accord} />
    ))}
    <div style={{ marginTop: 8 }}>
      <PrintAccords accords={accordsFiltres} />
    </div>
  </div>
)}
    </div>
  )
}

export default function Historique() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [onglet, setOnglet] = useState<'verre' | 'bouteille' | 'carte'>('verre')
  const [search, setSearch] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { chargerHistorique() }, [])

  const chargerHistorique = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/connexion'); return }
    const { data } = await supabase
      .from('recommandations')
      .select('*, menus(plats, date_menu)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(200)
    if (data) setSessions(data)
    setLoading(false)
  }

  const sessionsFiltrees = sessions.filter(s => (s.type_service || 'verre') === onglet)

  // Grouper par période
  const groupes = sessionsFiltrees.reduce((acc, s) => {
    const p = getPeriode(s.created_at)
    if (!acc[p]) acc[p] = []
    acc[p].push(s)
    return acc
  }, {} as Record<string, any[]>)

  const counts = {
    verre: sessions.filter(s => (s.type_service || 'verre') === 'verre').length,
    bouteille: sessions.filter(s => s.type_service === 'bouteille').length,
    carte: sessions.filter(s => s.type_service === 'carte').length,
  }

  return (
    <main style={{ background: ISP.paper, minHeight: '100vh', color: ISP.ink }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 44px', borderBottom: `1px solid ${ISP.rule}`, background: ISP.paper, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>
          <IspalisLogo size={24} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <NavBtn label="Accords" onClick={() => router.push('/dashboard')} />
          <NavBtn label="Carte" onClick={() => router.push('/carte')} />
          <NavBtn label="Cave" onClick={() => router.push('/stock')} />
          <NavBtn label="Historique" active />
          <NavBtn label="Paramètres" onClick={() => router.push('/parametres')} />
        </div>
      </nav>

      <header style={{ padding: '32px 44px 8px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' as const, fontWeight: 800, color: ISP.terracotta }}>
          <span style={{ width: 24, height: 1.5, background: ISP.terracotta }} />
          <span>Vos accords</span>
          <span style={{ flex: 1, height: 1.5, background: `${ISP.terracotta}33` }} />
        </div>
        <h1 style={{ margin: '14px 0 0', fontSize: 46, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.02, maxWidth: '20ch' }}>
          L&apos;histoire de{' '}
          <span style={{ color: ISP.terracotta, fontStyle: 'italic' }}>vos accords.</span>
        </h1>
        <p style={{ marginTop: 12, fontSize: 15, color: ISP.muted, maxWidth: 560, lineHeight: 1.55 }}>
          Retrouvez tous vos accords générés, organisés par type de service et par date.
        </p>
      </header>

      <div style={{ padding: '24px 44px 64px', maxWidth: 960, margin: '0 auto' }}>

        {/* Onglets */}
        <div style={{ display: 'flex', gap: 0, borderBottom: `2px solid ${ISP.rule}`, marginBottom: 24 }}>
          {([
            { val: 'verre', label: 'Au verre', icon: '🍷' },
            { val: 'bouteille', label: 'À la bouteille', icon: '🍾' },
            { val: 'carte', label: 'À la carte', icon: '📋' },
          ] as const).map(({ val, label, icon }) => (
            <button key={val} onClick={() => setOnglet(val)}
              style={{
                padding: '10px 20px', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 13.5, fontWeight: 800,
                background: 'transparent',
                color: onglet === val ? ISP.burgundy : ISP.muted,
                borderBottom: `2px solid ${onglet === val ? ISP.burgundy : 'transparent'}`,
                marginBottom: -2, transition: 'all .15s',
                display: 'inline-flex', alignItems: 'center', gap: 7,
              }}>
              <span suppressHydrationWarning>{icon}</span>
              {label}
              <span style={{
                fontSize: 10.5, fontWeight: 800, padding: '1px 7px', borderRadius: 999,
                background: onglet === val ? `${ISP.burgundy}15` : ISP.paperWarm,
                color: onglet === val ? ISP.burgundy : ISP.muted,
              }}>
                {counts[val]}
              </span>
            </button>
          ))}
        </div>

        {/* Recherche */}
        <div style={{ marginBottom: 24 }}>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un plat..."
            style={{
              width: '100%', padding: '11px 16px', borderRadius: 12,
              border: `1.5px solid ${ISP.rule}`, fontFamily: 'inherit',
              fontSize: 14, color: ISP.ink, background: ISP.card,
              outline: 'none', boxSizing: 'border-box' as const,
            }}
          />
        </div>

        {/* Contenu */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 16, padding: '60px 0' }}>
            <BottleI color={ISP.burgundy} size={48} />
            <div style={{ fontSize: 15, fontWeight: 700, color: ISP.muted }}>Chargement de l&apos;historique…</div>
          </div>
        ) : sessionsFiltrees.length === 0 ? (
          <div style={{ padding: '48px 24px', borderRadius: 18, background: ISP.card, textAlign: 'center' as const, boxShadow: '0 1px 0 rgba(60,40,20,.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, opacity: 0.3 }}>
              <BottleI color={ISP.muted} size={52} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: ISP.ink, marginBottom: 6 }}>
              Aucun accord "{onglet === 'verre' ? 'au verre' : onglet === 'bouteille' ? 'à la bouteille' : 'à la carte'}"
            </div>
            <div style={{ fontSize: 13, color: ISP.muted, lineHeight: 1.55 }}>
              Générez des accords depuis le dashboard ou la carte pour les retrouver ici.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 32 }}>
            {ORDRE_PERIODES.filter(p => groupes[p]).map(periode => (
              <div key={periode}>
                {/* Séparateur période */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' as const, fontWeight: 800, color: ISP.terracotta, marginBottom: 14 }}>
                  <span style={{ width: 20, height: 1.5, background: ISP.terracotta }} />
                  <span>{periode}</span>
                  <span style={{ flex: 1, height: 1.5, background: `${ISP.terracotta}33` }} />
                  <span style={{ fontSize: 10.5, color: ISP.muted, fontWeight: 700, letterSpacing: 0, textTransform: 'none' as const }}>
                    {groupes[periode].length} session{groupes[periode].length > 1 ? 's' : ''}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                  {groupes[periode].map((session: any) => (
                    <SessionCard key={session.id} session={session} search={search} />
                  ))}
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
