export default function Home() {
  return (
    <main className="site-root">
      <div className="container">
        {/* NAV */}
        <header className="site-nav" style={{borderBottom: '1px solid rgba(7,16,34,0.04)'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div className="card brand" style={{padding:'8px 12px',borderRadius:10}}>Taxfiller.ai</div>
          </div>
          <div className="nav-actions">
            <select style={{padding:'8px 12px',borderRadius:8,border:'1px solid rgba(7,16,34,0.06)'}}>
              <option>Roman Urdu</option>
              <option>English</option>
              <option>اردو</option>
            </select>
            <a href="/login" className="btn btn--outline" style={{padding:'8px 16px',textDecoration:'none'}}>Login</a>
            <a href="/login" className="btn btn--accent" style={{textDecoration:'none'}}>Shuru Karein</a>
          </div>
        </header>

        {/* HERO */}
        <section className="hero">
          <div className="hero-left">
            <div style={{display:'inline-block',padding:'6px 16px',borderRadius:20,marginBottom:16,background:'#f6fbff',border:'1px solid rgba(7,16,34,0.03)'}}>🇵🇰 Pakistan Ka #1 AI Tax Assistant</div>

            <h1 className="h1">
              FBR Tax Filing <span className="gradient-text">Asaan</span>, Secure, AI Powered
            </h1>

            <p className="lead" style={{maxWidth:520}}>
              CA ki zaroorat nahi — hamara AI aapko step by step guide karega. Bilkul WhatsApp jaisi baat karo, tax file karo!
            </p>

            <div style={{marginTop:16}}>
              <a href="/login" className="btn btn--accent" style={{textDecoration:'none'}}>Abhi Shuru Karein →</a>
              <a href="#features" className="btn btn--outline gradient-border" style={{marginLeft:12,textDecoration:'none'}}>Aur Janein</a>
            </div>

            <div className="docs" style={{marginTop:24}}>
              <div className="doc">Quickstart <span className="accent">→</span></div>
              <div className="doc">API Reference <span className="accent">→</span></div>
            </div>
          </div>

          <div className="hero-right">
            <div className="card" style={{width:340,height:220,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{color:'var(--muted)'}}>Preview / Illustration</div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" style={{padding:'40px 0',maxWidth:1000,margin:'0 auto'}}>
          <h2 style={{textAlign:'center',fontSize:'1.6rem',marginBottom:24}}>
            Kyun <span className="gradient-text">TaxFiller AI</span>?
          </h2>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:20}}>
            {[
              { icon: '🤖', title: 'AI Powered', desc: 'Gemini AI aapke saath baat kare ga, sawaal poochhe ga' },
              { icon: '✅', title: 'Human Verified', desc: 'Har filing expert se verify hoti hai' },
              { icon: '🔒', title: 'Secure', desc: 'Banking level encryption — data safe' },
              { icon: '⚡', title: 'Fast', desc: '24-48 ghante mein filing complete' },
              { icon: '📱', title: 'Mobile Friendly', desc: 'Phone par bhi asaani se use karo' },
              { icon: '💰', title: 'Sasta', desc: 'CA se kam fee — per filing charge' },
            ].map((f, i) => (
              <div key={i} className="card" style={{textAlign:'center',padding:24}}>
                <div style={{fontSize:'1.8rem',marginBottom:12}}>{f.icon}</div>
                <h3 style={{marginBottom:8}}>{f.title}</h3>
                <p style={{color:'var(--muted)'}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="site-footer">
          © 2026 TaxFiller AI — Ahmed Shehzad Tax AI | Pakistan
        </footer>
      </div>
    </main>
  )
}
