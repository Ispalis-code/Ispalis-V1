'use client'
import { useState, useEffect, useRef } from 'react'
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

const couleurDuVin = (c: string) => {
  switch (c) {
    case 'rouge': return ISP.burgundy
    case 'blanc': return '#D4B85A'
    case 'rose': return '#E8A0A0'
    case 'effervescent': return '#E8DFAE'
    default: return ISP.muted
  }
}

const labelDuVin = (c: string) => {
  switch (c) {
    case 'rouge': return 'Rouge'
    case 'blanc': return 'Blanc'
    case 'rose': return 'Rose'
    case 'effervescent': return 'Effervescent'
    default: return 'Autre'
  }
}

const getCategories = (ref: any): string[] => {
  const cats: string[] = []
  const type = ref.type_boisson || 'vin'
  if (type === 'sans_alcool') cats.push('sans_alcool')
  if (type === 'spiritueux') cats.push('alcool_fort')
  if (type === 'biere') cats.push('biere')
  if (type === 'champagne') cats.push('apero')
  if (type === 'aperitif') cats.push('apero')
  const full = `${(ref.nom_reference || '').toLowerCase()} ${(ref.appellation || '').toLowerCase()}`
  if (cats.length === 0) {
    if (['whisky','cognac','rhum','gin','vodka','tequila','pastis','liqueur'].some(k => full.includes(k))) cats.push('alcool_fort')
    if (['biere','lager','stout','ipa'].some(k => full.includes(k))) cats.push('biere')
    if (['champagne','cremant','prosecco'].some(k => full.includes(k))) cats.push('apero')
    if (['eau','jus','sirop','kombucha','mocktail'].some(k => full.includes(k))) cats.push('sans_alcool')
  }
  return cats
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

const PlusIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const TrashIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  border: `1.5px solid ${ISP.rule}`, borderRadius: 10,
  fontFamily: 'inherit', fontSize: 13.5, color: ISP.ink,
  backgroundColor: ISP.card, outline: 'none',
  fontWeight: 500, transition: 'border-color .15s',
  boxSizing: 'border-box',
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: ISP.muted, marginBottom: 6 }}>
        {label}{required && <span style={{ color: ISP.terracotta }}> *</span>}
      </div>
      {children}
    </label>
  )
}

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

function StatCard({ label, value, accent, big, dot }: { label: string; value: number; accent: string; big?: boolean; dot?: boolean }) {
  return (
    <div style={{ background: ISP.card, borderRadius: 14, padding: '16px 18px', borderTop: `4px solid ${accent}`, boxShadow: '0 1px 0 rgba(60,40,20,.04), 0 6px 18px -12px rgba(60,40,20,.15)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10.5, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: ISP.muted }}>
        {dot && <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent }} />}
        {label}
      </div>
      <div style={{ fontSize: big ? 36 : 30, fontWeight: 800, letterSpacing: '-0.03em', color: ISP.ink, marginTop: 4, lineHeight: 1 }}>{value}</div>
    </div>
  )
}

function FilterChip({ label, count, active, color, onClick }: { label: string; count: number; active?: boolean; color?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 999, background: active ? ISP.ink : ISP.paperWarm, color: active ? ISP.card : ISP.ink, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, transition: 'all .15s' }}>
      {color && <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />}
      {label}
      <span style={{ fontSize: 10.5, fontWeight: 800, opacity: active ? 0.7 : 0.5 }}>{count}</span>
    </button>
  )
}

function RefRow({ refData, onDelete }: { refData: any; onDelete: () => void }) {
  const c = couleurDuVin(refData.couleur)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: ISP.paperWarm, border: `1px solid ${ISP.rule}` }}>
      <div style={{ flexShrink: 0 }}><BottleI color={c} size={28} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' as const }}>
          <div style={{ fontSize: 14.5, fontWeight: 800, color: ISP.ink, letterSpacing: '-0.005em', lineHeight: 1.25 }}>{refData.nom_reference}</div>
          {refData.millesime && <span style={{ fontSize: 11.5, fontWeight: 800, color: ISP.muted }}>· {refData.millesime}</span>}
        </div>
        <div style={{ fontSize: 12, color: ISP.muted, marginTop: 2, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
          {refData.appellation && <span>{refData.appellation}</span>}
          {refData.appellation && <span style={{ opacity: 0.4 }}>·</span>}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 700, color: c }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: c }} />
            {labelDuVin(refData.couleur)}
          </span>
        </div>
      </div>
      <div style={{ flexShrink: 0, background: ISP.card, borderRadius: 8, padding: '6px 11px', textAlign: 'center' as const, minWidth: 56, border: `1px solid ${ISP.rule}` }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: ISP.burgundy, letterSpacing: '-0.02em', lineHeight: 1 }}>{refData.quantite}</div>
        <div style={{ fontSize: 9, fontWeight: 700, color: ISP.muted, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginTop: 2 }}>bouteilles</div>
      </div>
      <button onClick={onDelete} style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 8, border: 'none', background: 'transparent', color: ISP.muted, cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'all .15s' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${ISP.burgundy}15`; (e.currentTarget as HTMLButtonElement).style.color = ISP.burgundy }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = ISP.muted }}>
        <TrashIcon size={15} />
      </button>
    </div>
  )
}

export default function Stock() {
  const [references, setReferences] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const [importOK, setImportOK] = useState(false)
  const [filter, setFilter] = useState<string[]>(['all'])
  const [search, setSearch] = useState('')
  const [nom, setNom] = useState('')
  const [appellation, setAppellation] = useState('')
  const [couleur, setCouleur] = useState('rouge')
  const [type, setType] = useState('vin')
  const [quantite, setQuantite] = useState('')
  const [millesime, setMillesime] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const router = useRouter()

  const toggleFilter = (f: string) => {
    if (f === 'all') { setFilter(['all']); return }
    setFilter(prev => {
      const without = prev.filter(x => x !== 'all')
      if (without.includes(f)) {
        const next = without.filter(x => x !== f)
        return next.length === 0 ? ['all'] : next
      }
      return [...without, f]
    })
  }

  useEffect(() => { chargerStock() }, [])

  const chargerStock = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/connexion'); return }
    const { data } = await supabase.from('stocks').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (data) setReferences(data)
  }

  const ajouterReference = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('stocks').insert({
      user_id: user.id, nom_reference: nom, appellation, couleur,
      type_boisson: type,
      quantite: parseInt(quantite),
      millesime: millesime ? parseInt(millesime) : null,
      derniere_vente: new Date().toISOString().split('T')[0]
    })
    setNom(''); setAppellation(''); setQuantite(''); setMillesime('')
    await chargerStock()
    setLoading(false)
  }

  const supprimerReference = async (id: string) => {
    await supabase.from('stocks').delete().eq('id', id)
    await chargerStock()
  }

  const viderStock = async () => {
    if (!confirm('Supprimer toutes les references de votre cave ?')) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('stocks').delete().eq('user_id', user.id)
    await chargerStock()
  }

  const importerCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      setImporting(true)
      setImportMsg('')
      setImportOK(false)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      try {
        const XLSX = await import('xlsx')        
          const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })
        console.log('Premieres lignes:', JSON.stringify(rows.slice(0, 2)))
        console.log('Headers detectes:', Object.keys(rows[0] || {}).join(' | '))
        console.log('isSommit:', isSommit)
        if (rows.length === 0) { setImportMsg('Fichier vide'); setImporting(false); return }
        const headers = Object.keys(rows[0]).map(k => k.toLowerCase())
        const isSommit = headers.some(h => h.includes('domaine')) && headers.some(h => h.includes('stock'))
        let imported = 0
        let errors = 0
        for (const row of rows) {
          const get = (names: string[]) => {
            for (const n of names) {
              const key = Object.keys(row).find(k => k.toLowerCase().includes(n))
              if (key && row[key] !== '') return String(row[key]).trim()
            }
            return ''
          }
          let nomRef = ''
          let app = ''
          let coul = 'rouge'
          let mill = null as number | null
          let qty = 1
          let type_boisson = 'vin'
          if (isSommit) {
            const domaine = get(['domaine'])
            const appellation2 = get(['appellation'])
            const cuvee = get(['cuvee', 'libelle'])
            nomRef = [domaine, appellation2, cuvee].filter(Boolean).join(' - ')
            app = appellation2
            const couleurRaw = get(['couleur']).toLowerCase()
            if (couleurRaw.includes('blanc')) coul = 'blanc'
            else if (couleurRaw.includes('ros')) coul = 'rose'
            else if (couleurRaw.includes('effervescent') || couleurRaw.includes('bulles') || couleurRaw.includes('champagne')) coul = 'effervescent'
            else coul = 'rouge'
            const millRaw = parseInt(get(['millesime', 'vintage', 'annee']))
            mill = isNaN(millRaw) ? null : millRaw
            const contenant = get(['contenant']).toLowerCase()
            if (contenant && !contenant.includes('bouteille')) continue
            const qtyRaw = parseFloat(get(['stock total', 'stock', 'quantite', 'qty']))
            qty = isNaN(qtyRaw) || qtyRaw <= 0 ? 0 : Math.round(qtyRaw)
            if (qty <= 0) continue
          } else {
            nomRef = get(['nom_reference', 'nom', 'name', 'vin', 'libelle', 'domaine'])
            app = get(['appellation', 'aoc', 'region'])
            const couleurRaw = get(['couleur', 'color', 'type']).toLowerCase()
            if (couleurRaw.includes('blanc')) coul = 'blanc'
            else if (couleurRaw.includes('ros')) coul = 'rose'
            else if (couleurRaw.includes('bulles') || couleurRaw.includes('effervescent') || couleurRaw.includes('champagne')) coul = 'effervescent'
            else coul = 'rouge'
            const millRaw = parseInt(get(['millesime', 'vintage', 'annee']))
            mill = isNaN(millRaw) ? null : millRaw
            const qtyRaw = parseInt(get(['quantite', 'quantity', 'qty', 'stock']))
            qty = isNaN(qtyRaw) ? 1 : qtyRaw
            type_boisson = get(['type_boisson', 'type', 'categorie']) || 'vin'
          }
          if (!nomRef) { errors++; continue }
          const { error } = await supabase.from('stocks').insert({
            user_id: user.id, nom_reference: nomRef, appellation: app,
            couleur: coul, millesime: mill, quantite: qty,
            type_boisson, derniere_vente: new Date().toISOString().split('T')[0]
          })
          if (error) { errors++ } else { imported++ }
        }
        setImportMsg(`${imported} references importees${errors > 0 ? ` (${errors} ignorees)` : ''}`)
        setImportOK(imported > 0)
        await chargerStock()
      } catch (err) {
        console.error(err)
        setImportMsg('Erreur lors de la lecture du fichier Excel')
        setImportOK(false)
      }
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ''
      return
    }

    setImporting(true)
    setImportMsg('')
    setImportOK(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const text = await file.text()
    const lines = text.split('\n').filter(l => l.trim())
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim())
    let imported = 0
    let errors = 0
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      if (values.length < 2) continue
      const row: any = {}
      headers.forEach((h, idx) => { row[h] = values[idx] || '' })
      const nomRef = row['nom_reference'] || row['nom'] || row['name'] || values[0]
      const qty = parseInt(row['quantite'] || row['quantity'] || row['qty'] || values[4] || '1')
      if (!nomRef) { errors++; continue }
      const { error } = await supabase.from('stocks').insert({
        user_id: user.id, nom_reference: nomRef,
        appellation: row['appellation'] || values[1] || '',
        couleur: row['couleur'] || row['color'] || values[2] || 'rouge',
        millesime: parseInt(row['millesime'] || row['vintage'] || values[3]) || null,
        quantite: isNaN(qty) ? 1 : qty,
        derniere_vente: new Date().toISOString().split('T')[0]
      })
      if (error) { errors++ } else { imported++ }
    }
    setImportMsg(`${imported} references importees${errors > 0 ? ` (${errors} erreurs ignorees)` : ''}`)
    setImportOK(imported > 0)
    await chargerStock()
    setImporting(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const stats = references.reduce((acc, r) => {
    acc[r.couleur] = (acc[r.couleur] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalBottles = references.reduce((sum, r) => sum + (r.quantite || 0), 0)

  const filtered = references.filter(r => {
    if (!filter.includes('all')) {
      const cats = getCategories(r)
      const couleurMatch = filter.some(f => ['rouge', 'blanc', 'rose', 'effervescent'].includes(f) && r.couleur === f)
      const catMatch = filter.some(f => cats.includes(f))
      if (!couleurMatch && !catMatch) return false
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      return (r.nom_reference || '').toLowerCase().includes(q) || (r.appellation || '').toLowerCase().includes(q)
    }
    return true
  })

  return (
    <main style={{ background: ISP.paper, minHeight: '100vh', color: ISP.ink }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 44px', borderBottom: `1px solid ${ISP.rule}`, background: ISP.paper, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>
          <IspalisLogo size={24} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <NavBtn label="Accords" onClick={() => router.push('/dashboard')} />
          <NavBtn label="Carte" onClick={() => router.push('/carte')} />
          <NavBtn label="Cave" badge={references.length || undefined} active />
          <NavBtn label="Parametres" onClick={() => router.push('/parametres')} />
        </div>
      </nav>

      <header style={{ padding: '32px 44px 8px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' as const, fontWeight: 800, color: ISP.terracotta }}>
          <span style={{ width: 24, height: 1.5, background: ISP.terracotta }} />
          <span>Votre cave</span>
          <span style={{ flex: 1, height: 1.5, background: `${ISP.terracotta}33` }} />
        </div>
        <h1 style={{ margin: '14px 0 0', fontSize: 46, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.02, maxWidth: '22ch' }}>
          Vos references,{' '}
          <span style={{ color: ISP.terracotta, fontStyle: 'italic' }}>au coeur</span> des accords.
        </h1>
        <p style={{ marginTop: 12, fontSize: 15, color: ISP.muted, maxWidth: 600, lineHeight: 1.55 }}>
          Ispalis pioche en priorite dans votre cave avant de proposer d&apos;autres references. Tenez-la a jour pour des accords plus pertinents.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14, padding: '20px 44px 0', maxWidth: 1280, margin: '0 auto' }}>
        <StatCard label="References" value={references.length} accent={ISP.burgundy} big />
        <StatCard label="Bouteilles" value={totalBottles} accent={ISP.terracotta} />
        <StatCard label="Rouges" value={stats.rouge || 0} accent={ISP.burgundy} dot />
        <StatCard label="Blancs · Roses · Eff." value={(stats.blanc || 0) + (stats.rose || 0) + (stats.effervescent || 0)} accent="#D4B85A" dot />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.85fr) minmax(0, 1.15fr)', gap: 24, padding: '24px 44px 32px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section style={{ background: ISP.card, borderRadius: 18, padding: '26px 28px', boxShadow: '0 1px 0 rgba(60,40,20,.04), 0 12px 32px -16px rgba(60,40,20,.18)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ paddingBottom: 12, borderBottom: `2px solid ${ISP.ink}` }}>
              <div style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: ISP.terracotta, fontWeight: 800 }}>Methode 1</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0 0', letterSpacing: '-0.01em' }}>Ajouter une reference</h2>
            </div>
            <form onSubmit={ajouterReference} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Field label="Nom de la reference" required>
                <input type="text" value={nom} onChange={e => setNom(e.target.value)} required placeholder="ex: Chateau Margaux" style={inputStyle} />
              </Field>
              <Field label="Appellation">
                <input type="text" value={appellation} onChange={e => setAppellation(e.target.value)} placeholder="ex: Margaux AOC" style={inputStyle} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Type de boisson" required>
                  <select value={type} onChange={e => setType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="vin">Vin</option>
                    <option value="champagne">Champagne / Effervescent</option>
                    <option value="biere">Biere</option>
                    <option value="spiritueux">Spiritueux / Alcool fort</option>
                    <option value="aperitif">Aperitif / Digestif</option>
                    <option value="sans_alcool">Sans alcool</option>
                    <option value="autre">Autre</option>
                  </select>
                </Field>
                <Field label="Couleur" required>
                  <select value={couleur} onChange={e => setCouleur(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="rouge">Rouge</option>
                    <option value="blanc">Blanc</option>
                    <option value="rose">Rose</option>
                    <option value="effervescent">Effervescent</option>
                    <option value="autre">Autre</option>
                  </select>
                </Field>
              </div>
              <Field label="Millesime">
                <input type="number" value={millesime} onChange={e => setMillesime(e.target.value)} placeholder="ex: 2021" style={inputStyle} />
              </Field>
              <Field label="Quantite (bouteilles)" required>
                <input type="number" value={quantite} onChange={e => setQuantite(e.target.value)} required min="1" placeholder="ex: 12" style={inputStyle} />
              </Field>
              <button type="submit" disabled={loading} style={{ marginTop: 4, background: loading ? ISP.muted : ISP.burgundy, color: ISP.card, border: 'none', borderRadius: 12, padding: '14px 20px', fontFamily: 'inherit', fontWeight: 800, fontSize: 14.5, cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 8px 20px -10px rgba(94,17,25,.4)', letterSpacing: '-0.005em' }}>
                <PlusIcon size={14} />
                {loading ? 'Ajout...' : 'Ajouter au stock'}
              </button>
            </form>
          </section>

          <section style={{ background: ISP.card, borderRadius: 18, padding: '24px 28px', border: `1.5px solid ${ISP.rule}` }}>
            <div style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: ISP.terracotta, fontWeight: 800 }}>Methode 2</div>
            <h3 style={{ fontSize: 17, fontWeight: 800, margin: '4px 0 8px', letterSpacing: '-0.01em' }}>Importer un fichier</h3>
            <p style={{ fontSize: 12.5, color: ISP.muted, margin: '0 0 12px', lineHeight: 1.55 }}>
              Formats acceptes : CSV, Excel (.xlsx) — Sommit detecte automatiquement
            </p>
            <label style={{ display: 'block', padding: '14px 16px', borderRadius: 10, border: `2px dashed ${importing ? ISP.terracotta : ISP.rule}`, background: importing ? `${ISP.terracotta}10` : ISP.paperWarm, cursor: importing ? 'wait' : 'pointer', textAlign: 'center' as const, transition: 'all .2s' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: ISP.ink }}>{importing ? 'Import en cours...' : 'Cliquez pour choisir un fichier .csv ou .xlsx'}</div>
              <input ref={fileRef} type="file" accept=".csv,.txt,.xlsx,.xls" onChange={importerCSV} disabled={importing} style={{ display: 'none' }} />
            </label>
            {importMsg && (
              <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: importOK ? ISP.sagePale : '#FBE9EB', color: importOK ? ISP.sage : ISP.burgundy, fontSize: 12.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', background: importOK ? ISP.sage : ISP.burgundy, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, flexShrink: 0 }}>{importOK ? '✓' : '!'}</span>
                {importMsg}
              </div>
            )}
          </section>
        </div>

        <section style={{ background: ISP.card, borderRadius: 18, padding: '24px 28px', boxShadow: '0 1px 0 rgba(60,40,20,.04), 0 12px 32px -16px rgba(60,40,20,.18)', display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' as const, paddingBottom: 12, borderBottom: `2px solid ${ISP.ink}` }}>
            <div>
              <div style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: ISP.terracotta, fontWeight: 800 }}>{references.length} reference{references.length > 1 ? 's' : ''}</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0 0', letterSpacing: '-0.01em' }}>Votre cave</h2>
            </div>
            {references.length > 0 && (
              <button onClick={viderStock} style={{ fontSize: 11.5, fontWeight: 700, color: ISP.muted, background: 'transparent', border: `1px solid ${ISP.rule}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <TrashIcon size={12} />
                Tout supprimer
              </button>
            )}
          </div>

          {references.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher dans votre cave..." style={{ ...inputStyle, background: ISP.paperWarm }} />
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                <FilterChip label="Toutes" active={filter.includes('all')} onClick={() => toggleFilter('all')} count={references.length} />
                <FilterChip label="Rouges" active={filter.includes('rouge')} onClick={() => toggleFilter('rouge')} count={stats.rouge || 0} color={ISP.burgundy} />
                <FilterChip label="Blancs" active={filter.includes('blanc')} onClick={() => toggleFilter('blanc')} count={stats.blanc || 0} color="#D4B85A" />
                <FilterChip label="Roses" active={filter.includes('rose')} onClick={() => toggleFilter('rose')} count={stats.rose || 0} color="#E8A0A0" />
                {(stats.effervescent || 0) > 0 && (
                  <FilterChip label="Eff." active={filter.includes('effervescent')} onClick={() => toggleFilter('effervescent')} count={stats.effervescent || 0} color="#C5B780" />
                )}
                <FilterChip label="Sans alcool" active={filter.includes('sans_alcool')} onClick={() => toggleFilter('sans_alcool')} count={references.filter(r => getCategories(r).includes('sans_alcool')).length} color={ISP.sage} />
                <FilterChip label="Alcools forts" active={filter.includes('alcool_fort')} onClick={() => toggleFilter('alcool_fort')} count={references.filter(r => getCategories(r).includes('alcool_fort')).length} color={ISP.terracotta} />
                <FilterChip label="Bieres" active={filter.includes('biere')} onClick={() => toggleFilter('biere')} count={references.filter(r => getCategories(r).includes('biere')).length} color="#D4B85A" />
                <FilterChip label="Apero" active={filter.includes('apero')} onClick={() => toggleFilter('apero')} count={references.filter(r => getCategories(r).includes('apero')).length} color={ISP.ochre} />
              </div>
            </div>
          )}

          {references.length === 0 ? (
            <div style={{ padding: '40px 20px', borderRadius: 14, background: ISP.paperWarm, textAlign: 'center' as const }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14, opacity: 0.4 }}><BottleI color={ISP.muted} size={42} /></div>
              <div style={{ fontSize: 15, fontWeight: 800, color: ISP.ink, marginBottom: 6 }}>Votre cave est vide</div>
              <div style={{ fontSize: 13, color: ISP.muted, lineHeight: 1.55, maxWidth: 320, margin: '0 auto' }}>Ajoutez votre premiere reference a gauche, ou importez votre stock.</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '24px 20px', borderRadius: 12, background: ISP.paperWarm, textAlign: 'center' as const, color: ISP.muted, fontSize: 13.5 }}>Aucune reference ne correspond.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 560, overflowY: 'auto', paddingRight: 4, margin: '0 -4px' }}>
              {filtered.map((ref: any) => (
                <RefRow key={ref.id} refData={ref} onDelete={() => supprimerReference(ref.id)} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
