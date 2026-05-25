'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [language, setLanguage] = useState('Roman Urdu')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // ── VALIDATION ──────────────────────────────────────────
  const validate = () => {
    if (!email || !password) {
      setMessage({ text: '⚠️ Email aur password zaroori hai!', type: 'error' })
      return false
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage({ text: '⚠️ Sahi email likho!', type: 'error' })
      return false
    }
    if (password.length < 6) {
      setMessage({ text: '⚠️ Password kam az kam 6 characters ka hona chahiye!', type: 'error' })
      return false
    }
    if (!isLogin) {
      if (!name) {
        setMessage({ text: '⚠️ Apna naam likho!', type: 'error' })
        return false
      }
      if (password !== confirmPassword) {
        setMessage({ text: '⚠️ Dono passwords match nahi kar rahe!', type: 'error' })
        return false
      }
    }
    return true
  }

  // ── SUBMIT ───────────────────────────────────────────────
  const handleSubmit = async () => {
    setMessage({ text: '', type: '' })
    if (!validate()) return

    setLoading(true)

    try {
      if (isLogin) {
        // LOGIN
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        setMessage({ text: '✅ Login kamyab! Redirect ho raha hai...', type: 'success' })
        setTimeout(() => {
          window.location.href = '/chat'
        }, 1500)

      } else {
        // SIGNUP
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name }
          }
        })
        if (error) throw error
        setMessage({ text: '🎉 Account ban gaya! Ab login karein.', type: 'success' })
        setTimeout(() => {
          setIsLogin(true)
          setPassword('')
          setConfirmPassword('')
        }, 2000)
      }
    } catch (error) {
      const msgs = {
        'Invalid login credentials': '❌ Email ya password galat hai!',
        'User already registered': '❌ Ye email pehle se registered hai!',
        'Password should be at least 6 characters': '❌ Password 6 characters ka hona chahiye!',
      }
      setMessage({
        text: msgs[error.message] || '❌ Kuch masla hua: ' + error.message,
        type: 'error'
      })
    }
    setLoading(false)
  }

  // ── STYLES ───────────────────────────────────────────────
  const inputStyle = {
    width: '100%',
    backgroundColor: '#0D1117',
    border: '1px solid #30363D',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#E6EDF3',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box'
  }

  const labelStyle = {
    display: 'block',
    color: '#8B949E',
    fontSize: '0.85rem',
    marginBottom: '8px'
  }

  const eyeStyle = {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#8B949E',
    fontSize: '1.1rem',
    userSelect: 'none'
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

      {/* CARD */}
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
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
            marginBottom: '24px'
          }}>
            {['Login', 'Signup'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setIsLogin(tab === 'Login')
                  setMessage({ text: '', type: '' })
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  backgroundColor:
                    (tab === 'Login') === isLogin ? '#1DB954' : 'transparent',
                  color:
                    (tab === 'Login') === isLogin ? '#000' : '#8B949E'
                }}>
                {tab}
              </button>
            ))}
          </div>

          {/* NAME — signup only */}
          {!isLogin && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Aapka Naam</label>
              <input
                type="text"
                placeholder="Ahmed Shehzad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}

          {/* EMAIL */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              placeholder="ahmed@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* PASSWORD */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...inputStyle, paddingRight: '44px' }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={eyeStyle}>
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>
          </div>

          {/* CONFIRM PASSWORD — signup only */}
          {!isLogin && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Password Dobara Likho</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '44px' }}
                />
                <span
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={eyeStyle}>
                  {showConfirm ? '🙈' : '👁️'}
                </span>
              </div>
              {/* password match indicator */}
              {confirmPassword && (
                <p style={{
                  fontSize: '0.8rem',
                  marginTop: '6px',
                  color: password === confirmPassword ? '#1DB954' : '#f85149'
                }}>
                  {password === confirmPassword
                    ? '✅ Passwords match kar rahe hain!'
                    : '❌ Passwords match nahi kar rahe!'}
                </p>
              )}
            </div>
          )}

          {/* MESSAGE BOX */}
          {message.text && (
            <div style={{
              backgroundColor: message.type === 'success' ? '#1a3a2a' : '#3a1a1a',
              border: `1px solid ${message.type === 'success' ? '#1DB954' : '#f85149'}`,
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              color: message.type === 'success' ? '#1DB954' : '#f85149',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}>
              {message.text}
            </div>
          )}

          {/* SUBMIT BUTTON */}
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
            {loading
              ? '⏳ Thoda wait karein...'
              : isLogin ? 'Login Karein →' : 'Account Banayein →'}
          </button>

          {/* SWITCH */}
          <div style={{
            textAlign: 'center',
            color: '#8B949E',
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}>
            {isLogin ? 'Abhi account nahi hai?' : 'Pehle se account hai?'}
            <span
              onClick={() => {
                setIsLogin(!isLogin)
                setMessage({ text: '', type: '' })
              }}
              style={{
                color: '#1DB954',
                cursor: 'pointer',
                marginLeft: '6px',
                fontWeight: 'bold'
              }}>
              {isLogin ? 'Signup karein' : 'Login karein'}
            </span>
          </div>

          {/* SECURITY */}
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
