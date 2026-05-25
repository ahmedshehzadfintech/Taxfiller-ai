export default function Home() {
  return (
    <main style={{
      backgroundColor: '#0D1117',
      minHeight: '100vh',
      fontFamily: 'sans-serif',
      color: '#E6EDF3'
    }}>

      {/* NAVBAR */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        borderBottom: '1px solid #21262D'
      }}>
        <div style={{ color: '#1DB954', fontSize: '1.5rem', fontWeight: 'bold' }}>
          TaxFiller AI
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select style={{
            backgroundColor: '#21262D',
            color: '#E6EDF3',
            border: '1px solid #30363D',
            borderRadius: '8px',
            padding: '8px 12px',
            cursor: 'pointer'
          }}>
            <option>Roman Urdu</option>
            <option>English</option>
            <option>اردو</option>
          </select>
          <a href="/login" style={{
            backgroundColor: 'transparent',
            color: '#E6EDF3',
            border: '1px solid #30363D',
            borderRadius: '8px',
            padding: '8px 20px',
            cursor: 'pointer',
            textDecoration: 'none'
          }}>
            Login
          </a>
          <a href="/login" style={{
            backgroundColor: '#1DB954',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 20px',
            cursor: 'pointer',
            fontWeight: 'bold',
            textDecoration: 'none'
          }}>
            Shuru Karein
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{
        textAlign: 'center',
        padding: '80px 20px 60px'
      }}>
        <div style={{
          display: 'inline-block',
          backgroundColor: '#21262D',
          color: '#1DB954',
          padding: '6px 16px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          marginBottom: '24px',
          border: '1px solid #1DB954'
        }}>
          🇵🇰 Pakistan Ka #1 AI Tax Assistant
        </div>

        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          lineHeight: '1.2',
          marginBottom: '20px',
          maxWidth: '700px',
          margin: '0 auto 20px'
        }}>
          FBR Tax Filing{' '}
          <span style={{ color: '#1DB954' }}>Asaan</span>,{' '}
          Secure, AI Powered
        </h1>

        <p style={{
          color: '#8B949E',
          fontSize: '1.1rem',
          maxWidth: '500px',
          margin: '0 auto 40px',
          lineHeight: '1.6'
        }}>
          CA ki zaroorat nahi — hamara AI aapko step by step guide karega.
          Bilkul WhatsApp jaisi baat karo, tax file karo!
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/login" style={{
            backgroundColor: '#1DB954',
            color: '#000',
            border: 'none',
            borderRadius: '10px',
            padding: '14px 32px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            textDecoration: 'none'
          }}>
            Abhi Shuru Karein →
          </a>
          <a href="#features" style={{
            backgroundColor: 'transparent',
            color: '#E6EDF3',
            border: '1px solid #30363D',
            borderRadius: '10px',
            padding: '14px 32px',
            fontSize: '1rem',
            cursor: 'pointer',
            textDecoration: 'none'
          }}>
            Aur Janein
          </a>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{
        padding: '60px 40px',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '1.8rem',
          marginBottom: '40px'
        }}>
          Kyun <span style={{ color: '#1DB954' }}>TaxFiller AI</span>?
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          {[
            { icon: '🤖', title: 'AI Powered', desc: 'Gemini AI aapke saath baat kare ga, sawaal poochhe ga' },
            { icon: '✅', title: 'Human Verified', desc: 'Har filing expert se verify hoti hai' },
            { icon: '🔒', title: 'Secure', desc: 'Banking level encryption — data safe' },
            { icon: '⚡', title: 'Fast', desc: '24-48 ghante mein filing complete' },
            { icon: '📱', title: 'Mobile Friendly', desc: 'Phone par bhi asaani se use karo' },
            { icon: '💰', title: 'Sasta', desc: 'CA se kam fee — per filing charge' },
          ].map((f, i) => (
            <div key={i} style={{
              backgroundColor: '#161B22',
              border: '1px solid #21262D',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{f.icon}</div>
              <h3 style={{ color: '#1DB954', marginBottom: '8px', fontSize: '1rem' }}>{f.title}</h3>
              <p style={{ color: '#8B949E', fontSize: '0.9rem', lineHeight: '1.5' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{
        padding: '60px 40px',
        backgroundColor: '#161B22',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '40px' }}>
          Kaise Kaam Karta Hai?
        </h2>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {[
            { step: '1', title: 'Chat Karo', desc: 'AI se baat karo, documents upload karo' },
            { step: '2', title: 'AI Process Kare', desc: 'Tax calculate ho, report bane' },
            { step: '3', title: 'Verify Ho', desc: 'Expert check kare — sure kare' },
            { step: '4', title: 'File Karo', desc: 'Step by step Iris par fill karo' },
          ].map((s, i) => (
            <div key={i} style={{
              backgroundColor: '#0D1117',
              border: '1px solid #21262D',
              borderRadius: '12px',
              padding: '24px',
              width: '180px'
            }}>
              <div style={{
                backgroundColor: '#1DB954',
                color: '#000',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                margin: '0 auto 12px'
              }}>{s.step}</div>
              <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>{s.title}</h3>
              <p style={{ color: '#8B949E', fontSize: '0.85rem' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        textAlign: 'center',
        padding: '80px 20px'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>
          Tayaar Hain? <span style={{ color: '#1DB954' }}>Abhi Shuru Karein!</span>
        </h2>
        <p style={{ color: '#8B949E', marginBottom: '32px' }}>
          Hazaron Pakistanion ka trust — aap bhi try karein
        </p>
        <a href="/login" style={{
          backgroundColor: '#1DB954',
          color: '#000',
          border: 'none',
          borderRadius: '10px',
          padding: '16px 40px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          textDecoration: 'none'
        }}>
          Free Mein Shuru Karein →
        </a>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid #21262D',
        padding: '24px 40px',
        textAlign: 'center',
        color: '#8B949E',
        fontSize: '0.85rem'
      }}>
        © 2026 TaxFiller AI — Ahmed Shehzad Tax AI | Pakistan
      </footer>

    </main>
  )
              }
