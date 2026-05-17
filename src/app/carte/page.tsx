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

    const { data: menuData } = await supabase
      .from('menus').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(1).maybeSingle()

    if (menuData) {
      setPlats(menuData.plats as string[])
      const { data: recoData } = await supabase
        .from('recommandations').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false }).limit(1).maybeSingle()
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
    setAccords([])
    const formData = new FormData()
    formData.append('pdf', file)
    try {
      const res = await fetch('/api/extraire-menu', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success && data.plats) {
        setPlats(data.plats)
        setImportMsg(`✓ ${data.plats.length} plats extraits — cliquez sur Générer les accords`)
      } else {
        setImportMsg('Erreur lors de l extraction')
      }
    } catch { setImportMsg('Erreur réseau') }
    setImportingPDF(false)
  }

  const genererAccords = async () => {
    const platsRemplis = plats.filter(p => p.trim() !== '')
    if (platsRemplis.length === 0) return
    setLoading(true)
    setSavedMsg('')
    try {
      const stockFormatted = stock.map(s => ({
        nom: `${s.nom_reference} ${s.millesime || ''}`.trim(),
        quantite: s.quantite,
        jours_sans_mouvement: s.derniere_vente
          ? Math.floor((new Date().getTime() - new Date(s.derniere_vente).getTime()) / (1000 * 60 * 60 * 24))
          : 30
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
    await supabase.from('menus').delete()
      .eq('user_id', user.id).eq('date_menu', new Date().toISOString().split('T')[0])
    const { data: menu } = await supabase.from('menus')
      .insert({ user_id: user.id, plats: platsData, date_menu: new Date().toISOString().split('T')[0] })
      .select().single()
    if (menu) {
      await supabase.from('recommandations').insert({
        user_id: user.id, menu_id: menu.id,
        accords: recoData.accords || [],
        alertes_stock: recoData.alertes_stock || [],
        a_valoriser: recoData.a_valoriser || []
      })
      setSavedMsg('✓ Accords sauvegardés — disponibles sur le dashboard')
    }
  }

  const ajouterPlat = () => setPlats([...plats, ''])
  const updatePlat = (i: number, v: string) => { const p = [...plats]; p[i] = v; setPlats(p) }
  const supprimerPlat = (i: number) => setPlats(plats.filter((_, idx) => idx !== i))

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24, backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '2px solid #5E1119', paddingBottom: 16 }}>
        <h1 style={{ color: '#5E1119', margin: 0 }}>·ispalis· — Carte</h1>
        <button onClick={() => router.push('/dashboard')} style={{ padding: '8px 16px', background: '#5E1119', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          ← Dashboard
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div style={{ background: '#E6F1FB', borderRadius: 8, padding: 18, borderLeft: '4px solid #185FA5' }}>
          <div style={{ fontWeight: 600, color: '#185FA5', marginBottom: 8, fontSize: 15 }}>📄 Importer votre carte PDF</div>
          <p style={{ color: '#555', fontSize: 13, marginBottom: 12 }}>
            Uploadez votre carte — Ispalis extrait automatiquement tous vos plats
          </p>
          <input type="file" accept=".pdf" onChange={importerPDF} disabled={importingPDF}
            style={{ fontSize: 13, color: '#1a1a1a', marginBottom: 8 }} />
          {importingPDF && <div style={{ color: '#185FA5', fontSize: 13, marginTop: 8 }}>⏳ Extraction en cours...</div>}
          {importMsg && <div style={{ color: '#2E7D32', fontSize: 13, marginTop: 8, fontWeight: 600 }}>{importMsg}</div>}
        </div>

        <div style={{ background: '#f9f9f9', borderRadius: 8, padding: 18, borderLeft: '4px solid #EEA300' }}>
          <div style={{ fontWeight: 600, color: '#854F0B', marginBottom: 8, fontSize: 15 }}>✏️ Vos plats ({plats.length})</div>
          <p style={{ color: '#555', fontSize: 13, marginBottom: 12 }}>
            Modifiez ou ajoutez des plats manuellement
          </p>
          <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 10 }}>
            {plats.map((plat, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <input type="text" value={plat} onChange={e => updatePlat(i, e.target.value)}
                  placeholder={`Plat ${i + 1}`}
                  style={{ flex: 1, padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, color: '#1a1a1a', backgroundColor: 'white' }} />
                <button onClick={() => supprimerPlat(i)}
                  style={{ padding: '6px 10px', background: 'transparent', border: '1px solid #ddd', borderRadius: 4, color: '#999', cursor: 'pointer' }}>×</button>
              </div>
            ))}
          </div>
          <button onClick={ajouterPlat}
            style={{ width: '100%', padding: 8, background: 'transparent', border: '1px dashed #EEA300', borderRadius: 4, color: '#854F0B', cursor: 'pointer', fontSize: 13 }}>
            + Ajouter un plat
          </button>
        </div>
      </div>

      {plats.length > 0 && (
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <button onClick={genererAccords} disabled={loading}
            style={{ padding: '14px 40px', background: '#5E1119', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 16, fontWeight: 600 }}>
            {loading ? '⏳ Génération en cours...' : '✨ Générer les accords Ispalis'}
          </button>
          {savedMsg && <div style={{ color: '#2E7D32', fontSize: 13, marginTop: 10, fontWeight: 600 }}>{savedMsg}</div>}
        </div>
      )}

      {alertes.length > 0 && (
        <div style={{ background: '#FFF3CD', border: '1px solid #EEA300', borderRadius: 8, padding: 16, marginBottom: 20 }}>
          <h3 style={{ color: '#854F0B', marginBottom: 12 }}>⚠️ Alertes stock</h3>
          {alertes.map((a: any, i: number) => (
            <div key={i} style={{ marginBottom: 6, color: '#1a1a1a' }}>
              <strong>{a.reference}</strong> — {a.message}
              <br /><span style={{ color: '#666', fontSize: 13 }}>→ {a.action}</span>
            </div>
          ))}
        </div>
      )}

      {accords.length > 0 && (
        <div>
          <h2 style={{ color: '#5E1119', marginBottom: 16 }}>Accords générés</h2>
          {accords.map((accord: any, i: number) => (
            <div key={i} style={{ background: 'white', border: '1px solid #eee', borderRadius: 8, padding: 20, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ color: '#5E1119', marginBottom: 16 }}>{accord.plat}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                {[
                  { label: 'Accessible', data: accord.accord_accessible, color: '#2E7D32' },
                  { label: 'Intermédiaire', data: accord.accord_intermediaire, color: '#1565C0' },
                  { label: 'Prestige', data: accord.accord_prestige, color: '#5E1119' },
                ].map(({ label, data, color }) => (
                  <div key={label} style={{ background: '#f9f9f9', borderRadius: 6, padding: 12, borderTop: `3px solid ${color}` }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                    <div style={{ fontWeight: 600, marginBottom: 4, color: '#1a1a1a' }}>{data?.vin}</div>
                    <div style={{ color: '#666', fontSize: 13, marginBottom: 8 }}>{data?.prix}</div>
                    <div style={{ fontSize: 13, fontStyle: 'italic', color: '#444' }}>&quot;{data?.argument}&quot;</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#F0F7F0', borderRadius: 6, padding: 12, borderLeft: '3px solid #2E7D32' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#2E7D32', textTransform: 'uppercase' }}>Sans alcool</span>
                <div style={{ fontWeight: 600, marginTop: 4, color: '#1a1a1a' }}>{accord.accord_sans_alcool?.boisson}</div>
                <div style={{ fontSize: 13, fontStyle: 'italic', color: '#444', marginTop: 4 }}>&quot;{accord.accord_sans_alcool?.argument}&quot;</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
