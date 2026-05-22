'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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

const UploadIcon = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
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

function DishRow({ index, value, onChange, onDelete }: { index: number; value: string; onChange: (v: string) => void; onDelete: () => void }) {
  const filled = value.trim().length > 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: ISP.paperWarm, borderRadius: 10, padding: '4px 6px 4px 12px', border: `1px solid ${filled ? `${ISP.terracotta}40` : ISP.rule}`, transition: 'all .15s' }}>
      <span style={{ fontSize: 13, fontWeight: 800, color: filled ? ISP.burgundy : ISP.muted, minWidth: 20 }}>{index}.</span>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={`Plat ${index}`} style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', padding: '8px 0', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: ISP.ink }} />
      <button onClick={onDelete} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'transparent', color: ISP.muted, cursor: 'pointer', fontSize: 16, fontWeight: 700, display: 'grid', placeItems: 'center', transition: 'all .15s' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${ISP.burgundy}15`; (e.currentTarget as HTMLButtonElement).style.color = ISP.burgundy }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = ISP.muted }}>×</button>
    </div>
  )
}

export default function Carte() {
  const [plats, setPlats] = useState<string[]>([])
  const [stock, setStock] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [importingPDF, setImportingPDF] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const [importOK, setImportOK] = useState(false)
  const [accords, setAccords] = useState<any[]>([])
  const [alertes, setAlertes] = useState<any[]>([])
  const [savedMsg, setSavedMsg] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { chargerDonnees() }, [])

  const chargerDonnees = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/connexion'); return }
    const { data: stockData } = await supabase.from('stocks').select('*').eq('user_id', user.id)
    if (stockData) setStock(stockData)
    const { data: menuData } = await supabase.from('menus').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (menuData) {
      setPlats(menuData.plats as string[])
      const { data: recoData } = await supabase.from('recommandations').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (recoData) {
        setAccords(recoData.accords || [])
        setAlertes(recoData.alertes_stock || [])
      }
    }
  }

  const importerPDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportingPDF(true)
    setImportMsg('')
    setImportOK(false)
    setAccords([])
    const formData = new FormData()
    formData.append('pdf', file)
    try {
      const res = await fetch('/api/extraire-menu', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success && data.plats) {
        setPlats(data.plats)
        setImportMsg(`${data.plats.length} plats extraits — cliquez sur Générer les accords`)
        setImportOK(true)
      } else {
        setImportMsg('Erreur lors de l\u2019extraction')
        setImportOK(false)
      }
    } catch {
      setImportMsg('Erreur réseau')
      setImportOK(false)
    }
    setImportingPDF(false)
  }

  const genererAccords = async () => {
    const platsRemplis = plats.filter(p => p.trim() !== '')
    if (platsRemplis.length === 0) return
    setLoading(true)
    setSavedMsg('')
    setAccords([])
    setAlertes([])
    try {
      const stockFormatted = stock.map(s => ({
        nom: `${s.nom_reference} ${s.millesime || ''}`.trim(),
        quantite: s.quantite,
        jours_sans_mouvement: s.derniere_vente ? Math.floor((new Date().getTime() - new Date(s.derniere_vente).getTime()) / (1000 * 60 * 60 * 24)) : 30
      }))
      const res = await fetch('/api/recommandations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plats: platsRemplis.slice(0, 8), stock: stockFormatted, ton: 'professionnel' })
      })
      const data = await res.json()
      if (data.success) {
        setAccords(data.data.accords || [])
        setAlertes(data.data.alertes_stock || [])
        await sauvegarder(platsRemplis, data.data)
      }
    } catch { console.error('Erreur génération') }
    setLoading(false)
  }

  const sauvegarder = async (platsData: string[], recoData: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('menus').delete().eq('user_id', user.id).eq('date_menu', new Date().toISOString().split('T')[0])
    const { data: menu } = await supabase.from('menus').insert({ user_id: user.id, plats: platsData, date_menu: new Date().toISOString().split('T')[0] }).select().single()
    if (menu) {
      await supabase.from('recommandations').insert({ user_id: user.id, menu_id: menu.id, accords: recoData.accords || [], alertes_stock: recoData.alertes_stock || [], a_valoriser: recoData.a_valoriser || [] })
      setSavedMsg('Accords sauvegardés — disponibles sur le dashboard')
    }
  }

  const ajouterPlat = () => setPlats([...plats, ''])
  const updatePlat = (i: number, v: string) => { const p = [...plats]; p[i] = v; setPlats(p) }
  const supprimerPlat = (i: number) => setPlats(plats.filter((_, idx) => idx !== i))
  const platsRemplis = plats.filter(p => p.trim()).length
  const hasResults = accords.length > 0 || alertes.length > 0 || loading

  // ─── JSX panneau gauche (pas une fonction pour éviter le bug de focus)
  const leftPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Import PDF */}
      <section style={{ background: ISP.card, borderRadius: 18, padding: '28px 30px', boxShadow: '0 1px 0 rgba(60,40,20,.04), 0 12px 32px -16px rgba(60,40,20,.18)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingBottom: 12, borderBottom: `2px solid ${ISP.ink}` }}>
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: ISP.terracotta, fontWeight: 800 }}>Méthode 1</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0 0', letterSpacing: '-0.01em' }}>Importer un PDF</h2>
          </div>
          <UploadIcon size={22} color={ISP.terracotta} />
        </div>
        <p style={{ fontSize: 13.5, color: ISP.muted, margin: 0, lineHeight: 1.55 }}>Uploadez votre carte au format PDF — Ispalis extrait automatiquement les plats.</p>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '28px 20px', borderRadius: 14, border: `2px dashed ${importingPDF ? ISP.terracotta : ISP.rule}`, background: importingPDF ? `${ISP.terracotta}10` : ISP.paperWarm, cursor: importingPDF ? 'wait' : 'pointer', transition: 'all .2s', textAlign: 'center' }}>
          <BottleI color={importingPDF ? ISP.terracotta : ISP.muted} size={28} />
          <div style={{ fontWeight: 800, fontSize: 14, color: ISP.ink }}>{importingPDF ? 'Extraction en cours…' : 'Cliquez ou glissez votre PDF'}</div>
          <div style={{ fontSize: 12, color: ISP.muted }}>Format PDF · Jusqu&apos;à 30 plats détectés</div>
          <input type="file" accept=".pdf" onChange={importerPDF} disabled={importingPDF} style={{ display: 'none' }} />
        </label>
        {importMsg && (
          <div style={{ padding: '10px 14px', borderRadius: 10, background: importOK ? ISP.sagePale : '#FBE9EB', color: importOK ? ISP.sage : ISP.burgundy, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: importOK ? ISP.sage : ISP.burgundy, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, flexShrink: 0 }}>{importOK ? '✓' : '!'}</span>
            {importMsg}
          </div>
        )}
      </section>

      {/* Saisie manuelle */}
      <section style={{ background: ISP.card, borderRadius: 18, padding: '28px 30px', boxShadow: '0 1px 0 rgba(60,40,20,.04), 0 12px 32px -16px rgba(60,40,20,.18)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingBottom: 12, borderBottom: `2px solid ${ISP.ink}` }}>
          <div>
            <div style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: ISP.terracotta, fontWeight: 800 }}>Méthode 2</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0 0', letterSpacing: '-0.01em' }}>Saisir à la main</h2>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 11px', borderRadius: 999, background: platsRemplis > 0 ? ISP.sagePale : ISP.paper, color: platsRemplis > 0 ? ISP.sage : ISP.muted, fontSize: 11.5, fontWeight: 800 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: platsRemplis > 0 ? ISP.sage : ISP.muted }} />
            {platsRemplis} plat{platsRemplis > 1 ? 's' : ''}
          </div>
        </div>
        {plats.length === 0 ? (
          <div style={{ padding: '24px 18px', borderRadius: 12, background: ISP.paperWarm, textAlign: 'center', color: ISP.muted, fontSize: 13.5, lineHeight: 1.55 }}>
            Aucun plat pour l&apos;instant.<br />Importez un PDF ci-dessus, ou ajoutez vos plats ci-dessous.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
            {plats.map((plat, i) => (
              <DishRow key={i} index={i + 1} value={plat} onChange={(v) => updatePlat(i, v)} onDelete={() => supprimerPlat(i)} />
            ))}
          </div>
        )}
        <button onClick={ajouterPlat} style={{ padding: '10px 14px', borderRadius: 10, border: `1.5px dashed ${ISP.terracotta}`, background: 'transparent', color: ISP.terracotta, fontFamily: 'inherit', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>Ajouter un plat
        </button>
      </section>

      {/* Bouton générer */}
      {plats.length > 0 && (
        <div>
          <button onClick={genererAccords} disabled={loading || platsRemplis === 0} style={{ width: '100%', background: (loading || platsRemplis === 0) ? ISP.muted : ISP.burgundy, color: ISP.card, border: 'none', borderRadius: 14, padding: '18px 24px', fontFamily: 'inherit', fontWeight: 800, fontSize: 16, cursor: (loading || platsRemplis === 0) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, boxShadow: '0 10px 28px -12px rgba(94,17,25,.45)', transition: 'all .2s', letterSpacing: '-0.005em' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
              <SparkleIcon size={18} color={ISP.ochre} />
              {loading ? 'Génération en cours…' : `Générer les accords pour ${platsRemplis} plat${platsRemplis > 1 ? 's' : ''}`}
            </span>
            {!loading && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 700, opacity: 0.75 }}>Acte II <ArrowRightIcon size={14} /></span>}
          </button>
          {savedMsg && (
            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: ISP.sagePale, color: ISP.sage, fontSize: 13, fontWeight: 700, textAlign: 'center' }}>
              ✓ {savedMsg}
            </div>
          )}
        </div>
      )}
    </div>
  )

  // ─── JSX panneau droit (pas une fonction pour éviter le bug de focus)
  const rightPanel = (
    <div>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
          <BottleI color={ISP.burgundy} size={52} />
          <div style={{ fontSize: 16, fontWeight: 800, color: ISP.burgundy }}>Génération en cours…</div>
          <div style={{ fontSize: 13, color: ISP.muted }}>15 à 45 secondes selon le nombre de plats</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 800, color: ISP.terracotta, marginBottom: 20 }}>
            <span style={{ width: 24, height: 1.5, background: ISP.terracotta }} />
            <span>Acte II · Vos accords</span>
            <span style={{ flex: 1, height: 1.5, background: `${ISP.terracotta}33` }} />
          </div>

          {alertes.length > 0 && (
            <div style={{ background: '#FFF7E0', border: `1.5px solid ${ISP.ochre}`, borderRadius: 14, padding: '18px 22px', marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 800, color: '#7A5210', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: ISP.ochre, color: ISP.burgundy, display: 'grid', placeItems: 'center', fontSize: 13 }}>!</span>
                Alertes stock
              </div>
              {alertes.map((a: any, i: number) => (
                <div key={i} style={{ marginBottom: 10, color: ISP.ink, fontSize: 14 }}>
                  <strong>{a.reference}</strong> — {a.message}
                  <div style={{ color: ISP.muted, fontSize: 13, marginTop: 2 }}>→ {a.action}</div>
                </div>
              ))}
            </div>
          )}

          {accords.map((accord: any, i: number) => (
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
                    <div style={{ fontWeight: 800, color: ISP.ink, fontSize: 14.5 }}>{accord.accord_sans_alcool?.boisson}</div>
                    <div style={{ fontSize: 13, fontStyle: 'italic', color: ISP.ink, marginTop: 4, lineHeight: 1.45 }}>« {accord.accord_sans_alcool?.argument} »</div>
                  </div>
                </div>
              )}
            </article>
          ))}
        </>
      )}
    </div>
  )

  return (
    <main style={{ background: ISP.paper, minHeight: '100vh', color: ISP.ink }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 44px', borderBottom: `1px solid ${ISP.rule}`, background: ISP.paper, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>
          <IspalisLogo size={24} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <NavBtn label="Accords" onClick={() => router.push('/dashboard')} />
          <NavBtn label="Carte" active />
          <NavBtn label="Cave" badge={stock.length || undefined} onClick={() => router.push('/stock')} />
          <NavBtn label="Paramètres" onClick={() => router.push('/parametres')} />
        </div>
      </nav>

      {hasResults ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)', gap: 32, padding: '28px 44px 64px', maxWidth: 1440, margin: '0 auto' }}>
          <div style={{ position: 'sticky', top: 80, alignSelf: 'start', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
            {leftPanel}
          </div>
          <div>
            {rightPanel}
          </div>
        </div>
      ) : (
        <>
          <header style={{ padding: '32px 44px 8px', maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 800, color: ISP.terracotta }}>
              <span style={{ width: 24, height: 1.5, background: ISP.terracotta }} />
              <span>Votre carte</span>
              <span style={{ flex: 1, height: 1.5, background: `${ISP.terracotta}33` }} />
            </div>
            <h1 style={{ margin: '14px 0 0', fontSize: 46, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.02, maxWidth: '20ch' }}>
              Importez votre carte,{' '}
              <span style={{ color: ISP.terracotta, fontStyle: 'italic' }}>accordez-la</span> d&apos;un geste.
            </h1>
            <p style={{ marginTop: 12, fontSize: 15, color: ISP.muted, maxWidth: 600, lineHeight: 1.55 }}>
              Uploadez un PDF ou saisissez vos plats à la main — Ispalis génère les accords pour l&apos;ensemble du menu.
            </p>
          </header>
          <div style={{ padding: '24px 44px 64px', maxWidth: 1280, margin: '0 auto' }}>
            {leftPanel}
          </div>
        </>
      )}
    </main>
  )
}
