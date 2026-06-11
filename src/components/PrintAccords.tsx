'use client'
import { useState } from 'react'

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

interface PrintOptions {
  nomRestaurant: boolean
  date: boolean
  niveaux: boolean
  prixVerre: boolean
  prixBouteille: boolean
  argument: boolean
  sansAlcool: boolean
  accordBouteille: boolean
  logoIspalis: boolean
}

interface PrintAccordsProps {
  accords: any[]
  accordBouteille?: any
  nomRestaurant?: string
}

export default function PrintAccords({ accords, accordBouteille, nomRestaurant }: PrintAccordsProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<PrintOptions>({
    nomRestaurant: true,
    date: true,
    niveaux: true,
    prixVerre: true,
    prixBouteille: true,
    argument: true,
    sansAlcool: true,
    accordBouteille: !!accordBouteille,
    logoIspalis: true,
  })
  const [commentaire, setCommentaire] = useState('')

  const toggle = (key: keyof PrintOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const genererEtImprimer = () => {
    const date = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
    const dateCap = date.charAt(0).toUpperCase() + date.slice(1)

    const niveauxColors: Record<string, string> = {
      'Accessible': ISP.sage,
      'Intermédiaire': ISP.terracotta,
      'Prestige': ISP.burgundy,
    }

    const accordsHTML = accords.map(accord => {
      const niveaux = options.niveaux ? [
        { label: 'Accessible', data: accord.accord_accessible, color: niveauxColors['Accessible'] },
        { label: 'Intermédiaire', data: accord.accord_intermediaire, color: niveauxColors['Intermédiaire'] },
        { label: 'Prestige', data: accord.accord_prestige, color: niveauxColors['Prestige'] },
      ] : []

      const niveauxHTML = niveaux.map(({ label, data, color }) => `
        <div style="flex:1; background:#FBF6EC; border-radius:10px; padding:14px 16px; border-top:3px solid ${color}; min-width:0;">
          <div style="font-size:9px; font-weight:800; color:${color}; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:6px;">${label}</div>
          <div style="font-weight:800; font-size:13px; color:${ISP.ink}; line-height:1.3; margin-bottom:4px;">${data?.vin || ''}</div>
          ${options.prixVerre || options.prixBouteille ? `
            <div style="font-size:10px; color:${ISP.muted}; font-weight:600; margin-bottom:6px;">
              ${options.prixVerre ? `🍷 ${data?.prix_verre}` : ''}
              ${options.prixVerre && options.prixBouteille ? ' · ' : ''}
              ${options.prixBouteille ? `🍾 ${data?.prix_bouteille}` : ''}
            </div>
          ` : ''}
          ${options.argument ? `<div style="font-size:11px; font-style:italic; color:${ISP.ink}; line-height:1.4;">« ${data?.argument} »</div>` : ''}
        </div>
      `).join('')

      const sansAlcoolHTML = options.sansAlcool && accord.accord_sans_alcool ? `
        <div style="background:${ISP.sagePale}; border-radius:10px; padding:10px 14px; display:flex; gap:12px; align-items:flex-start; border-left:3px solid ${ISP.sage}; margin-top:10px;">
          <div style="font-size:9px; font-weight:800; color:${ISP.sage}; text-transform:uppercase; letter-spacing:0.1em; white-space:nowrap; padding-top:1px;">Sans alcool</div>
          <div>
            <div style="font-weight:800; font-size:12px; color:${ISP.ink};">${accord.accord_sans_alcool?.boisson || ''}</div>
            ${options.argument ? `<div style="font-size:11px; font-style:italic; color:${ISP.muted}; margin-top:3px;">« ${accord.accord_sans_alcool?.argument} »</div>` : ''}
          </div>
        </div>
      ` : ''

      return `
        <div style="margin-bottom:24px; page-break-inside:avoid;">
          <div style="display:flex; align-items:center; gap:12px; padding-bottom:12px; margin-bottom:12px; border-bottom:1.5px dashed ${ISP.rule};">
            <div style="font-size:18px; font-weight:800; color:${ISP.burgundy}; letter-spacing:-0.015em;">${accord.plat}</div>
          </div>
          ${options.niveaux ? `<div style="display:flex; gap:10px;">${niveauxHTML}</div>` : ''}
          ${sansAlcoolHTML}
        </div>
      `
    }).join('')

    const accordBouteilleHTML = options.accordBouteille && accordBouteille ? `
      <div style="background:${ISP.burgundy}; color:white; border-radius:14px; padding:20px 24px; margin-top:24px; page-break-inside:avoid;">
        <div style="font-size:9px; font-weight:800; color:${ISP.ochre}; text-transform:uppercase; letter-spacing:0.14em; margin-bottom:14px;">🍾 Accord bouteille — tout le menu</div>
        <div style="display:flex; gap:14px;">
          ${[
            { label: 'Notre recommandation', data: accordBouteille.accord_principal },
            { label: 'Alternative', data: accordBouteille.accord_alternatif },
          ].map(({ label, data }) => `
            <div style="flex:1; background:rgba(255,255,255,0.1); border-radius:10px; padding:14px 16px;">
              <div style="font-size:9px; font-weight:800; color:${ISP.ochre}; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:6px;">${label}</div>
              <div style="font-weight:800; font-size:14px; color:white; line-height:1.3;">${data?.vin || ''}</div>
              ${options.prixBouteille ? `<div style="font-size:10px; color:rgba(255,255,255,0.7); margin-top:4px;">🍾 ${data?.prix_bouteille}</div>` : ''}
              ${options.argument ? `<div style="font-size:11px; font-style:italic; color:#F2BD4E; margin-top:8px; line-height:1.4;">« ${data?.argument} »</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''

    const logoHTML = options.logoIspalis ? `
      <div style="display:flex; align-items:center; gap:6px; color:${ISP.burgundy}; font-weight:800; font-size:16px;">
        <span style="width:8px; height:8px; border-radius:50%; background:${ISP.ochre};"></span>
        <span>Ispalis</span>
        <span style="width:8px; height:8px; border-radius:50%; background:${ISP.ochre};"></span>
      </div>
    ` : ''

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Accords Ispalis — ${dateCap}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: Georgia, serif;
            background: #F4EDE0;
            color: #1A1410;
            padding: 40px 48px;
            max-width: 900px;
            margin: 0 auto;
          }
          @media print {
            body { background: white; padding: 24px 32px; }
            @page { margin: 1.5cm; size: A4; }
          }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div style="display:flex; align-items:flex-start; justify-content:space-between; padding-bottom:20px; margin-bottom:28px; border-bottom:2px solid ${ISP.ink};">
          <div>
            ${options.nomRestaurant && nomRestaurant ? `
              <div style="font-size:10px; font-weight:800; letter-spacing:0.14em; text-transform:uppercase; color:${ISP.terracotta}; margin-bottom:4px;">Établissement</div>
              <div style="font-size:22px; font-weight:800; color:${ISP.ink}; letter-spacing:-0.01em;">${nomRestaurant}</div>
            ` : ''}
            ${options.date ? `
              <div style="font-size:13px; color:${ISP.muted}; margin-top:${options.nomRestaurant && nomRestaurant ? '4px' : '0'};">${dateCap}</div>
            ` : ''}
          </div>
          ${logoHTML}
        </div>

        <!-- Titre section -->
        <div style="display:flex; align-items:center; gap:12px; font-size:10px; letter-spacing:0.16em; text-transform:uppercase; font-weight:800; color:${ISP.terracotta}; margin-bottom:20px;">
          <span style="width:20px; height:1.5px; background:${ISP.terracotta};"></span>
          <span>Accords mets-boissons</span>
          <span style="flex:1; height:1.5px; background:${ISP.terracotta}40;"></span>
        </div>
${commentaire.trim() ? `
  <div style="margin-bottom:20px; padding:14px 18px; background:${ISP.paperWarm}; border-radius:10px; border-left:3px solid ${ISP.terracotta};">
    <div style="font-size:9px; font-weight:800; color:${ISP.terracotta}; text-transform:uppercase; letter-spacing:0.12em; margin-bottom:6px;">Commentaire</div>
    <div style="font-size:13px; color:${ISP.ink}; font-style:italic; line-height:1.5;">${commentaire.trim()}</div>
  </div>
` : ''}
        <!-- Accords -->
        ${accordsHTML}

        <!-- Accord bouteille -->
        ${accordBouteilleHTML}

        <!-- Footer -->
        <div style="margin-top:32px; padding-top:16px; border-top:1px solid ${ISP.rule}; display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:10px; color:${ISP.muted};">Généré par Ispalis · ispalis.com</div>
          <div style="font-size:10px; color:${ISP.muted};">${dateCap}</div>
        </div>
      </body>
      </html>
    `

    // Ouvrir dans un nouvel onglet et déclencher l'impression
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => {
      win.print()
    }, 500)
  }

  const CheckBox = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
    <div
      onClick={onChange}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
        background: checked ? `${ISP.burgundy}08` : 'transparent',
        transition: 'background .15s',
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
        background: checked ? ISP.burgundy : 'transparent',
        border: `2px solid ${checked ? ISP.burgundy : ISP.rule}`,
        display: 'grid', placeItems: 'center',
        transition: 'all .15s',
      }}>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: ISP.ink }}>{label}</span>
    </div>
  )

  if (accords.length === 0) return null

  return (
    <>
      {/* Bouton déclencheur */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 18px', borderRadius: 12,
          background: open ? ISP.burgundy : ISP.card,
          color: open ? ISP.card : ISP.ink,
          border: `1.5px solid ${open ? ISP.burgundy : ISP.rule}`,
          fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
          cursor: 'pointer', transition: 'all .15s',
          boxShadow: '0 1px 0 rgba(60,40,20,.04)',
        }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
        Imprimer / PDF
      </button>

      {/* Panneau options */}
      {open && (
        <div style={{
          background: ISP.card, borderRadius: 16, padding: '20px 24px',
          boxShadow: '0 1px 0 rgba(60,40,20,.04), 0 12px 32px -16px rgba(60,40,20,.2)',
          border: `1px solid ${ISP.rule}`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: ISP.terracotta, marginBottom: 14 }}>
            Contenu de la fiche
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            <CheckBox label="Nom du restaurant" checked={options.nomRestaurant} onChange={() => toggle('nomRestaurant')} />
            <CheckBox label="Date du service" checked={options.date} onChange={() => toggle('date')} />
            <CheckBox label="3 niveaux d'accord" checked={options.niveaux} onChange={() => toggle('niveaux')} />
            <CheckBox label="Prix au verre" checked={options.prixVerre} onChange={() => toggle('prixVerre')} />
            <CheckBox label="Prix à la bouteille" checked={options.prixBouteille} onChange={() => toggle('prixBouteille')} />
            <CheckBox label="Argument d'accord" checked={options.argument} onChange={() => toggle('argument')} />
            <CheckBox label="Option sans alcool" checked={options.sansAlcool} onChange={() => toggle('sansAlcool')} />
            {accordBouteille && (
              <CheckBox label="Accord bouteille du menu" checked={options.accordBouteille} onChange={() => toggle('accordBouteille')} />
            )}
            <CheckBox label="Logo Ispalis" checked={options.logoIspalis} onChange={() => toggle('logoIspalis')} />
          </div>
      {/* Commentaire personnalisé */}
<div style={{ gridColumn: '1 / -1', marginTop: 4 }}>
  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: ISP.muted, marginBottom: 6 }}>
    Commentaire personnalisé
  </div>
  <textarea
    value={commentaire}
    onChange={e => setCommentaire(e.target.value)}
    placeholder="ex : Accords proposés par notre équipe ce soir…"
    rows={2}
    style={{
      width: '100%', padding: '10px 12px', borderRadius: 10,
      border: `1.5px solid ${ISP.rule}`, fontFamily: 'inherit',
      fontSize: 13, color: ISP.ink, background: ISP.paperWarm,
      outline: 'none', resize: 'none', boxSizing: 'border-box' as const,
      transition: 'border-color .15s',
    }}
    onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = ISP.burgundy}
    onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = ISP.rule}
  />
</div>
          <button
            onClick={genererEtImprimer}
            style={{
              marginTop: 16, width: '100%',
              background: ISP.burgundy, color: ISP.card,
              border: 'none', borderRadius: 12, padding: '13px 20px',
              fontFamily: 'inherit', fontWeight: 800, fontSize: 14.5,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 10,
              boxShadow: '0 8px 22px -10px rgba(94,17,25,.45)',
              letterSpacing: '-0.005em',
            }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Télécharger en PDF
          </button>
        </div>
      )}
    </>
  )
}
