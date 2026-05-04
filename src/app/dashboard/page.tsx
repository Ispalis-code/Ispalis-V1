'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
export default function Dashboard() {
  const [plats, setPlats] = useState(['', '', '', '', ''])
  const [stock, setStock] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [resultats, setResultats] = useState<any>(null)
  const [erreur, setErreur] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    chargerStock()
  }, [])

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
          : 30
      }))
      const response = await fetch('/api/recommandations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plats: platsRemplis, stock: stockFormatted, ton: 'professionnel' })
      })
      const data = await response.json()
      if (data.success) { setResultats(data.data) } else { setErreur('Erreur lors de la génération') }
    } catch { setErreur('Erreur réseau') }
    setLoading(false)
  }

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: 24, backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, borderBottom: '2px solid #5E1119', paddingBottom: 16 }}>
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
        <div style={{ background: '#F5E6E8', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 13, color: '#5E1119' }}>
          🍷 <strong>{stock.length} références</strong> en cave — Ispalis les utilisera en priorité pour vos accords
        </div>
      )}
      <h2 style={{ marginBottom: 16, color: '#1a1a1a' }}>Menu du jour</h2>
      <p style={{ color: '#666', marginBottom: 20 }}>Saisissez vos plats et générez les accords mets-boissons</p>
      <div style={{ background: '#f9f9f9', padding: 20, borderRadius: 8, marginBottom: 24 }}>
        {plats.map((plat, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <input type="text" placeholder={`Plat ${i + 1} — ex: Magret de canard aux cerises`} value={plat} onChange={e => updatePlat(i, e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4, fontSize: 14, boxSizing: 'border-box', color: '#1a1a1a', backgroundColor: 'white' }} />
          </div>
        ))}
        {erreur && <p style={{ color: 'red', marginBottom: 8 }}>{erreur}</p>}
        <button onClick={genererAccords} disabled={loading} style={{ width: '100%', padding: 14, background: '#5E1119', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 16, marginTop: 8 }}>
          {loading ? 'Génération en cours...' : '✨ Générer les accords Ispalis'}
        </button>
      </div>
      {resultats && (
        <div>
          {resultats.alertes_stock && resultats.alertes_stock.length > 0 && (
            <div style={{ background: '#FFF3CD', border: '1px solid #EEA300', borderRadius: 8, padding: 16, marginBottom: 24 }}>
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