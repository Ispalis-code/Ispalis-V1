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
  const [accords, setAccords] = useState<any[]>([])
  const [alertes, setAlertes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateMenu, setDateMenu] = useState('')
  const [accordOuvert, setAccordOuvert] = useState<number | null>(null)
  const [recherche, setRecherche] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { chargerAccords() }, [])

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
      </div>

      <div style={{ padding: '16px 16px 80px' }}>

        {/* Date */}
        <div style={{ fontSize: 12, color: ISP.muted, textTransform: 'capitalize', marginBottom: 16, fontWeight: 600 }}>
          {today}
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

    </main>
  )
}
