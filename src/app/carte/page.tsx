'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Carte() {
  const [plats, setPlats] = useState<string[]>([])
  const [stock, setStock] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [importingPDF, setImportingPDF] = useState(false)
  const [importMsg, setImportMsg] = useState('')
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
    const formData = new FormData()
    formData.append('pdf', file)
    try {
      const res = await fetch('/api/extraire-menu', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success && data.plats) {
        setPlats(data.plats)
        setImportMsg(`✓ ${data.plats.length} plats extraits`)
      } else { setImportMsg('Erreur extraction') }
    } catch { setImportMsg('Erreur réseau') }
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
    } catch { console.error('Erreur') }
    setLoading(false)
  }

  const sauvegarder = async (platsData: string[], recoData: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('menus').delete().eq('user_id', user.id).eq('date_menu', new Date().toISOString().split('T')[0])
    const { data: menu } = await supabase.from('menus').insert({ user_id: user.id, plats: platsData, date_menu: new Date().toISOString().split('T')[0] }).select().single()
    if (menu) {
      await supabase.from('recommandations').insert({ user_id: user.id, menu_id: menu.id, accords: recoData.accords || [], alertes_stock: recoData.alertes_stock || [], a_valoriser: recoData.a_valoriser || [] })
      setSavedMsg('✓ Accords sauvegardés')
    }
  }

  const ajouterPlat = () => setPlats([...plats, ''])
  const updatePlat = (i: number, v: string) => { const p = [...plats]; p[i] = v; setPlats(p) }
  const supprimerPlat = (i: number) => setPlats(plats.filter((_, idx) => idx !== i))

  return (
    <main style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '2px solid #5E1119' }}>
        <h1 style={{ color: '#5E1119', margin: 0, fontSize: 20 }}>·ispalis· — Carte</h1>
        <button onClick={() => router.push('/dashboard')} style={{ padding: '8px 16px', background: '#5E1119', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          ← Dashboard
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', height: 'calc(100vh - 60px)' }}>

        {/* COLONNE GAUCHE — Formulaire */}
        <div style={{ borderRight: '1px solid #eee', padding: 20, overflowY: 'auto', background: '#fafafa' }}>

          <div style={{ background: '#E6F1FB', borderRadius: 8, padding: 14, marginBottom: 16, borderLeft: '4px solid #185FA5' }}>
            <div style={{ fontWeight: 600, color: '#185FA5', marginBottom: 6, fontSize: 13 }}>📄 Importer votre carte PDF</div>
            <input type="file" accept=".pdf" onChange={importerPDF} disabled={importingPDF} style={{ fontSize: 12, color: '#1a1a1a', width: '100%' }} />
            {importingPDF && <div style={{ color: '#185FA5', fontSize: 12, marginTop: 6 }}>⏳ Extraction en cours...</div>}
            {importMsg && <div style={{ color: '#2E7D32', fontSize: 12, marginTop: 6, fontWeight: 600 }}>{importMsg}</div>}
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600, color: '#854F0B', marginBottom: 8, fontSize: 13 }}>✏️ Vos plats ({plats.length})</div>
            {plats.map((plat, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <input type="text" value={plat} onChange={e => updatePlat(i, e.target.value)} placeholder={`Plat ${i + 1}`}
                  style={{ flex: 1, padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, color: '#1a1a1a', backgroundColor: 'white' }} />
                <button onClick={() => supprimerPlat(i)} style={{ padding: '6px 8px', background: 'transparent', border: '1px solid #ddd', borderRadius: 4, color: '#999', cursor: 'pointer' }}>×</button>
              </div>
            ))}
            <button onClick={ajouterPlat} style={{ width: '100%', padding: 8, background: 'transparent', border: '1px dashed #EEA300', borderRadius: 4, color: '#854F0B', cursor: 'pointer', fontSize: 12, marginTop: 4 }}>
              + Ajouter un plat
            </button>
          </div>

          <button onClick={genererAccords} disabled={loading || plats.filter(p => p.trim()).length === 0}
            style={{ width: '100%', padding: 12, background: loading ? '#999' : '#5E1119', color: 'white', border: 'none', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600 }}>
            {loading ? '⏳ Génération en cours...' : '✨ Générer les accords'}
          </button>
          {savedMsg && <div style={{ color: '#2E7D32', fontSize: 12, marginTop: 8, textAlign: 'center', fontWeight: 600 }}>{savedMsg}</div>}
          {stock.length > 0 && (
            <div style={{ marginTop: 12, padding: 10, background: '#F5E6E8', borderRadius: 6, fontSize: 12, color: '#5E1119' }}>
              🍷 <strong>{stock.length} références</strong> en cave utilisées
            </div>
          )}
        </div>

        {/* COLONNE DROITE — Accords */}
        <div style={{ padding: 20, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', color: '#666' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🍷</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#5E1119' }}>Génération des accords en cours...</div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 8 }}>Cela prend 15 à 45 secondes selon le nombre de plats</div>
            </div>
          ) : accords.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', color: '#666' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🍽️</div>
              <div style={{ fontSize: 15, color: '#888' }}>Les accords apparaîtront ici</div>
              <div style={{ fontSize: 13, color: '#aaa', marginTop: 8 }}>Importez votre carte ou saisissez vos plats, puis cliquez sur Générer</div>
            </div>
          ) : (
            <div>
              {alertes.length > 0 && (
                <div style={{ background: '#FFF3CD', border: '1px solid #EEA300', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, color: '#854F0B', marginBottom: 8 }}>⚠️ Alertes stock</div>
                  {alertes.map((a: any, i: number) => (
                    <div key={i} style={{ fontSize: 13, marginBottom: 4, color: '#1a1a1a' }}>
                      <strong>{a.reference}</strong> — {a.message} → <span style={{ color: '#666' }}>{a.action}</span>
                    </div>
                  ))}
                </div>
              )}
              {accords.map((accord: any, i: number) => (
                <div key={i} style={{ background: 'white', border: '1px solid #eee', borderRadius: 8, padding: 16, marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ color: '#5E1119', fontWeight: 600, fontSize: 16, marginBottom: 12 }}>{accord.plat}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                    {[
                      { label: 'Accessible', data: accord.accord_accessible, color: '#2E7D32' },
                      { label: 'Intermédiaire', data: accord.accord_intermediaire, color: '#1565C0' },
                      { label: 'Prestige', data: accord.accord_prestige, color: '#5E1119' },
                    ].map(({ label, data, color }) => (
                      <div key={label} style={{ background: '#f9f9f9', borderRadius: 6, padding: 10, borderTop: `3px solid ${color}` }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, color: '#1a1a1a' }}>{data?.vin}</div>
                        <div style={{ color: '#666', fontSize: 12, marginBottom: 6 }}>{data?.prix}</div>
                        <div style={{ fontSize: 12, fontStyle: 'italic', color: '#444' }}>&quot;{data?.argument}&quot;</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#F0F7F0', borderRadius: 6, padding: 10, borderLeft: '3px solid #2E7D32' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#2E7D32', textTransform: 'uppercase' }}>Sans alcool</span>
                    <div style={{ fontWeight: 600, fontSize: 13, marginTop: 3, color: '#1a1a1a' }}>{accord.accord_sans_alcool?.boisson}</div>
                    <div style={{ fontSize: 12, fontStyle: 'italic', color: '#444', marginTop: 3 }}>&quot;{accord.accord_sans_alcool?.argument}&quot;</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
