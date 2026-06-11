'use client'
import { useState, useEffect } from 'react'
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

function AlertesStock({ alertes }: { alertes: any[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: '#FFF7E0', border: `1.5px solid #EEA300`, borderRadius: 12, marginBottom: 16, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'inherit' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 800, color: '#7A5210', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#EEA300', color: '#5E1119', display: 'grid', placeItems: 'center', fontSize: 12 }}>!</span>
          {alertes.length} alerte{alertes.length > 1 ? 's' : ''} stock
        </div>
        <span style={{ fontSize: 16, color: '#7A5210', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: '0 16px 14px', borderTop: '1px solid #EEA30040' }}>
          {alertes.map((a: any, i: number) => (
            <div key={i} style={{ marginTop: 10, color: ISP.ink, fontSize: 13 }}>
              <strong>{a.reference}</strong> — {a.message}
              <div style={{ color: ISP.muted, fontSize: 12, marginTop: 2 }}>→ {a.action}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Service() {
  const [modalOpen, setModalOpen] = useState(false)
const [platModal, setPlatModal] = useState('')
const [preferenceModal, setPreferenceModal] = useState('')
const [loadingModal, setLoadingModal] = useState(false)
const [resultModal, setResultModal] = useState<any>(null)
  const [accords, setAccords] = useState<any[]>([])
  const [alertes, setAlertes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateMenu, setDateMenu] = useState('')
  const [accordOuvert, setAccordOuvert] = useState<number | null>(null)
  const [modeVentes, setModeVentes] = useState(false)
  const [ventesSelectionnees, setVentesSelectionnees] = useState<Record<string, number>>({})
  const [stock, setStock] = useState<any[]>([])
  const [venteMsg, setVenteMsg] = useState('')
  const [rechercheVente, setRechercheVente] = useState('')
  const [recherche, setRecherche] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { chargerAccords() }, [])

  const genererPonctuel = async () => {
  if (!platModal.trim()) return
  setLoadingModal(true)
  setResultModal(null)
  try {
    const response = await fetch('/api/recommandations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plats: [platModal.trim()],
        stock: [],
        ton: 'professionnel',
        parametres: {
          preference_client: preferenceModal.trim(),
          mode_ponctuel: true,
        },
        type_service: 'verre',
      }),
    })
    const data = await response.json()
    if (data.success && data.data.accords?.[0]) {
      setResultModal(data.data.accords[0])
    }
  } catch { console.error('Erreur génération ponctuelle') }
  setLoadingModal(false)
}

const fermerModal = () => {
  setModalOpen(false)
  setPlatModal('')
  setPreferenceModal('')
  setResultModal(null)
}
  
  const chargerAccords = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/connexion'); return }

    const { data: recoData } = await supabase
      .from('recommandations')
      .select('*, menus(date_menu)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1).maybeSingle()

    if (recoData) {
      setAccords(recoData.accords || [])
      setAlertes(recoData.alertes_stock || [])
      setDateMenu(recoData.menus?.date_menu || '')
    }
    setLoading(false)
    const { data: stockData } = await supabase.from('stocks').select('*').eq('user_id', user.id).order('nom_reference')
if (stockData) setStock(stockData)
  }
  const validerVentes = async () => {
  const entries = Object.entries(ventesSelectionnees).filter(([_, qty]) => qty > 0)
  if (entries.length === 0) return
  for (const [id, qty] of entries) {
    const ref = stock.find(s => s.id === id)
    if (!ref) continue
    const newQty = Math.max(0, (ref.quantite || 0) - qty)
    await supabase.from('stocks').update({
      quantite: newQty,
      derniere_vente: new Date().toISOString().split('T')[0]
    }).eq('id', id)
  }
  setVenteMsg(`${entries.length} reference${entries.length > 1 ? 's' : ''} mise${entries.length > 1 ? 's' : ''} a jour`)
  setVentesSelectionnees({})
  setModeVentes(false)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { data: stockData } = await supabase.from('stocks').select('*').eq('user_id', user.id).order('nom_reference')
  if (stockData) setStock(stockData)
}

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <main style={{ background: ISP.paper, minHeight: '100vh', color: ISP.ink, maxWidth: 480, margin: '0 auto' }}>

      {/* ─── Header sticky */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: ISP.burgundy, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: ISP.ochre, fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em' }}>·ispalis·</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 1 }}>Vue service</div>
        </div>
        <button onClick={() => router.push('/carte')} style={{ background: ISP.ochre, color: ISP.burgundy, border: 'none', borderRadius: 10, padding: '8px 14px', fontFamily: 'inherit', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
          + Générer
        </button>
        <button onClick={() => setModeVentes(!modeVentes)} style={{ background: modeVentes ? ISP.ochre : 'rgba(255,255,255,0.15)', color: modeVentes ? ISP.burgundy : 'white', border: 'none', borderRadius: 10, padding: '8px 14px', fontFamily: 'inherit', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
  {modeVentes ? '✕ Annuler' : '🍾 Ventes'}
</button>
      </div>
{venteMsg && (
  <div style={{ background: ISP.sagePale, color: ISP.sage, padding: '10px 16px', fontSize: 13, fontWeight: 700, textAlign: 'center' as const }}>
    ✓ {venteMsg}
  </div>
)}
      <div style={{ padding: '16px 16px 80px' }}>

        {/* Date */}
        <div style={{ fontSize: 12, color: ISP.muted, textTransform: 'capitalize', marginBottom: 16, fontWeight: 600 }}>
          {today}
          {modeVentes && (
  <div style={{ marginTop: 16 }}>
    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: ISP.terracotta, marginBottom: 12 }}>
      Selectionner les bouteilles vendues ce soir
    </div>
    <div style={{ position: 'relative', marginBottom: 12 }}>
  <input
    type="text"
    placeholder="Rechercher une reference..."
    value={rechercheVente}
    onChange={e => setRechercheVente(e.target.value)}
    style={{ width: '100%', padding: '10px 16px 10px 36px', borderRadius: 10, border: `1px solid ${ISP.rule}`, background: ISP.card, fontFamily: 'inherit', fontSize: 14, color: ISP.ink, outline: 'none', boxSizing: 'border-box' as const }}
  />
  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: ISP.muted }}>🔍</span>
</div>
    {stock.length === 0 ? (
      <div style={{ color: ISP.muted, fontSize: 13, textAlign: 'center' as const, padding: '20px 0' }}>Cave vide</div>
    ) : (
      <>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8, maxHeight: 400, overflowY: 'auto' as const }}>
          {stock.filter((ref: any) => rechercheVente.trim() === '' || (ref.nom_reference || '').toLowerCase().includes(rechercheVente.toLowerCase()) || (ref.appellation || '').toLowerCase().includes(rechercheVente.toLowerCase())).map((ref: any) => {
            const qty = ventesSelectionnees[ref.id] || 0
            return (
              <div key={ref.id} style={{ background: qty > 0 ? '#F5E6E8' : ISP.card, borderRadius: 12, padding: '10px 14px', border: `1px solid ${qty > 0 ? ISP.burgundy : ISP.rule}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: ISP.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{ref.nom_reference}</div>
                  <div style={{ fontSize: 11, color: ISP.muted, marginTop: 2 }}>{ref.appellation} · {ref.quantite} en stock</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => setVentesSelectionnees(prev => ({ ...prev, [ref.id]: Math.max(0, (prev[ref.id] || 0) - 1) }))}
                    style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${ISP.rule}`, background: ISP.paperWarm, color: ISP.ink, fontWeight: 800, fontSize: 16, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                    −
                  </button>
                  <span style={{ fontSize: 16, fontWeight: 800, color: qty > 0 ? ISP.burgundy : ISP.muted, minWidth: 20, textAlign: 'center' as const }}>{qty}</span>
                  <button onClick={() => setVentesSelectionnees(prev => ({ ...prev, [ref.id]: Math.min(ref.quantite, (prev[ref.id] || 0) + 1) }))}
                    style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${ISP.rule}`, background: ISP.paperWarm, color: ISP.ink, fontWeight: 800, fontSize: 16, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        {Object.values(ventesSelectionnees).some(v => v > 0) && (
          <button onClick={validerVentes} style={{ width: '100%', marginTop: 14, padding: '14px', background: ISP.burgundy, color: 'white', border: 'none', borderRadius: 12, fontFamily: 'inherit', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            Valider — {Object.values(ventesSelectionnees).reduce((s, v) => s + v, 0)} bouteille{Object.values(ventesSelectionnees).reduce((s, v) => s + v, 0) > 1 ? 's' : ''} vendue{Object.values(ventesSelectionnees).reduce((s, v) => s + v, 0) > 1 ? 's' : ''}
          </button>
        )}
      </>
    )}
  </div>
)}
        </div>
<div style={{ position: 'relative', marginBottom: 16 }}>
  <input
    type="text"
    placeholder="Rechercher un plat..."
    value={recherche}
    onChange={e => setRecherche(e.target.value)}
    style={{ width: '100%', padding: '10px 16px 10px 36px', borderRadius: 10, border: `1px solid ${ISP.rule}`, background: ISP.card, fontFamily: 'inherit', fontSize: 14, color: ISP.ink, outline: 'none', boxSizing: 'border-box' as const }}
  />
  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: ISP.muted }}>🔍</span>
</div>
        {/* Alertes */}
        {alertes.length > 0 && <AlertesStock alertes={alertes} />}

        {/* États */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: ISP.muted }}>
            <BottleI color={ISP.burgundy} size={36} />
            <div style={{ marginTop: 12, fontSize: 14 }}>Chargement…</div>
          </div>
        ) : accords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: ISP.card, borderRadius: 16 }}>
            <BottleI color={ISP.muted} size={36} />
            <div style={{ marginTop: 12, fontSize: 15, fontWeight: 700, color: ISP.ink }}>Aucun accord pour ce soir</div>
            <div style={{ marginTop: 8, fontSize: 13, color: ISP.muted, marginBottom: 20 }}>Le chef n'a pas encore importé la carte du jour</div>
            <button onClick={() => router.push('/carte')} style={{ background: ISP.burgundy, color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontFamily: 'inherit', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
              Importer la carte →
            </button>
          </div>
        ) : (
        accords.filter((accord: any) => accord.plat.toLowerCase().includes(recherche.toLowerCase())).map((accord: any, i: number) => (
            <div key={i} style={{ background: ISP.card, borderRadius: 16, marginBottom: 12, overflow: 'hidden', boxShadow: '0 1px 0 rgba(60,40,20,.04), 0 4px 16px -8px rgba(60,40,20,.2)' }}>

              {/* En-tête plat — cliquable pour déplier */}
              <button
                onClick={() => setAccordOuvert(accordOuvert === i ? null : i)}
                style={{ width: '100%', padding: '16px 18px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontFamily: 'inherit', textAlign: 'left' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                  <BottleI color={ISP.burgundy} size={22} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: ISP.terracotta, fontWeight: 800 }}>Plat {i + 1}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: ISP.burgundy, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{accord.plat}</div>
                  </div>
                </div>
                <span style={{ fontSize: 18, color: ISP.muted, transform: accordOuvert === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>▾</span>
              </button>

              {/* Détail accord — déplié */}
              {accordOuvert === i && (
                <div style={{ padding: '0 18px 18px', borderTop: `1px dashed ${ISP.rule}` }}>

                  {/* 3 niveaux */}
                  {[
                    { label: 'Accessible', data: accord.accord_accessible, color: ISP.sage },
                    { label: 'Intermédiaire', data: accord.accord_intermediaire, color: ISP.terracotta },
                    { label: 'Prestige', data: accord.accord_prestige, color: ISP.burgundy },
                  ].map(({ label, data, color }) => (
                    <div key={label} style={{ marginTop: 14, paddingLeft: 12, borderLeft: `3px solid ${color}` }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: ISP.ink }}>{data?.vin}</div>
                      <div style={{ fontSize: 12, color: ISP.muted, marginTop: 2, fontWeight: 600 }}>
                        🍷 {data?.prix_verre} · 🍾 {data?.prix_bouteille}
                      </div>
                      <div style={{ fontSize: 13, fontStyle: 'italic', color: ISP.ink, marginTop: 6, lineHeight: 1.5, background: ISP.paperWarm, padding: '8px 10px', borderRadius: 8 }}>
                        « {data?.argument} »
                      </div>
                    </div>
                  ))}

                  {/* Sans alcool */}
                  {accord.accord_sans_alcool && (
                    <div style={{ marginTop: 14, background: ISP.sagePale, borderRadius: 10, padding: '12px 14px', borderLeft: `3px solid ${ISP.sage}` }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: ISP.sage, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Sans alcool</div>
                      <div style={{ fontWeight: 800, color: ISP.ink, fontSize: 14 }}>{accord.accord_sans_alcool.boisson}</div>
                      <div style={{ fontSize: 13, fontStyle: 'italic', color: ISP.ink, marginTop: 4, lineHeight: 1.45 }}>« {accord.accord_sans_alcool.argument} »</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ─── Bottom nav fixe */}
      <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: ISP.card, borderTop: `1px solid ${ISP.rule}`, display: 'flex', padding: '10px 0 20px' }}>
        {[
          { label: '🍷 Service', path: '/service', active: true },
          { label: '📄 Carte', path: '/carte', active: false },
          { label: '🍾 Cave', path: '/stock', active: false },
        ].map(item => (
          <button key={item.path} onClick={() => router.push(item.path)} style={{ flex: 1, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: item.active ? 800 : 600, color: item.active ? ISP.burgundy : ISP.muted, padding: '6px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {item.label}
          </button>
        ))}
      </nav>
{/* Bouton flottant */}
<button
  onClick={() => setModalOpen(true)}
  style={{
    position: 'fixed', bottom: 28, right: 24,
    width: 56, height: 56, borderRadius: '50%',
    background: ISP.burgundy, color: ISP.card,
    border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(94,17,25,.45)',
    fontSize: 22, zIndex: 50,
    transition: 'transform .15s, box-shadow .15s',
  }}
  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)' }}
  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
>
  <span suppressHydrationWarning>✨</span>
</button>

{/* Modal */}
{modalOpen && (
  <div
    onClick={fermerModal}
    style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(26,20,16,0.6)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '0 0 0 0',
    }}>
    <div
      onClick={e => e.stopPropagation()}
      style={{
        background: ISP.card, borderRadius: '20px 20px 0 0',
        padding: '28px 24px 40px',
        width: '100%', maxWidth: 540,
        display: 'flex', flexDirection: 'column' as const, gap: 16,
        boxShadow: '0 -8px 40px rgba(60,40,20,.25)',
      }}>

      {/* Handle */}
      <div style={{ width: 36, height: 4, borderRadius: 999, background: ISP.rule, margin: '0 auto -8px' }} />

      {/* Titre */}
      <div style={{ paddingBottom: 12, borderBottom: `1.5px solid ${ISP.rule}` }}>
        <div style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: ISP.terracotta, fontWeight: 800 }}>Accord sur demande</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: ISP.ink, marginTop: 4, letterSpacing: '-0.01em' }}>Générer pour un client</div>
      </div>

      {/* Champ plat */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: ISP.muted, marginBottom: 6 }}>Plat</div>
        <input
          type="text"
          value={platModal}
          onChange={e => setPlatModal(e.target.value)}
          placeholder="ex : Magret de canard sauce cerise"
          autoFocus
          onKeyDown={e => e.key === 'Enter' && genererPonctuel()}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10,
            border: `1.5px solid ${ISP.rule}`, fontFamily: 'inherit',
            fontSize: 15, color: ISP.ink, background: ISP.paperWarm,
            outline: 'none', boxSizing: 'border-box' as const,
          }}
          onFocus={e => (e.target as HTMLInputElement).style.borderColor = ISP.burgundy}
          onBlur={e => (e.target as HTMLInputElement).style.borderColor = ISP.rule}
        />
      </div>

      {/* Champ préférence */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: ISP.muted, marginBottom: 6 }}>
          Préférence client <span style={{ fontWeight: 500, textTransform: 'none' as const, fontSize: 11, color: ISP.muted }}>(optionnel)</span>
        </div>
        <input
          type="text"
          value={preferenceModal}
          onChange={e => setPreferenceModal(e.target.value)}
          placeholder="ex : Bordeaux, blanc sec, sans alcool, pas trop tannique…"
          onKeyDown={e => e.key === 'Enter' && genererPonctuel()}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10,
            border: `1.5px solid ${ISP.rule}`, fontFamily: 'inherit',
            fontSize: 15, color: ISP.ink, background: ISP.paperWarm,
            outline: 'none', boxSizing: 'border-box' as const,
          }}
          onFocus={e => (e.target as HTMLInputElement).style.borderColor = ISP.burgundy}
          onBlur={e => (e.target as HTMLInputElement).style.borderColor = ISP.rule}
        />
      </div>

      {/* Bouton générer */}
      <button
        onClick={genererPonctuel}
        disabled={loadingModal || !platModal.trim()}
        style={{
          background: loadingModal || !platModal.trim() ? ISP.muted : ISP.burgundy,
          color: ISP.card, border: 'none', borderRadius: 12,
          padding: '15px 20px', fontFamily: 'inherit',
          fontWeight: 800, fontSize: 15, cursor: loadingModal || !platModal.trim() ? 'not-allowed' : 'pointer',
          boxShadow: platModal.trim() ? '0 8px 22px -10px rgba(94,17,25,.45)' : 'none',
          transition: 'all .2s', letterSpacing: '-0.005em',
        }}>
        {loadingModal ? 'Génération…' : '✨ Générer l\'accord'}
      </button>

      {/* Résultat */}
      {resultModal && (
        <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${ISP.rule}` }}>
          <div style={{ background: ISP.burgundy, padding: '14px 18px' }}>
            <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase' as const, fontWeight: 800, color: ISP.ochre, marginBottom: 4 }}>
              {resultModal.plat}
            </div>
          </div>
          <div style={{ background: ISP.card, padding: '16px 18px', display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
            {[
              { label: 'Accessible', data: resultModal.accord_accessible, color: ISP.sage },
              { label: 'Intermédiaire', data: resultModal.accord_intermediaire, color: ISP.terracotta },
              { label: 'Prestige', data: resultModal.accord_prestige, color: ISP.burgundy },
            ].map(({ label, data, color }) => data?.vin && (
              <div key={label} style={{ paddingBottom: 12, borderBottom: `1px dashed ${ISP.rule}` }}>
                <div style={{ fontSize: 10, fontWeight: 800, color, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
                <div style={{ fontWeight: 800, fontSize: 15, color: ISP.ink }}>{data.vin}</div>
                <div style={{ fontSize: 12, color: ISP.muted, marginTop: 2 }}>🍷 {data.prix_verre} · 🍾 {data.prix_bouteille}</div>
                <div style={{ fontSize: 13, fontStyle: 'italic', color: ISP.ink, marginTop: 6, lineHeight: 1.4 }}>« {data.argument} »</div>
              </div>
            ))}
            {resultModal.accord_sans_alcool && (
              <div style={{ background: ISP.sagePale, borderRadius: 10, padding: '12px 14px', borderLeft: `3px solid ${ISP.sage}` }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: ISP.sage, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 4 }}>Sans alcool</div>
                <div style={{ fontWeight: 800, fontSize: 14, color: ISP.ink }}>{resultModal.accord_sans_alcool.boisson}</div>
                <div style={{ fontSize: 12, fontStyle: 'italic', color: ISP.muted, marginTop: 4 }}>« {resultModal.accord_sans_alcool.argument} »</div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  </div>
)}
    </main>
  )
}
