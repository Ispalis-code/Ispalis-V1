'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [plats, setPlats] = useState<string[]>(['', '', '', '', ''])
  const [stock, setStock] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [importingPDF, setImportingPDF] = useState(false)
  const [importPDFMsg, setImportPDFMsg] = useState('')
  const [resultats, setResultats] = useState<any>(null)
  const [erreur, setErreur] = useState('')
  const [menuId, setMenuId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    chargerDonnees()
  }, [])

  const chargerDonnees = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/connexion'); return }

    // Charger le stock
    const { data: stockData } = await supabase
      .from('stocks').select('*').eq('user_id', user.id)
    if (stockData) setStock(stockData)

    // Charger le dernier menu sauvegardé
    const { data: menuData } = await supabase
      .from('menus')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (menuData) {
      setMenuId(menuData.id)
      const platsMenu = menuData.plats as string[]
      setPlats(platsMenu.length >= 5 ? platsMenu : [...platsMenu, ...Array(5).fill('')].slice(0, Math.max(platsMenu.length, 5)))

      // Charger les derniers accords pour ce menu
    const { data: recoData } = await supabase
  .from('recommandations')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle()

console.log('Accords chargés:', recoData)

      if (recoData) {
        setResultats({
          accords: recoData.accords,
          alertes_stock: recoData.alertes_stock,
          a_valoriser: recoData.a_valoriser
        })
      }
    }
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

  const sauvegarderMenu = async (platsAlt?: string[]) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const platsASauvegarder = (platsAlt || plats).filter(p => p.trim() !== '')
    
    // Supprimer le menu du jour s'il existe déjà
    await supabase
      .from('menus')
      .delete()
      .eq('user_id', user.id)
      .eq('date_menu', new Date().toISOString().split('T')[0])

    const { data } = await supabase
      .from('menus')
      .insert({ user_id: user.id, plats: platsASauvegarder, date_menu: new Date().toISOString().split('T')[0] })
      .select()
      .single()
    if (data) { setMenuId(data.id); return data.id }
    return null
  }

  const genererAccords = async (platsOverride?: string[]) => {
    const platsRemplis = (platsOverride || plats).filter(p => p.trim() !== '')
    if (platsRemplis.length === 0) { setErreur('Ajoutez au moins un plat'); return }
    setLoading(true)
    setErreur('')
    setResultats(null)
    try {
      const mId = await sauvegarderMenu(platsOverride)
      const stockFormatted = stock.map(s => ({
        nom: `${s.nom_reference} ${s.millesime || ''}`.trim(),
        quantite: s.quantite,
        jours_sans_mouvement: s.derniere_vente
          ? Math.floor((new Date().getTime() - new Date(s.derniere_vente).getTime()) / (1000 * 60 * 60 * 24))
          : 30
      }))
      const response = await fetch('/api/recommandations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plats: platsRemplis, stock: stockFormatted, ton: 'professionnel' })
      })
      const data = await response.json()
      if (data.success) {
        setResultats(data.data)
        // Sauvegarder les accords dans Supabase
        const { data: { user } } = await supabase.auth.getUser()
        if (user && mId) {
          await supabase.from('recommandations').insert({
            user_id: user.id,
            menu_id: mId,
            accords: data.data.accords,
            alertes_stock: data.data.alertes_stock || [],
            a_valoriser: data.data.a_valoriser || []
          })
        }
      } else {
        setErreur('Erreur lors de la génération')
      }
    } catch { setErreur('Erreur réseau') }
    setLoading(false)
  }

  const importerMenuPDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportingPDF(true)
    setImportPDFMsg('')
    setResultats(null)
    const formData = new FormData()
    formData.append('pdf', file)
    try {
      const response = await fetch('/api/extraire-menu', { method: 'POST', body: formData })
      const data = await response.json()
      if (data.success && data.plats) {
        const extracted = data.plats
        setPlats([...extracted, '', '', '', '', ''].slice(0, Math.max(extracted.length, 5)))
        setImportPDFMsg(`✓ ${extracted.length} plats extraits — génération des accords...`)
        await genererAccords(extracted)
        setImportPDFMsg(`✓ ${extracted.length} plats extraits et accords générés !`)
      } else {
        setImportPDFMsg('Erreur lors de l extraction')
      }
    } catch {
      setImportPDFMsg('Erreur réseau')
    }
    setImportingPDF(false)
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24, backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '2px solid #5E1119', paddingBottom: 16 }}>
        <h1 style={{ color: '#5E1119', margin: 0 }}>·ispalis·</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => router.push('/stock')} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #5E1119', color: '#5E1119', borderRadius: 4, cursor: 'pointer' }}>
            Cave ({stock.length} réf.)
          </button>
          <button onClick={() => router.push('/parametres')} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #5E1119', color: '#5E1119', borderRadius: 4, cursor: 'pointer' }}>
            Paramètres
          </button>
          <button onClick={handleDeconnexion} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #ccc', color: '#666', borderRadius: 4, cursor: 'pointer' }}>
            Déconnexion
          </button>
        </div>
      </div>

      {stock.length > 0 && (
        <div style={{ background: '#F5E6E8', borderRadius: 8, padding: 10, marginBottom: 16, fontSize: 13, color: '#5E1119' }}>
          🍷 <strong>{stock.length} références</strong> en cave — Ispalis les utilisera en priorité pour vos accords
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: '#E6F1FB', borderRadius: 8, padding: 16, borderLeft: '4px solid #185FA5' }}>
          <div style={{ fontWeight: 600, color: '#185FA5', marginBottom: 6 }}>📄 Importer votre carte PDF</div>
          <p style={{ color: '#666', fontSize: 12, marginBottom: 10 }}>Uploadez votre carte — Ispalis extrait vos plats et génère les accords automatiquement</p>
          <input type="file" accept=".pdf" onChange={importerMenuPDF} disabled={importingPDF} style={{ fontSize: 13, color: '#1a1a1a' }} />
          {importingPDF && <div style={{ color: '#185FA5', fontSize: 12, marginTop: 8 }}>⏳ Extraction et génération en cours...</div>}
          {importPDFMsg && <div style={{ color: '#2E7D32', fontSize: 12, marginTop: 8, fontWeight: 600 }}>{importPDFMsg}</div>}
        </div>

        <div style={{ background: '#f9f9f9', borderRadius: 8, padding: 16, borderLeft: '4px solid #EEA300' }}>
          <div style={{ fontWeight: 600, color: '#854F0B', marginBottom: 6 }}>✏️ Saisie manuelle</div>
          <p style={{ color: '#666', fontSize: 12, marginBottom: 10 }}>Ajoutez ou modifiez vos plats manuellement puis régénérez les accords</p>
          {plats.map((plat, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <input
                type="text"
                placeholder={`Plat ${i + 1}`}
                value={plat}
                onChange={e => updatePlat(i, e.target.value)}
                style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, fontSize: 13, boxSizing: 'border-box', color: '#1a1a1a', backgroundColor: 'white' }}
              />
            </div>
          ))}
          {erreur && <p style={{ color: 'red', fontSize: 12, marginBottom: 8 }}>{erreur}</p>}
          <button
            onClick={() => genererAccords()}
            disabled={loading}
            style={{ width: '100%', padding: 10, background: '#5E1119', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14, marginTop: 4 }}
          >
            {loading ? 'Génération...' : '✨ Générer les accords'}
          </button>
        </div>
      </div>

      {resultats && (
        <div>
          {resultats.alertes_stock && resultats.alertes_stock.length > 0 && (
            <div style={{ background: '#FFF3CD', border: '1px solid #EEA300', borderRadius: 8, padding: 16, marginBottom: 20 }}>
              <h3 style={{ color: '#854F0B', marginBottom: 12 }}>⚠️ Alertes stock</h3>
              {resultats.alertes_stock.map((alerte: any, i: number) => (
                <div key={i} style={{ marginBottom: 8, color: '#1a1a1a' }}>
                  <strong>{alerte.reference}</strong> — {alerte.message}
                  <br /><span style={{ color: '#666', fontSize: 13 }}>→ {alerte.action}</span>
                </div>
              ))}
            </div>
          )}

          {resultats.accords && resultats.accords.map((accord: any, i: number) => (
            <div key={i} style={{ background: 'white', border: '1px solid #eee', borderRadius: 8, padding: 20, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ color: '#5E1119', marginBottom: 16, fontSize: 18 }}>{accord.plat}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                {[
                  { label: 'Accessible', data: accord.accord_accessible, color: '#2E7D32' },
                  { label: 'Intermédiaire', data: accord.accord_intermediaire, color: '#1565C0' },
                  { label: 'Prestige', data: accord.accord_prestige, color: '#5E1119' },
                ].map(({ label, data, color }) => (
                  <div key={label} style={{ background: '#f9f9f9', borderRadius: 6, padding: 12, borderTop: `3px solid ${color}` }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                    <div style={{ fontWeight: 600, marginBottom: 4, color: '#1a1a1a' }}>{data.vin}</div>
                    <div style={{ color: '#666', fontSize: 13, marginBottom: 8 }}>{data.prix}</div>
                    <div style={{ fontSize: 13, fontStyle: 'italic', color: '#444' }}>&quot;{data.argument}&quot;</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#F0F7F0', borderRadius: 6, padding: 12, borderLeft: '3px solid #2E7D32' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#2E7D32', textTransform: 'uppercase' }}>Sans alcool</span>
                <div style={{ fontWeight: 600, marginTop: 4, color: '#1a1a1a' }}>{accord.accord_sans_alcool.boisson}</div>
                <div style={{ fontSize: 13, fontStyle: 'italic', color: '#444', marginTop: 4 }}>&quot;{accord.accord_sans_alcool.argument}&quot;</div>
              </div>
            </div>
          ))}

          {resultats.a_valoriser && resultats.a_valoriser.length > 0 && (
            <div style={{ background: '#F5E6E8', border: '1px solid #5E1119', borderRadius: 8, padding: 16, marginTop: 8 }}>
              <h3 style={{ color: '#5E1119', marginBottom: 12 }}>🍷 À valoriser ce soir</h3>
              {resultats.a_valoriser.map((v: any, i: number) => (
                <div key={i} style={{ marginBottom: 8, color: '#1a1a1a' }}>
                  <strong>{v.reference}</strong> sur <strong>{v.plat}</strong>
                  <br /><span style={{ color: '#666', fontSize: 13 }}>→ {v.argument}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  )
}