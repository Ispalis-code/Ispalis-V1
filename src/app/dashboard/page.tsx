'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'
import Tooltip from '@/components/Tooltip';

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

const SAMPLE_DISHES = [
  'Magret de canard aux cerises',
  'Risotto aux champignons des bois',
  'Tartare de bœuf au couteau',
  'Saint-Jacques poêlées',
  'Tarte fine aux figues, chèvre frais',
]

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

const SparkleIcon = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 3 L13.5 9 L20 12 L13.5 15 L12 21 L10.5 15 L4 12 L10.5 9 Z" />
  </svg>
)

const ArrowRightIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="13 6 19 12 13 18" />
  </svg>
)

function NavBtn({ label, badge, active, muted, onClick }: { label: string; badge?: number; active?: boolean; muted?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 13px', borderRadius: 10, background: active ? ISP.burgundy : 'transparent', color: active ? ISP.card : muted ? ISP.muted : ISP.ink, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700, transition: 'background .15s' }}
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = `${ISP.sagePale}80` }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
      <span>{label}</span>
      {badge !== undefined && (
        <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 7px', borderRadius: 999, background: active ? ISP.ochre : `${ISP.sage}33`, color: active ? ISP.burgundy : ISP.ink }}>{badge}</span>
      )}
    </button>
  )
}

function BottleRow({ index, value, onChange }: { index: number; value: string; onChange: (v: string) => void }) {
  const filled = value.trim().length > 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: `1.5px dashed ${filled ? ISP.terracotta : ISP.rule}`, paddingBottom: 12, transition: 'all .2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, opacity: filled ? 1 : 0.55, minWidth: 50 }}>
        <BottleI color={filled ? ISP.burgundy : ISP.muted} size={22} />
        <span style={{ fontSize: 22, fontWeight: 800, color: filled ? ISP.burgundy : ISP.muted, letterSpacing: '-0.04em', minWidth: 16 }}>{index}</span>
      </div>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={`ex: ${SAMPLE_DISHES[index - 1]}`} style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', padding: '6px 0', fontFamily: 'inherit', fontSize: 15.5, fontWeight: 600, color: ISP.ink, fontStyle: filled ? 'normal' : 'italic' }} />
      {filled && (
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: ISP.sage, padding: '4px 9px', borderRadius: 999, background: ISP.sagePale, flexShrink: 0 }}>Prêt</div>
      )}
    </div>
  )
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <li style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ width: 26, height: 26, borderRadius: '50%', background: ISP.sagePale, color: ISP.sage, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12.5, flexShrink: 0 }}>{n}</span>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: ISP.muted, lineHeight: 1.5 }}>{children}</div>
      </div>
    </li>
  )
}
function AlertesStock({ alertes }: { alertes: any[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: '#FFF7E0', border: `1.5px solid #EEA300`, borderRadius: 14, marginBottom: 22, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '14px 22px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'inherit' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 800, color: '#7A5210', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#EEA300', color: '#5E1119', display: 'grid', placeItems: 'center', fontSize: 13 }}>!</span>
          {alertes.length} alerte{alertes.length > 1 ? 's' : ''} stock
        </div>
        <span style={{ fontSize: 18, color: '#7A5210', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: '0 22px 16px', borderTop: '1px solid #EEA30040' }}>
          {alertes.map((a: any, i: number) => (
            <div key={i} style={{ marginTop: 12, color: '#1A1410', fontSize: 14 }}>
              <strong>{a.reference}</strong> — {a.message}
              <div style={{ color: '#7A6A55', fontSize: 13, marginTop: 2 }}>→ {a.action}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
export default function Dashboard() {
  const [plats, setPlats] = useState(['', '', '', '', ''])
  const [stock, setStock] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [resultats, setResultats] = useState<any>(null)
  const [erreur, setErreur] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { chargerStock() }, [])

  const chargerStock = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/connexion'); return }
    const { data } = await supabase.from('stocks').select('*').eq('user_id', user.id)
    if (data) setStock(data)
  }

  const handleDeconnexion = async () => {
    await supabase.auth.signOut()
    router.push('/connexion')
  }

  const updatePlat = (index: number, value: string) => {
    const newPlats = [...plats]
    newPlats[index] = value
    setPlats(newPlats)
  }

  const genererAccords = async () => {
    const platsRemplis = plats.filter(p => p.trim() !== '')
    if (platsRemplis.length === 0) { setErreur('Ajoutez au moins un plat'); return }
    setLoading(true)
    setErreur('')
    setResultats(null)
    try {
      const stockFormatted = stock.map(s => ({
        nom: `${s.nom_reference} ${s.millesime || ''}`.trim(),
        quantite: s.quantite,
        jours_sans_mouvement: s.derniere_vente
          ? Math.floor((new Date().getTime() - new Date(s.derniere_vente).getTime()) / (1000 * 60 * 60 * 24))
          : 30,
      }))
      const response = await fetch('/api/recommandations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plats: platsRemplis, stock: stockFormatted, ton: 'professionnel' }),
      })
      const data = await response.json()
      if (data.success) { setResultats(data.data) } else { setErreur('Erreur lors de la génération') }
    } catch { setErreur('Erreur réseau') }
    setLoading(false)
  }

  const filledCount = plats.filter(p => p.trim()).length
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long' })
  const todayCap = today.charAt(0).toUpperCase() + today.slice(1)

  // ─── JSX formulaire (variable, pas une fonction — évite le bug de focus)
  const formSection = (
    <section style={{ background: ISP.card, borderRadius: 18, padding: '28px 32px', boxShadow: '0 1px 0 rgba(60,40,20,.04), 0 12px 32px -16px rgba(60,40,20,.18)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingBottom: 14, borderBottom: `2px solid ${ISP.ink}` }}>
        <div>
          <div style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: ISP.terracotta, fontWeight: 800 }}>Acte I</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 0', letterSpacing: '-0.01em' }}>Vos plats</h2>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 11px', borderRadius: 999, background: filledCount > 0 ? ISP.sagePale : ISP.paper, color: filledCount > 0 ? ISP.sage : ISP.muted, fontSize: 11.5, fontWeight: 800 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: filledCount > 0 ? ISP.sage : ISP.muted }} />
          {filledCount}/5 complétés
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {plats.map((plat, i) => (
          <BottleRow key={i} index={i + 1} value={plat} onChange={(v) => updatePlat(i, v)} />
        ))}
      </div>
      {erreur && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FBE9EB', color: ISP.burgundy, fontSize: 13, fontWeight: 700, border: `1px solid ${ISP.burgundy}33` }}>
          {erreur}
        </div>
      )}
    <Tooltip text="Génère instantanément les meilleurs accords mets-boissons pour chaque plat saisi" position="top">
  <button onClick={genererAccords} disabled={loading} style={{ marginTop: 4, background: loading ? ISP.muted : ISP.burgundy, color: ISP.card, border: 'none', borderRadius: 14, padding: '16px 22px', fontFamily: 'inherit', fontWeight: 800, fontSize: 15.5, cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, boxShadow: '0 8px 22px -10px rgba(94,17,25,.45)', transition: 'all .2s', letterSpacing: '-0.005em', width: '100%' }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
      <SparkleIcon size={17} color={ISP.ochre} />
      {loading ? 'Génération en cours…' : 'Générer les accords Ispalis'}
    </span>
    {!loading && (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 700, opacity: 0.75 }}>
        Acte II <ArrowRightIcon size={14} />
      </span>
    )}
  </button>
</Tooltip>
    </section>
  )

  // ─── JSX accords (variable, pas une fonction — évite le bug de focus)
  const accordsSection = resultats ? (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 800, color: ISP.terracotta, marginBottom: 16 }}>
        <span style={{ width: 24, height: 1.5, background: ISP.terracotta }} />
        <span>Acte II · Vos accords</span>
        <span style={{ flex: 1, height: 1.5, background: `${ISP.terracotta}33` }} />
      </div>

      {resultats.alertes_stock && resultats.alertes_stock.length > 0 && (
  <AlertesStock alertes={resultats.alertes_stock} />
)}

      {resultats.accords && resultats.accords.map((accord: any, i: number) => (
        <article key={i} style={{ background: ISP.card, borderRadius: 18, padding: '26px 30px', marginBottom: 18, boxShadow: '0 1px 0 rgba(60,40,20,.04), 0 12px 32px -18px rgba(60,40,20,.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 18, marginBottom: 18, borderBottom: `1.5px dashed ${ISP.rule}` }}>
            <BottleI color={ISP.burgundy} size={26} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: ISP.terracotta, fontWeight: 800 }}>Plat {i + 1}</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, margin: '2px 0 0', color: ISP.burgundy, letterSpacing: '-0.015em' }}>{accord.plat}</h3>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 14 }}>
            {[
              { label: 'Accessible', data: accord.accord_accessible, color: ISP.sage },
              { label: 'Intermédiaire', data: accord.accord_intermediaire, color: ISP.terracotta },
              { label: 'Prestige', data: accord.accord_prestige, color: ISP.burgundy },
            ].map(({ label, data, color }) => (
              <div key={label} style={{ background: ISP.paperWarm, borderRadius: 12, padding: '16px 16px 18px', borderTop: `4px solid ${color}` }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>{label}</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: ISP.ink, lineHeight: 1.3 }}>{data?.vin}</div>
                <div style={{ color: ISP.muted, fontSize: 12, marginTop: 4, fontWeight: 600, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span>🍷 verre : {data?.prix_verre}</span>
                  <span style={{ color: ISP.rule }}>·</span>
                  <span>🍾 bouteille : {data?.prix_bouteille}</span>
                </div>
                <div style={{ fontSize: 13, fontStyle: 'italic', color: ISP.ink, marginTop: 10, lineHeight: 1.45 }}>« {data?.argument} »</div>
              </div>
            ))}
          </div>
          {accord.accord_sans_alcool && (
            <div style={{ background: ISP.sagePale, borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'flex-start', borderLeft: `4px solid ${ISP.sage}` }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: ISP.sage, textTransform: 'uppercase', letterSpacing: '0.12em', whiteSpace: 'nowrap', paddingTop: 1 }}>Sans alcool</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: ISP.ink, fontSize: 14.5 }}>{accord.accord_sans_alcool.boisson}</div>
                <div style={{ fontSize: 13, fontStyle: 'italic', color: ISP.ink, marginTop: 4, lineHeight: 1.45 }}>« {accord.accord_sans_alcool.argument} »</div>
              </div>
            </div>
          )}
        </article>
      ))}

      {resultats.a_valoriser && resultats.a_valoriser.length > 0 && (
        <div style={{ background: ISP.burgundy, color: ISP.card, borderRadius: 18, padding: '24px 28px', marginTop: 18, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.08 }}>
            <BottleI color={ISP.ochre} size={130} />
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 800, color: ISP.ochre, marginBottom: 12 }}>À valoriser ce soir</div>
            {resultats.a_valoriser.map((v: any, i: number) => (
              <div key={i} style={{ marginBottom: 12, fontSize: 14.5 }}>
                <strong>{v.reference}</strong> sur <strong>{v.plat}</strong>
                <div style={{ color: ISP.ochreSoft, fontSize: 13, marginTop: 3, fontStyle: 'italic' }}>→ {v.argument}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  ) : loading ? (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 16 }}>
      <BottleI color={ISP.burgundy} size={48} />
      <div style={{ fontSize: 15, fontWeight: 700, color: ISP.burgundy }}>Génération en cours…</div>
      <div style={{ fontSize: 13, color: ISP.muted }}>15 à 45 secondes selon le nombre de plats</div>
    </div>
  ) : null

  return (
    <main style={{ background: ISP.paper, minHeight: '100vh', color: ISP.ink }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 44px', borderBottom: `1px solid ${ISP.rule}`, background: ISP.paper, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>
          <IspalisLogo size={24} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
  <Tooltip text="Importez votre carte et générez des accords pour chaque plat" position="bottom">
    <NavBtn label="Carte" onClick={() => router.push('/carte')} />
  </Tooltip>
  <Tooltip text="Vue salle en temps réel — consultez les accords pendant le service" position="bottom">
    <NavBtn label="📱 Service" onClick={() => router.push('/service')} />
  </Tooltip>
  <Tooltip text="Gérez votre cave et importez votre stock de vins et boissons" position="bottom">
    <NavBtn label="Cave" badge={stock.length || undefined} onClick={() => router.push('/stock')} />
  </Tooltip>
  <Tooltip text="Personnalisez le ton et le style de vos accords générés" position="bottom">
    <NavBtn label="Paramètres" onClick={() => router.push('/parametres')} />
  </Tooltip>
  <div style={{ width: 1, height: 22, background: ISP.rule, margin: '0 8px' }} />
  <NavBtn label="Déconnexion" muted onClick={handleDeconnexion} />
</div>
      </nav>

      {/* SPLIT SCREEN si accords générés ou en cours */}
      {resultats || loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.6fr)', gap: 32, padding: '28px 44px 64px', maxWidth: 1440, margin: '0 auto' }}>
          <div style={{ position: 'sticky', top: 80, alignSelf: 'start' }}>
            {formSection}
          </div>
          <div style={{ overflowY: 'auto' }}>
            {accordsSection}
          </div>
        </div>
      ) : (
        /* LAYOUT ORIGINAL */
        <>
          <header style={{ padding: '32px 44px 8px', maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 800, color: ISP.terracotta }}>
              <span style={{ width: 24, height: 1.5, background: ISP.terracotta }} />
              <span>Service du soir · {todayCap}</span>
              <span style={{ flex: 1, height: 1.5, background: `${ISP.terracotta}33` }} />
            </div>
            <h1 style={{ margin: '14px 0 0', fontSize: 46, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.02, maxWidth: '20ch' }}>
              Composez votre carte,{' '}
              <span style={{ color: ISP.terracotta, fontStyle: 'italic' }}>accordée</span> au verre.
            </h1>
            <p style={{ marginTop: 12, fontSize: 15, color: ISP.muted, maxWidth: 560, lineHeight: 1.55 }}>
              Saisissez vos plats du jour, Ispalis génère les accords mets-boissons en piochant d&apos;abord dans votre cave.
            </p>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 32, padding: '24px 44px 64px', maxWidth: 1280, margin: '0 auto' }}>
            {formSection}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ borderRadius: 18, padding: '24px 24px', background: ISP.ochre, color: ISP.burgundy, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: -22, right: -10, opacity: 0.18 }}>
                  <BottleI color={ISP.burgundy} size={120} />
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 800 }}>Votre cave</div>
                  <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em', marginTop: 6 }}>
                    {stock.length}<span style={{ fontSize: 18, fontWeight: 700, opacity: 0.6, marginLeft: 6 }}>réf.</span>
                  </div>
                  <div style={{ fontSize: 13, marginTop: 10, maxWidth: '24ch', lineHeight: 1.45 }}>
                    {stock.length === 0 ? 'Ajoutez vos références pour qu\u2019Ispalis les propose en priorité.' : 'Piochées en priorité dans vos accords du soir.'}
                  </div>
                  <button onClick={() => router.push('/stock')} style={{ marginTop: 16, background: ISP.burgundy, color: ISP.ochre, border: 'none', borderRadius: 10, padding: '8px 14px', fontFamily: 'inherit', fontWeight: 800, fontSize: 12.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                    {stock.length === 0 ? 'Ajouter des références' : 'Gérer ma cave'} <ArrowRightIcon size={12} />
                  </button>
                </div>
              </div>
              <div style={{ background: ISP.card, borderRadius: 18, padding: '22px 24px', boxShadow: '0 1px 0 rgba(60,40,20,.04), 0 8px 24px -16px rgba(60,40,20,.15)' }}>
                <div style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: ISP.terracotta, fontWeight: 800 }}>Comment ça marche</div>
                <ol style={{ paddingLeft: 0, margin: '14px 0 0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Step n="1" title="Saisissez vos plats">Décrivez les plats du soir — garnitures et sauces comprises.</Step>
                  <Step n="2" title="Ispalis pioche dans votre cave">Les références déjà en stock sont proposées en priorité.</Step>
                  <Step n="3" title="Recevez vos accords">Trois gammes de prix par plat — et une option sans alcool.</Step>
                </ol>
              </div>
            </aside>
          </div>
        </>
      )}
      <Footer />
    </main>
  )
}
