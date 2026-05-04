'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
export default function Stock() {
  const [references, setReferences] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [nom, setNom] = useState('')
  const [appellation, setAppellation] = useState('')
  const [couleur, setCouleur] = useState('rouge')
  const [quantite, setQuantite] = useState('')
  const [millesime, setMillesime] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    chargerStock()
  }, [])

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
      user_id: user.id,
      nom_reference: nom,
      appellation,
      couleur,
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

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24, backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, borderBottom: '2px solid #5E1119', paddingBottom: 16 }}>
        <h1 style={{ color: '#5E1119', margin: 0 }}>·ispalis· — Stock cave</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => router.push('/dashboard')} style={{ padding: '8px 16px', background: '#5E1119', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Dashboard</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <h2 style={{ color: '#1a1a1a', marginBottom: 16 }}>Ajouter une référence</h2>
          <form onSubmit={ajouterReference} style={{ background: '#f9f9f9', padding: 20, borderRadius: 8 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, color: '#1a1a1a', fontWeight: 600 }}>Nom de la référence *</label>
              <input type="text" value={nom} onChange={e => setNom(e.target.value)} required placeholder="ex: Château Margaux" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, color: '#1a1a1a', backgroundColor: 'white' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, color: '#1a1a1a', fontWeight: 600 }}>Appellation</label>
              <input type="text" value={appellation} onChange={e => setAppellation(e.target.value)} placeholder="ex: Margaux AOC" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, color: '#1a1a1a', backgroundColor: 'white' }} />
            </div>
            <div style={{ marginBottom: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, color: '#1a1a1a', fontWeight: 600 }}>Couleur *</label>
                <select value={couleur} onChange={e => setCouleur(e.target.value)} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, color: '#1a1a1a', backgroundColor: 'white' }}>
                  <option value="rouge">Rouge</option>
                  <option value="blanc">Blanc</option>
                  <option value="rose">Rosé</option>
                  <option value="effervescent">Effervescent</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, color: '#1a1a1a', fontWeight: 600 }}>Millésime</label>
                <input type="number" value={millesime} onChange={e => setMillesime(e.target.value)} placeholder="ex: 2021" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, color: '#1a1a1a', backgroundColor: 'white' }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, color: '#1a1a1a', fontWeight: 600 }}>Quantité (bouteilles) *</label>
              <input type="number" value={quantite} onChange={e => setQuantite(e.target.value)} required placeholder="ex: 12" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, color: '#1a1a1a', backgroundColor: 'white' }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, background: '#5E1119', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 15 }}>
              {loading ? 'Ajout...' : '+ Ajouter au stock'}
            </button>
          </form>
        </div>
        <div>
          <h2 style={{ color: '#1a1a1a', marginBottom: 16 }}>Votre cave ({references.length} références)</h2>
          {references.length === 0 ? (
            <div style={{ background: '#f9f9f9', padding: 24, borderRadius: 8, textAlign: 'center', color: '#666' }}>
              Aucune référence — ajoutez vos vins
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {references.map((ref: any) => (
                <div key={ref.id} style={{ background: '#f9f9f9', padding: 12, borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${ref.couleur === 'rouge' ? '#5E1119' : ref.couleur === 'blanc' ? '#EEA300' : ref.couleur === 'rose' ? '#E8A0A0' : '#666'}` }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{ref.nom_reference} {ref.millesime && `(${ref.millesime})`}</div>
                    <div style={{ fontSize: 13, color: '#666' }}>{ref.appellation} — {ref.quantite} bouteilles</div>
                  </div>
                  <button onClick={() => supprimerReference(ref.id)} style={{ background: 'transparent', border: 'none', color: '#999', cursor: 'pointer', fontSize: 18 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
