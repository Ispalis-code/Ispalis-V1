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
    <main style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderBottom: '2px solid #5E1119' }}>
        <h1 style={{ color: '#5E1119', margin: 0, fontSize: 20 }}>·ispalis·</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => router.push('/carte')} style={{ padding: '7px 14px', background: 'transparent', border: '1px solid #5E1119', color: '#5E1119', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>Carte</button>
          <button onClick={() => router.push('/stock')} style={{ padding: '7px 14px', background: 'transparent', border: '1px solid #5E1119', color: '#5E1119', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>Cave ({stock.length} réf.)</button>
          <button onClick={() => router.push('/parametres')} style={{ padding: '7px 14px', background: 'transparent', border: '1px solid #5E1119', color: '#5E1119', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>Paramètres</button>
          <button onClick={handleDeconnexion} style={{ padding: '7px 14px', background: 'transparent', border: '1px solid #ccc', color: '#666', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>Déconnexion</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', height: 'calc(100vh - 58px)' }}>

        {/* COLONNE GAUCHE — Saisie */}
        <div style={{ borderRight: '1px solid #eee', padding: 20, overflowY: 'auto', background: '#fafafa' }}>
          {stock.length > 0 && (
            <div style={{ background: '#F5E6E8', borderRadius: 6, padding: 10, marginBottom: 14, fontSize: 12, color: '#5E1119' }}>
              🍷 <strong>{stock.length} références</strong> en cave utilisées en priorité
            </div>
          )}
          <div style={{ fontWeight: 600, color: '#854F0B', marginBottom: 8, fontSize: 13 }}>Accords rapides</div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>Pour importer votre carte complète → bouton Carte</div>
          {plats.map((plat, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <input type="text" placeholder={`Plat ${i + 1}`} value={plat}
                onChange={e => updatePlat(i, e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, boxSizing: 'border-box', color: '#1a1a1a', backgroundColor: 'white' }} />
            </div>
          ))}
          {erreur && <p style={{ color: 'red', fontSize: 12, marginBottom: 8 }}>{erreur}</p>}
          <button onClick={genererAccords} disabled={loading}
            style={{ width: '100%', padding: 12, background: loading ? '#999' : '#5E1119', color: 'white', border: 'none', borderRadius: 4, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600, marginTop: 4 }}>
            {loading ? '⏳ Génération...' : '✨ Générer les accords'}
          </button>
        </div>

        {/* COLONNE DROITE — Accords */}
        <div style={{ padding: 20, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🍷</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#5E1119' }}>Génération en cours...</div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 8 }}>15 à 45 secondes selon le nombre de plats</div>
            </div>
          ) : !resultats ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🍽️</div>
              <div style={{ fontSize: 15, color: '#888' }}>Les accords apparaîtront ici</div>
              <div style={{ fontSize: 13, color: '#aaa', marginTop: 8 }}>Saisissez vos plats et cliquez sur Générer</div>
            </div>
          ) : (
            <div>
              {resultats.alertes_stock && resultats.alertes_stock.length > 0 && (
                <div style={{ background: '#FFF3CD', border: '1px solid #EEA300', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, color: '#854F0B', marginBottom: 8 }}>⚠️ Alertes stock</div>
                  {resultats.alertes_stock.map((alerte: any, i: number) => (
                    <div key={i} style={{ fontSize: 13, marginBottom: 4, color: '#1a1a1a' }}>
                      <strong>{alerte.reference}</strong> — {alerte.message}
                      <br /><span style={{ color: '#666' }}>→ {alerte.action}</span>
                    </div>
                  ))}
                </div>
              )}
              {resultats.accords && resultats.accords.map((accord: any, i: number) => (
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
              {resultats.a_valoriser && resultats.a_valoriser.length > 0 && (
                <div style={{ background: '#F5E6E8', border: '1px solid #5E1119', borderRadius: 8, padding: 14 }}>
                  <div style={{ fontWeight: 600, color: '#5E1119', marginBottom: 8 }}>🍷 À valoriser ce soir</div>
                  {resultats.a_valoriser.map((v: any, i: number) => (
                    <div key={i} style={{ fontSize: 13, marginBottom: 6, color: '#1a1a1a' }}>
                      <strong>{v.reference}</strong> sur <strong>{v.plat}</strong>
                      <br /><span style={{ color: '#666' }}>→ {v.argument}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
