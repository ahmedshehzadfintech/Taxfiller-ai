'use client'
import { useState } from 'react'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [language, setLanguage] = useState('Roman Urdu')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')
    
    // Abhi ke liye sirf test
    setTimeout(() => {
      setLoading(false)
      setMessage(isLogin ? 'Login kamyab! 🎉' : 'Account ban gaya! 🎉')
    }, 1500)
  }

  return (
    <main style={{
      backgroundColor: '#0D1117',
      minHeight: '100vh',
      fontFamily: 'sans-serif',
      color: '#E6EDF3',
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* NAVBAR */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        borderBottom: '1px solid #21262D'
      }}>
        <a href="/" style={{
          color: '#1DB954',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          textDecoration: 'none'
        }}>
          TaxFiller AI
        </a>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
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
      </nav>

      {/* LOGIN CARD */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <div style={{
          backgroundColor: '#161B22',
          border: '1px solid #21262D',
          borderRadius: '16px',
          padding: '40px',
          width: '100%',
          maxWidth: '420px'
        }}>

          {/* LOGO */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              color: '#1DB954',
              fontSize: '1.8rem',
              fontWeight: 'bold',
              marginBottom: '8px'
            }}>
              TaxFiller AI
            </div>
            <p style={{ color: '#8B949E', fontSize: '0.9rem' }}>
              {isLogin
                ? 'Apne account mein login karein'
                : 'Naya account banayein — bilkul free'}
            </p>
          </div>

          {/* TABS */}
          <div style={{
            display: 'flex',
            backgroundColor: '#0D1117',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '28px'
          }}>
            <button
              onClick={() => { setIsLogin(true); setMessage('') }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                backgroundColor: isLogin ? '#1DB954' : 'transparent',
                color: isLogin ? '#000' : '#8B949E',
                transition: 'all 0.2s'
              }}>
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setMessage('') }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                backgroundColor: !isLogin ? '#1DB954' : 'transparent',
                color: !isLogin ? '#000' : '#8B949E',
                transition: 'all 0.2s'
              }}>
              Signup
            </button>
          </div>

          {/* FIELDS */}
          {!isLogin && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: '#8B949E',
                fontSize: '0.85rem',
                marginBottom: '8px'
              }}>
                Aapka Naam
              </label>
              <input
                type="text"
                placeholder="Ahmed Shehzad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#0D1117',
                  border: '1px solid #30363D',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: '#E6EDF3',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: '#8B949E',
              fontSize: '0.85rem',
              marginBottom: '8px'
            }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="ahmed@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#0D1117',
                border: '1px solid #30363D',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#E6EDF3',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#8B949E',
              fontSize: '0.85rem',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#0D1117',
                border: '1px solid #30363D',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#E6EDF3',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* MESSAGE */}
          {message && (
            <div style={{
              backgroundColor: message.includes('🎉') ? '#1a3a2a' : '#3a1a1a',
              border: `1px solid ${message.includes('🎉') ? '#1DB954' : '#f85149'}`,
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              color: message.includes('🎉') ? '#1DB954' : '#f85149',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}

          {/* BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#158a3e' : '#1DB954',
              color: '#000',
              border: 'none',
              borderRadius: '10px',
              padding: '14px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '20px'
            }}>
            {loading ? 'Thoda wait karein...' : isLogin ? 'Login Karein →' : 'Account Banayein →'}
          </button>

          {/* DIVIDER */}
          <div style={{
            textAlign: 'center',
            color: '#8B949E',
            fontSize: '0.85rem',
            marginBottom: '20px'
          }}>
            {isLogin ? 'Abhi account nahi hai?' : 'Pehle se account hai?'}
            <span
              onClick={() => { setIsLogin(!isLogin); setMessage('') }}
              style={{
                color: '#1DB954',
                cursor: 'pointer',
                marginLeft: '6px',
                fontWeight: 'bold'
              }}>
              {isLogin ? 'Signup karein' : 'Login karein'}
            </span>
          </div>

          {/* SECURITY NOTE */}
          <div style={{
            textAlign: 'center',
            color: '#8B949E',
            fontSize: '0.8rem',
            borderTop: '1px solid #21262D',
            paddingTop: '16px'
          }}>
            🔒 Aapka data banking level encryption se secure hai
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid #21262D',
        padding: '16px 40px',
        textAlign: 'center',
        color: '#8B949E',
        fontSize: '0.8rem'
      }}>
        © 2026 TaxFiller AI — Ahmed Shehzad Tax AI | Pakistan
      </footer>

    </main>
  )
}
