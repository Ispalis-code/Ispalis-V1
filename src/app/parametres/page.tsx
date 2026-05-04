'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
export default function Parametres() {
  const [nom, setNom] = useState('')
  const [type, setType] = useState('restaurant')
  const [ton, setTon] = useState('professionnel')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    chargerProfil()
  }, [])

  const chargerProfil = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/connexion'); return }
    const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
    if (data) {
      setNom(data.nom_etablissement || '')
      setType(data.type_chr || 'restaurant')
      setTon(data.ton_maison || 'professionnel')
    }
  }

  const sauvegarder = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('users').update({
      nom_etablissement: nom,
      type_chr: type,
      ton_maison: ton
    }).eq('id', user.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setLoading(false)
  }

  return (
    <main style={{ maxWidth: 600, margin: '0 auto', padding: 24, backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, borderBottom: '2px solid #5E1119', paddingBottom: 16 }}>
        <h1 style={{ color: '#5E1119', margin: 0 }}>·ispalis· — Paramètres</h1>
        <button onClick={() => router.push('/dashboard')} style={{ padding: '8px 16px', background: '#5E1119', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          Dashboard
        </button>
      </div>
      <form onSubmit={sauvegarder} style={{ background: '#f9f9f9', padding: 24, borderRadius: 8 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#1a1a1a' }}>Nom de votre établissement</label>
          <input type="text" value={nom} onChange={e => setNom(e.target.value)} placeholder="ex: Club Marot" style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4, color: '#1a1a1a', backgroundColor: 'white', fontSize: 15 }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#1a1a1a' }}>Type d'établissement</label>
          <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4, color: '#1a1a1a', backgroundColor: 'white', fontSize: 15 }}>
            <option value="restaurant">Restaurant</option>
            <option value="hotel">Hôtel</option>
            <option value="traiteur">Traiteur</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#1a1a1a' }}>Ton de maison</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div onClick={() => setTon('professionnel')} style={{ padding: 16, border: `2px solid ${ton === 'professionnel' ? '#5E1119' : '#ddd'}`, borderRadius: 6, cursor: 'pointer', background: ton === 'professionnel' ? '#F5E6E8' : 'white' }}>
              <div style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>Professionnel</div>
              <div style={{ fontSize: 13, color: '#666' }}>"Ce Meursault accompagnera idéalement vos Saint-Jacques"</div>
            </div>
            <div onClick={() => setTon('decontracte')} style={{ padding: 16, border: `2px solid ${ton === 'decontracte' ? '#5E1119' : '#ddd'}`, borderRadius: 6, cursor: 'pointer', background: ton === 'decontracte' ? '#F5E6E8' : 'white' }}>
              <div style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>Décontracté</div>
              <div style={{ fontSize: 13, color: '#666' }}>"Ce vin va super bien avec vos Saint-Jacques !"</div>
            </div>
          </div>
        </div>
        {saved && <div style={{ background: '#E8F5E9', border: '1px solid #2E7D32', borderRadius: 4, padding: 10, marginBottom: 16, color: '#2E7D32', fontWeight: 600 }}>✓ Paramètres sauvegardés !</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, background: '#5E1119', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 16 }}>
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </form>
    </main>
  )
}
