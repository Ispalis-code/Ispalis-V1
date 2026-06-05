'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Tooltip from '@/components/Tooltip'

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
function AlertesStock({ alertes }: { alertes: any[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: '#FFF7E0', border: `1.5px solid #EEA300`, borderRadius: 14, marginBottom: 22, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', padding: '14px 22px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'inherit' }}>
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

function FiltreGroupe({ label, options, selected, onToggle, accentColor, bgColor }: {
  label: string
  options: { val: string; label: string }[]
  selected: string[]
  onToggle: (v: string) => void
  accentColor: string
  bgColor: string
}) {
  return (
    <div>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: ISP.muted, marginBottom: 5, letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 5 }}>
        {options.map(({ val, label }) => (
          <button key={val} onClick={() => onToggle(val)}
            style={{
              padding: '4px 11px', borderRadius: 999,
              border: `1px solid ${selected.includes(val) ? accentColor : ISP.rule}`,
              background: selected.includes(val) ? bgColor : ISP.card,
              color: selected.includes(val) ? accentColor : ISP.muted,
              fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700,
              cursor: 'pointer', transition: 'all .12s',
            }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Vérifie si un vin est en cave (correspondance exacte insensible à la casse)
function estEnCave(nomVin: string, stock: any[]): boolean {
  if (!nomVin) return false
  const needle = nomVin.toLowerCase().trim()
  return stock.some(s => {
    const ref = `${s.nom_reference} ${s.millesime || ''}`.toLowerCase().trim()
    return ref === needle
  })
}

// ─── Carte d'un accord individuel avec badge cave + bouton alternative
function AccordCard({ label, data, color, stock }: {
  label: string
  data: any
  color: string
  stock: any[]
}) {
  const [alternative, setAlternative] = useState<any>(null)
  const [loadingAlt, setLoadingAlt] = useState(false)
  const enCave = estEnCave(data?.vin, stock)

  const trouverAlternative = async () => {
    setLoadingAlt(true)
    try {
      const stockNoms = stock.map(s => `${s.nom_reference} ${s.millesime || ''}`.trim()).join(', ')
      const res = await fetch('/api/recommandations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plats: [`Trouver dans ma cave une alternative au vin suivant : "${data?.vin}". Cave disponible : ${stockNoms}. Réponds uniquement avec le nom du vin de remplacement le plus proche et son argument d'accord en 1 phrase.`],
          stock: stock.map(s => ({ nom: `${s.nom_reference} ${s.millesime || ''}`.trim(), quantite: s.quantite, jours_sans_mouvement: 30 })),
          ton: 'professionnel',
          mode_alternatif: true,
        }),
      })
      const result = await res.json()
      if (result.success && result.data?.accords?.[0]) {
        const acc = result.data.accords[0]
        const altData = acc.accord_accessible || acc.accord_intermediaire || acc.accord_prestige
        setAlternative(altData)
      }
    } catch { console.error('Erreur alternative') }
    setLoadingAlt(false)
  }

  return (
    <div style={{ background: ISP.paperWarm, borderRadius: 12, padding: '16px 16px 18px', borderTop: `4px solid ${color}` }}>
      {/* Label + badge cave */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 10.5, fontWeight: 800, color, textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>
          {label}
        </div>
        {enCave && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: ISP.sagePale, color: ISP.sage,
            fontSize: 10, fontWeight: 800, padding: '2px 8px',
            borderRadius: 999, letterSpacing: '0.06em',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: ISP.sage, flexShrink: 0 }} />
            En cave
          </div>
        )}
      </div>

      {/* Nom du vin */}
      <div style={{ fontWeight: 800, fontSize: 15, color: ISP.ink, lineHeight: 1.3 }}>{data?.vin}</div>
      <div style={{ color: ISP.muted, fontSize: 12, marginTop: 4, fontWeight: 600, display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
        <span>🍷 verre : {data?.prix_verre}</span>
        <span style={{ color: ISP.rule }}>·</span>
        <span>🍾 bouteille : {data?.prix_bouteille}</span>
      </div>
      <div style={{ fontSize: 13, fontStyle: 'italic', color: ISP.ink, marginTop: 10, lineHeight: 1.45 }}>
        « {data?.argument} »
      </div>

      {/* Alternative */}
      {!enCave && !alternative && (
        <button
          onClick={trouverAlternative}
          disabled={loadingAlt}
          style={{
            marginTop: 12, padding: '6px 12px', borderRadius: 8,
            border: `1px dashed ${ISP.sage}`,
            background: 'transparent', color: ISP.sage,
            fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700,
            cursor: loadingAlt ? 'wait' : 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            transition: 'all .15s',
          }}>
          {loadingAlt
            ? '⏳ Recherche…'
            : '🔍 Trouver une alternative en cave'}
        </button>
      )}

      {alternative && (
        <div style={{
          marginTop: 12, padding: '10px 12px', borderRadius: 10,
          background: ISP.sagePale, borderLeft: `3px solid ${ISP.sage}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: ISP.sage }} />
            <span style={{ fontSize: 10, fontWeight: 800, color: ISP.sage, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
              Alternative en cave
            </span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 13.5, color: ISP.ink }}>{alternative.vin}</div>
          {alternative.argument && (
            <div style={{ fontSize: 12, fontStyle: 'italic', color: ISP.muted, marginTop: 3, lineHeight: 1.4 }}>
              « {alternative.argument} »
            </div>
          )}
        </div>
      )}
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
 const [parametres, setParametres] = useState({
  types: ['vin'] as string[],
  filtres: {} as Record<string, string[]>,
  budget: 'les trois niveaux',
  cave_priorite: true,
})
const [ongletActif, setOngletActif] = useState('vin')

const toggleType = (val: string) => {
  setParametres(prev => {
    const next = prev.types.includes(val)
      ? prev.types.filter(x => x !== val)
      : [...prev.types, val]
    return { ...prev, types: next }
  })
  if (!parametres.types.includes(val)) {
    setOngletActif(val)
  } else if (ongletActif === val) {
    const remaining = parametres.types.filter(x => x !== val)
    if (remaining.length > 0) setOngletActif(remaining[0])
  }
}

const toggleFiltre = (type: string, cat: string, val: string) => {
  setParametres(prev => {
    const key = `${type}_${cat}`
    const current = prev.filtres[key] || []
    const updated = current.includes(val) ? current.filter(x => x !== val) : [...current, val]
    return { ...prev, filtres: { ...prev.filtres, [key]: updated } }
  })
}

const getFiltre = (type: string, cat: string) =>
  parametres.filtres[`${type}_${cat}`] || []
  
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

 const genererAccords = async (platsOverride?: string[]) => {
  const platsRemplis = platsOverride || plats.filter(p => p.trim() !== '')
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
        body: JSON.stringify({ plats: platsRemplis.slice(0, 8), stock: stockFormatted, ton: 'professionnel' , parametres })
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
  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ flex: 1 }}>
      <DishRow index={i + 1} value={plat} onChange={(v) => updatePlat(i, v)} onDelete={() => supprimerPlat(i)} />
    </div>
    <button
      onClick={() => genererAccords([plat])}
      disabled={loading || !plat.trim()}
      title="Générer uniquement ce plat"
      style={{ flexShrink: 0, padding: '6px 10px', borderRadius: 8, border: `1px solid ${ISP.terracotta}`, background: 'transparent', color: ISP.terracotta, fontFamily: 'inherit', fontSize: 11, fontWeight: 700, cursor: plat.trim() ? 'pointer' : 'not-allowed', opacity: plat.trim() ? 1 : 0.3, whiteSpace: 'nowrap' as const }}>
      ✨
    </button>
  </div>
))}
          </div>
        )}
        <button onClick={ajouterPlat} style={{ padding: '10px 14px', borderRadius: 10, border: `1.5px dashed ${ISP.terracotta}`, background: 'transparent', color: ISP.terracotta, fontFamily: 'inherit', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>Ajouter un plat
        </button>
      </section>
<div style={{ background: ISP.paperWarm, borderRadius: 14, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
  <div style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: ISP.terracotta, fontWeight: 800 }}>
    Paramètres de génération
  </div>

  {/* Sélecteur de types */}
  <div>
    <div style={{ fontSize: 11, fontWeight: 700, color: ISP.muted, marginBottom: 6 }}>TYPE DE BOISSON</div>
    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
      {[
        { val: 'vin', label: '🍷 Vins' },
        { val: 'biere', label: '🍺 Bières' },
        { val: 'petillant', label: '🥂 Pétillants' },
        { val: 'spiritueux', label: '🥃 Spiritueux' },
        { val: 'sans_alcool', label: '🫧 Sans alcool' },
      ].map(({ val, label }) => (
        <button key={val} onClick={() => toggleType(val)}
          style={{
            padding: '6px 13px', borderRadius: 999,
            border: `1.5px solid ${parametres.types.includes(val) ? ISP.burgundy : ISP.rule}`,
            background: parametres.types.includes(val) ? '#F5E6E8' : ISP.card,
            color: parametres.types.includes(val) ? ISP.burgundy : ISP.muted,
            fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
            transition: 'all .15s',
          }}>
          {label}
        </button>
      ))}
    </div>
  </div>

  {/* Onglets par type sélectionné */}
  {parametres.types.length > 0 && (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>

      {/* Barre d'onglets */}
      {parametres.types.length > 1 && (
        <div style={{ display: 'flex', gap: 4, borderBottom: `1.5px solid ${ISP.rule}`, paddingBottom: 0 }}>
          {parametres.types.map(type => {
            const labels: Record<string, string> = {
              vin: '🍷 Vins', biere: '🍺 Bières', petillant: '🥂 Pétillants',
              spiritueux: '🥃 Spiritueux', sans_alcool: '🫧 Sans alcool',
            }
            return (
              <button key={type} onClick={() => setOngletActif(type)}
                style={{
                  padding: '6px 14px', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
                  background: 'transparent',
                  color: ongletActif === type ? ISP.burgundy : ISP.muted,
                  borderBottom: `2px solid ${ongletActif === type ? ISP.burgundy : 'transparent'}`,
                  marginBottom: -1.5, transition: 'all .15s',
                }}>
                {labels[type]}
              </button>
            )
          })}
        </div>
      )}

      {/* Filtres pour l'onglet actif */}
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>

        {/* ─── VIN */}
        {ongletActif === 'vin' && parametres.types.includes('vin') && (
          <>
            <FiltreGroupe label="COULEUR"
              options={[
                { val: 'rouge', label: 'Rouge' }, { val: 'blanc', label: 'Blanc' },
                { val: 'rosé', label: 'Rosé' }, { val: 'orange', label: 'Orange' },
              ]}
              selected={getFiltre('vin', 'couleur')}
              onToggle={(v) => toggleFiltre('vin', 'couleur', v)}
              accentColor={ISP.burgundy}
              bgColor='#F5E6E8'
            />
            <FiltreGroupe label="STYLE"
              options={[
                { val: 'léger et frais', label: 'Léger & frais' },
                { val: 'charnu et puissant', label: 'Charnu' },
                { val: 'accords régionaux', label: 'Régional' },
                { val: 'vins naturels', label: 'Naturel / bio' },
                { val: 'classique', label: 'Classique' },
                { val: 'vins de garde', label: 'De garde' },
              ]}
              selected={getFiltre('vin', 'style')}
              onToggle={(v) => toggleFiltre('vin', 'style', v)}
              accentColor={ISP.terracotta}
              bgColor='#F9EDE7'
            />
          </>
        )}

        {/* ─── BIÈRE */}
        {ongletActif === 'biere' && parametres.types.includes('biere') && (
          <>
            <FiltreGroupe label="FAMILLE"
              options={[
                { val: 'lager', label: 'Lager' }, { val: 'ale', label: 'Ale' },
                { val: 'ipa', label: 'IPA' }, { val: 'stout', label: 'Stout / Porter' },
                { val: 'blanche', label: 'Blanche' }, { val: 'ambrée', label: 'Ambrée' },
                { val: 'sour', label: 'Sour / Acide' }, { val: 'craft', label: 'Craft locale' },
              ]}
              selected={getFiltre('biere', 'famille')}
              onToggle={(v) => toggleFiltre('biere', 'famille', v)}
              accentColor='#854F0B'
              bgColor='#FDF3E3'
            />
            <FiltreGroupe label="INTENSITÉ"
              options={[
                { val: 'légère', label: 'Légère (- de 5°)' },
                { val: 'moyenne', label: 'Moyenne (5-7°)' },
                { val: 'forte', label: 'Forte (+ de 7°)' },
              ]}
              selected={getFiltre('biere', 'intensite')}
              onToggle={(v) => toggleFiltre('biere', 'intensite', v)}
              accentColor='#854F0B'
              bgColor='#FDF3E3'
            />
          </>
        )}

        {/* ─── PÉTILLANTS */}
        {ongletActif === 'petillant' && parametres.types.includes('petillant') && (
          <>
            <FiltreGroupe label="FAMILLE"
              options={[
                { val: 'champagne', label: 'Champagne' },
                { val: 'crémant', label: 'Crémant' },
                { val: 'prosecco', label: 'Prosecco' },
                { val: 'cava', label: 'Cava' },
                { val: 'pétillant naturel', label: 'Pét-nat' },
                { val: 'eau pétillante premium', label: 'Eau gazeuse premium' },
              ]}
              selected={getFiltre('petillant', 'famille')}
              onToggle={(v) => toggleFiltre('petillant', 'famille', v)}
              accentColor='#5A6E99'
              bgColor='#EEF1FA'
            />
            <FiltreGroupe label="DOSAGE"
              options={[
                { val: 'brut nature', label: 'Brut nature' },
                { val: 'extra brut', label: 'Extra brut' },
                { val: 'brut', label: 'Brut' },
                { val: 'demi-sec', label: 'Demi-sec' },
              ]}
              selected={getFiltre('petillant', 'dosage')}
              onToggle={(v) => toggleFiltre('petillant', 'dosage', v)}
              accentColor='#5A6E99'
              bgColor='#EEF1FA'
            />
          </>
        )}

        {/* ─── SPIRITUEUX */}
        {ongletActif === 'spiritueux' && parametres.types.includes('spiritueux') && (
          <>
            <FiltreGroupe label="FAMILLE"
              options={[
                { val: 'whisky', label: 'Whisky / Bourbon' },
                { val: 'cognac', label: 'Cognac / Armagnac' },
                { val: 'rhum', label: 'Rhum' },
                { val: 'gin', label: 'Gin' },
                { val: 'vodka', label: 'Vodka' },
                { val: 'calvados', label: 'Calvados' },
                { val: 'mezcal', label: 'Mezcal / Tequila' },
                { val: 'liqueur', label: 'Liqueur' },
              ]}
              selected={getFiltre('spiritueux', 'famille')}
              onToggle={(v) => toggleFiltre('spiritueux', 'famille', v)}
              accentColor='#7A4F1E'
              bgColor='#F7EFE4'
            />
            <FiltreGroupe label="SERVICE"
              options={[
                { val: 'sec', label: 'Sec / Neat' },
                { val: 'cocktail', label: 'En cocktail' },
                { val: 'digestif', label: 'Digestif' },
                { val: 'apéritif', label: 'Apéritif' },
              ]}
              selected={getFiltre('spiritueux', 'service')}
              onToggle={(v) => toggleFiltre('spiritueux', 'service', v)}
              accentColor='#7A4F1E'
              bgColor='#F7EFE4'
            />
          </>
        )}

        {/* ─── SANS ALCOOL */}
        {ongletActif === 'sans_alcool' && parametres.types.includes('sans_alcool') && (
          <>
            <FiltreGroupe label="FAMILLE"
              options={[
                { val: 'kombucha', label: 'Kombucha' },
                { val: 'jus frais', label: 'Jus frais' },
                { val: 'eau aromatisée', label: 'Eau aromatisée' },
                { val: 'thé glacé', label: 'Thé glacé' },
                { val: 'kéfir', label: 'Kéfir' },
                { val: 'limonade artisanale', label: 'Limonade artisanale' },
                { val: 'shrub', label: 'Shrub / Vinaigre de fruit' },
                { val: 'mocktail', label: 'Mocktail' },
              ]}
              selected={getFiltre('sans_alcool', 'famille')}
              onToggle={(v) => toggleFiltre('sans_alcool', 'famille', v)}
              accentColor={ISP.sage}
              bgColor={ISP.sagePale}
            />
            <FiltreGroupe label="INTENSITÉ"
              options={[
                { val: 'léger et désaltérant', label: 'Léger & désaltérant' },
                { val: 'fruité et vif', label: 'Fruité & vif' },
                { val: 'complexe et fermenté', label: 'Complexe & fermenté' },
                { val: 'doux et rond', label: 'Doux & rond' },
              ]}
              selected={getFiltre('sans_alcool', 'intensite')}
              onToggle={(v) => toggleFiltre('sans_alcool', 'intensite', v)}
              accentColor={ISP.sage}
              bgColor={ISP.sagePale}
            />
          </>
        )}

      </div>
    </div>
  )}

  {/* Budget — commun à tous les types */}
  <div style={{ borderTop: `1px dashed ${ISP.rule}`, paddingTop: 12 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: ISP.muted, marginBottom: 6 }}>BUDGET BOUTEILLE</div>
    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
      {['- de 20€', '20-50€', '50-100€', '+ de 100€', 'Les trois niveaux'].map(b => (
        <button key={b} onClick={() => setParametres(prev => ({ ...prev, budget: b }))}
          style={{
            padding: '5px 12px', borderRadius: 999,
            border: `1px solid ${parametres.budget === b ? ISP.sage : ISP.rule}`,
            background: parametres.budget === b ? ISP.sagePale : ISP.card,
            color: parametres.budget === b ? ISP.sage : ISP.muted,
            fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>
          {b}
        </button>
      ))}
    </div>
  </div>

  {/* Cave priorité */}
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <button onClick={() => setParametres(prev => ({ ...prev, cave_priorite: !prev.cave_priorite }))}
      style={{ width: 36, height: 20, borderRadius: 999, background: parametres.cave_priorite ? ISP.burgundy : ISP.rule, border: 'none', cursor: 'pointer', position: 'relative' as const, flexShrink: 0, transition: 'background .2s' }}>
      <span style={{ position: 'absolute' as const, top: 2, left: parametres.cave_priorite ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left .2s' }} />
    </button>
    <span style={{ fontSize: 12, color: ISP.muted, fontWeight: 700 }}>Priorité aux références de ma cave</span>
  </div>
</div>
      {/* Bouton générer */}
      {plats.length > 0 && (
        <div>
        <button onClick={() => genererAccords()} disabled={loading || platsRemplis === 0} style={{ width: '100%', background: (loading || platsRemplis === 0) ? ISP.muted : ISP.burgundy, color: ISP.card, border: 'none', borderRadius: 14, padding: '18px 24px', fontFamily: 'inherit', fontWeight: 800, fontSize: 16, cursor: (loading || platsRemplis === 0) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, boxShadow: '0 10px 28px -12px rgba(94,17,25,.45)', transition: 'all .2s', letterSpacing: '-0.005em' }}>
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

       {alertes.length > 0 && <AlertesStock alertes={alertes} />}

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
    <AccordCard key={label} label={label} data={data} color={color} stock={stock} />
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
          <Tooltip text="Vue salle en temps réel — consultez les accords pendant le service" position="bottom">
            <NavBtn label="📱 Service" onClick={() => router.push('/service')} />
          </Tooltip>
          <Tooltip text="Gérez votre cave et importez votre stock de vins et boissons" position="bottom">
            <NavBtn label="Cave" badge={stock.length || undefined} onClick={() => router.push('/stock')} />
          </Tooltip>
          <Tooltip text="Visitez l'historique de toutes vos générations précédentes" position="bottom">
            <NavBtn label="Historique" onClick={() => router.push('/historique')} />
          </Tooltip>
          <Tooltip text="Personnalisez le ton et le style de vos accords générés" position="bottom">
            <NavBtn label="Paramètres" onClick={() => router.push('/parametres')} />
          </Tooltip>
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
              <span style={{ color: ISP.terracotta, fontStyle: 'italic' }}>accordez-la </span> d&apos;un geste.
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
