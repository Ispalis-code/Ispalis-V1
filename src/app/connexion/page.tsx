'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
export default function Connexion() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()
  const handleConnexion = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message) } else { router.push('/dashboard') }
    setLoading(false)
  }
  const handleMotDePasseOublie = async () => {
  if (!email) { setError('Entrez votre email d\'abord'); return }
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://ispalis-v1.vercel.app/reset-password'
  })
  if (error) { setError(error.message) } else { setError(''); alert('Email de réinitialisation envoyé !') }
}
  return (
    <main style={{ maxWidth: 400, margin: '80px auto', padding: 24 }}>
      <h1 style={{ color: '#5E1119', marginBottom: 8 }}>ispalis</h1>
      <h2 style={{ marginBottom: 24 }}>Connexion</h2>
      <form onSubmit={handleConnexion}>
        <div style={{ marginBottom: 16 }}>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ display: 'block', width: '100%', padding: 8, marginTop: 4, border: '1px solid #ccc', borderRadius: 4 }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label>Mot de passe</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ display: 'block', width: '100%', padding: 8, marginTop: 4, border: '1px solid #ccc', borderRadius: 4 }} />
        </div>
        {error && <p style={{ color: 'red', marginBottom: 16 }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, background: '#5E1119', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 16 }}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
        <p style={{ textAlign: 'center', marginTop: 12 }}>
  <button
    type="button"
    onClick={handleMotDePasseOublie}
    style={{ background: 'transparent', border: 'none', color: '#5E1119', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}>
    Mot de passe oublié ?
  </button>
</p>
        <p style={{ textAlign: 'center', marginTop: 16 }}>Pas de compte ? <a href="/inscription" style={{ color: '#5E1119' }}>S inscrire</a></p>
      </form>
    </main>
  )
}
