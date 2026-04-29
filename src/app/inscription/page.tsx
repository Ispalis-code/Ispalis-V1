'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Inscription() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nom, setNom] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleInscription = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nom_etablissement: nom }
      }
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <main style={{ maxWidth: 400, margin: '80px auto', padding: 24 }}>
      <h1 style={{ color: '#5E1119', marginBottom: 8 }}>·ispalis·</h1>
      <h2 style={{ marginBottom: 24 }}>Créer votre compte</h2>
      <form onSubmit={handleInscription}>
        <div style={{ marginBottom: 16 }}>
          <label>Nom de votre établissement</label>
          <input
            type="text"
            value={nom}
            onChange={e => setNom(e.target.value)}
            required
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4, border: '1px solid #ccc', borderRadius: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4, border: '1px solid #ccc', borderRadius: 4 }}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ display: 'block', width: '100%', padding: 8, marginTop: 4, border: '1px solid #ccc', borderRadius: 4 }}
          />
        </div>
        {error && <p style={{ color: 'red', marginBottom: 16 }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: 12, background: '#5E1119', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 16 }}
        >
          {loading ? 'Création...' : 'Créer mon compte'}
        </button>
        <p style={{ textAlign: 'center', marginTop: 16 }}>
          Déjà un compte ? <a href="/connexion" style={{ color: '#5E1119' }}>Se connecter</a>
        </p>
      </form>
    </main>
  )
}
