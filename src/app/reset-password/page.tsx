'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.updateUser({ password })
    if (!error) { setDone(true); setTimeout(() => router.push('/dashboard'), 2000) }
  }

  return (
    <main style={{ maxWidth: 400, margin: '80px auto', padding: 24, backgroundColor: '#ffffff' }}>
      <h1 style={{ color: '#5E1119', marginBottom: 8 }}>·ispalis·</h1>
      <h2 style={{ marginBottom: 24 }}>Nouveau mot de passe</h2>
      {done ? (
        <div style={{ color: '#2E7D32', fontWeight: 600 }}>✓ Mot de passe mis à jour — redirection...</div>
      ) : (
        <form onSubmit={handleReset}>
          <div style={{ marginBottom: 20 }}>
            <label>Nouveau mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              style={{ display: 'block', width: '100%', padding: 10, marginTop: 6, border: '1px solid #ddd', borderRadius: 4, color: '#1a1a1a' }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: 12, background: '#5E1119', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 15 }}>
            Mettre à jour
          </button>
        </form>
      )}
    </main>
  )
}
