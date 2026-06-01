'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const ISP = {
  burgundy: '#5E1119',
  ochre: '#EEA300',
  ink: '#1A1410',
  paper: '#F4EDE0',
  paperWarm: '#FBF6EC',
  card: '#FFFCF6',
  sage: '#7D8A5C',
  sagePale: '#E4E8D6',
  terracotta: '#B5613B',
  rule: '#E2D8C2',
  muted: '#7A6A55',
}

const ADMIN_PASSWORD = 'ispalis2026'

function InfoBubble({ text }: { text: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        style={{
          width: 16, height: 16, borderRadius: '50%',
          background: visible ? ISP.burgundy : ISP.rule,
          color: visible ? '#fff' : ISP.muted,
          border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 10, fontWeight: 800,
          display: 'grid', placeItems: 'center',
          transition: 'all .15s', flexShrink: 0,
          lineHeight: 1,
        }}
        title="En savoir plus"
      >
        i
      </button>
      {visible && (
        <>
          <div
            onClick={() => setVisible(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          />
          <div style={{
            position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
            transform: 'translateX(-50%)',
            background: ISP.burgundy, color: ISP.paper,
            fontSize: 12, fontWeight: 500, lineHeight: 1.5,
            padding: '10px 14px', borderRadius: 10,
            width: 220, zIndex: 50,
            boxShadow: '0 8px 24px -8px rgba(94,17,25,.4)',
            pointerEvents: 'none',
          }}>
            {text}
            <div style={{
              position: 'absolute', top: '100%', left: '50%',
              transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: `6px solid ${ISP.burgundy}`,
            }} />
          </div>
        </>
      )}
    </div>
  )
}

export default function Admin() {
  const [auth, setAuth] = useState(false)
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState('')
  const [logs, setLogs] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [periode, setPeriode] = useState<'7' | '30' | '90'>('30')
  const supabase = createClient()
  const router = useRouter()

  const login = (e: React.FormEvent) => {
    e.preventDefault()
    if (pwd === ADMIN_PASSWORD) { setAuth(true); chargerDonnees('30') }
    else setError('Mot de passe incorrect')
  }

  const chargerDonnees = async (p: string) => {
    const depuis = new Date()
    depuis.setDate(depuis.getDate() - parseInt(p))
    const depuis_iso = depuis.toISOString()

    const { data: logsData } = await supabase
      .from('logs_api')
      .select('*')
      .gte('created_at', depuis_iso)
      .order('created_at', { ascending: false })
    if (logsData) setLogs(logsData)

    const { data: usersData } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    if (usersData) setUsers(usersData)
  }

  useEffect(() => {
    if (auth) chargerDonnees(periode)
  }, [periode, auth])

  const totalCout = logs.reduce((s, l) => s + (l.cout_usd || 0), 0)
  const totalAppels = logs.length
  const totalPlats = logs.reduce((s, l) => s + (l.nb_plats || 0), 0)
  const coutMoyen = totalAppels > 0 ? totalCout / totalAppels : 0

  const parUser = logs.reduce((acc, l) => {
    if (!l.user_id) return acc
    if (!acc[l.user_id]) acc[l.user_id] = { appels: 0, cout: 0, plats: 0 }
    acc[l.user_id].appels++
    acc[l.user_id].cout += l.cout_usd || 0
    acc[l.user_id].plats += l.nb_plats || 0
    return acc
  }, {} as Record<string, any>)

  if (!auth) return (
    <main style={{ background: ISP.paper, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: ISP.card, borderRadius: 18, padding: '40px 48px', width: 360, boxShadow: '0 12px 40px -16px rgba(60,40,20,.25)' }}>
        <div style={{ color: ISP.burgundy, fontWeight: 800, fontSize: 22, marginBottom: 4 }}>·ispalis·</div>
        <div style={{ color: ISP.muted, fontSize: 13, marginBottom: 28 }}>Tableau de bord admin</div>
        <form onSubmit={login}>
          <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Mot de passe admin" autoFocus
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${ISP.rule}`, fontFamily: 'inherit', fontSize: 14, color: ISP.ink, background: ISP.paperWarm, outline: 'none', boxSizing: 'border-box' as const, marginBottom: 12 }} />
          {error && <div style={{ color: ISP.burgundy, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>{error}</div>}
          <button type="submit" style={{ width: '100%', padding: '12px', background: ISP.burgundy, color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'inherit', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            Accéder
          </button>
        </form>
      </div>
    </main>
  )

  return (
    <main style={{ background: ISP.paper, minHeight: '100vh', color: ISP.ink }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 44px', borderBottom: `1px solid ${ISP.rule}`, background: ISP.burgundy }}>
        <div style={{ color: ISP.ochre, fontWeight: 800, fontSize: 20 }}>·ispalis· — Admin</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['7', '30', '90'] as const).map(p => (
            <button key={p} onClick={() => setPeriode(p)}
              style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${periode === p ? ISP.ochre : 'rgba(255,255,255,0.3)'}`, background: periode === p ? ISP.ochre : 'transparent', color: periode === p ? ISP.burgundy : 'white', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              {p}j
            </button>
          ))}
          <button onClick={() => router.push('/dashboard')}
            style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: 'white', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer', marginLeft: 8 }}>
            ← Dashboard
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 44px' }}>

        {/* Stats globales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 16, marginBottom: 32 }}>
          {[
            {
              label: 'Restaurants inscrits', value: users.length, suffix: '', color: ISP.burgundy,
              info: 'Nombre total de comptes créés sur Ispalis, toutes périodes confondues.',
            },
            {
              label: `Appels API (${periode}j)`, value: totalAppels, suffix: '', color: ISP.terracotta,
              info: `Nombre de fois où Claude a été appelé pour générer des accords sur les ${periode} derniers jours.`,
            },
            {
              label: `Coût total (${periode}j)`, value: totalCout.toFixed(4), suffix: '$', color: ISP.sage,
              info: `Somme des coûts Anthropic en dollars sur les ${periode} derniers jours. Basé sur les tokens consommés.`,
            },
            {
              label: 'Coût moyen / appel', value: coutMoyen.toFixed(4), suffix: '$', color: ISP.muted,
              info: "Coût moyen par génération d'accords. Utile pour estimer la rentabilité par restaurant.",
            },
          ].map(({ label, value, suffix, color, info }) => (
            <div key={label} style={{ background: ISP.card, borderRadius: 14, padding: '18px 20px', borderTop: `4px solid ${color}`, boxShadow: '0 1px 0 rgba(60,40,20,.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: ISP.muted }}>{label}</div>
                <InfoBubble text={info} />
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', color: ISP.ink, lineHeight: 1 }}>{value}<span style={{ fontSize: 16, opacity: 0.6 }}>{suffix}</span></div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 24 }}>

          {/* Par restaurant */}
          <section style={{ background: ISP.card, borderRadius: 18, padding: '24px 28px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: ISP.terracotta, marginBottom: 4 }}>Par restaurant</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 16px' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>Utilisation</h2>
              <InfoBubble text="Cumul des appels API, plats générés et coût par restaurant sur la période sélectionnée." />
            </div>
            {Object.keys(parUser).length === 0 ? (
              <div style={{ color: ISP.muted, fontSize: 13 }}>Aucune donnée sur cette période</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                {Object.entries(parUser).map(([userId, data]: [string, any]) => {
                  const user = users.find(u => u.id === userId)
                  return (
                    <div key={userId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: ISP.paperWarm, borderRadius: 10, fontSize: 13 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: ISP.ink }}>{user?.nom_etablissement || userId.slice(0, 8) + '...'}</div>
                        <div style={{ color: ISP.muted, fontSize: 12 }}>{data.appels} appels · {data.plats} plats</div>
                      </div>
                      <div style={{ fontWeight: 800, color: data.cout > 0.5 ? ISP.terracotta : ISP.sage, fontSize: 14 }}>
                        ${data.cout.toFixed(4)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Derniers appels */}
          <section style={{ background: ISP.card, borderRadius: 18, padding: '24px 28px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: ISP.terracotta, marginBottom: 4 }}>Historique</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 16px' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>Derniers appels</h2>
              <InfoBubble text="Les 20 derniers appels Claude triés du plus récent au plus ancien. Chaque ligne = une génération d'accords." />
            </div>
            {logs.length === 0 ? (
              <div style={{ color: ISP.muted, fontSize: 13 }}>Aucun appel sur cette période</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8, maxHeight: 400, overflowY: 'auto' as const }}>
                {logs.slice(0, 20).map((log, i) => {
                  const user = users.find(u => u.id === log.user_id)
                  const date = new Date(log.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: ISP.paperWarm, borderRadius: 8, fontSize: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: ISP.ink }}>{user?.nom_etablissement || 'Inconnu'}</div>
                        <div style={{ color: ISP.muted }}>{date} · {log.nb_plats} plat{log.nb_plats > 1 ? 's' : ''}</div>
                      </div>
                      <div style={{ textAlign: 'right' as const }}>
                        <div style={{ fontWeight: 700, color: ISP.sage }}>${(log.cout_usd || 0).toFixed(4)}</div>
                        <div style={{ color: ISP.muted }}>{log.input_tokens + log.output_tokens} tokens</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        {/* Liste restaurants */}
        <section style={{ background: ISP.card, borderRadius: 18, padding: '24px 28px', marginTop: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: ISP.terracotta, marginBottom: 4 }}>Inscrits</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 16px' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>Restaurants ({users.length})</h2>
            <InfoBubble text="Liste de tous les établissements inscrits sur Ispalis, triés par date d'inscription (le plus récent en premier)." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10 }}>
            {users.map((user: any) => (
              <div key={user.id} style={{ padding: '10px 14px', background: ISP.paperWarm, borderRadius: 10, fontSize: 13 }}>
                <div style={{ fontWeight: 700, color: ISP.ink }}>{user.nom_etablissement || 'Sans nom'}</div>
                <div style={{ color: ISP.muted, fontSize: 12, marginTop: 2 }}>{user.email}</div>
                <div style={{ color: ISP.muted, fontSize: 11, marginTop: 2 }}>
                  {new Date(user.created_at).toLocaleDateString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}
