const ISP = {
  burgundy: '#5E1119',
  ochre: '#EEA300',
  ink: '#1A1410',
  paper: '#F4EDE0',
  rule: '#E2D8C2',
  muted: '#7A6A55',
}

export default function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${ISP.burgundy}`, background: ISP.burgundy, padding: '32px 44px', marginTop: 48 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr) minmax(0,1fr)', gap: 32 }}>

        {/* Colonne 1 — Brand */}
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: ISP.ochre, letterSpacing: '-0.01em', marginBottom: 8 }}>·ispalis·</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: 280 }}>
            "L'ingénerie au service de votre table". Accords mets-boissons générés en temps réel, adaptés à votre cave et à votre cuisine.
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
            © {new Date().getFullYear()} Ispalis — Tous droits réservés
          </div>
        </div>

        {/* Colonne 2 — Contact */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>Contact</div>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
            <a href="mailto:camille@ispalis.com" style={{ fontSize: 13, color: ISP.ochre, textDecoration: 'none', fontWeight: 600 }}>
              camille@ispalis.com
            </a>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>0374099327</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Lille — Bordeaux</span>
            <a href="https://ispalis.com" style={{ fontSize: 13, color: ISP.ochre, textDecoration: 'none', fontWeight: 600 }}>
              ispalis.com
            </a>
          </div>
        </div>

        {/* Colonne 3 — Légal */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>Légal</div>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>SAS Ispalis</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>SIRET : 919 434 357</span>
            <a href="/mentions-legales" style={{ fontSize: 13, color: ISP.ochre, textDecoration: 'none', fontWeight: 600 }}>
              Mentions légales
            </a>
            <a href="/politique-confidentialite" style={{ fontSize: 13, color: ISP.ochre, textDecoration: 'none', fontWeight: 600 }}>
              Politique de confidentialité
            </a>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4, lineHeight: 1.5 }}>
              Hébergé par Vercel Inc.<br />340 Pine Street, San Francisco, CA
            </span>
          </div>
        </div>

      </div>
    </footer>
  )
}
