'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      text: 'Assalamu Alaikum! 👋 TaxFiller AI mein khush aamdeed!\n\nMain aapka AI Tax Assistant hoon. Aaj hum milkar aapki FBR tax filing asaan kar dein ge.\n\nKya aap shuru karna chahte hain? 😊',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = '/login'
      } else {
        setUser(data.user)
      }
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getTime = () =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMsg = {
      id: messages.length + 1,
      role: 'user',
      text: input.trim(),
      time: getTime()
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          history: messages.map(m => ({
            role: m.role === 'ai' ? 'model' : 'user',
            parts: [{ text: m.text }]
          }))
        })
      })

      const data = await response.json()

      setMessages(prev => [...prev, {
        id: prev.length + 1,
        role: 'ai',
        text: data.reply || 'Kuch masla hua — dobara try karein.',
        time: getTime()
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        role: 'ai',
        text: '❌ Connection mein masla hua. Dobara try karein.',
        time: getTime()
      }])
    }

    setLoading(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <main style={{
      backgroundColor: '#0D1117',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'sans-serif',
      color: '#E6EDF3'
    }}>

      {/* HEADER */}
      <div style={{
        backgroundColor: '#161B22',
        borderBottom: '1px solid #21262D',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '50%',
          backgroundColor: '#1DB954',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0
        }}>
          🤖
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>TaxFiller AI</div>
          <div style={{ color: '#1DB954', fontSize: '0.75rem' }}>● Online — FBR Tax Assistant</div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: 'transparent', color: '#8B949E',
            border: '1px solid #30363D', borderRadius: '8px',
            padding: '6px 14px', cursor: 'pointer', fontSize: '0.85rem'
          }}>
          Logout
        </button>
      </div>

      {/* DATE */}
      <div style={{ textAlign: 'center', padding: '12px' }}>
        <span style={{
          backgroundColor: '#21262D', color: '#8B949E',
          fontSize: '0.75rem', padding: '4px 12px', borderRadius: '10px'
        }}>
          Aaj
        </span>
      </div>

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: '12px'
          }}>
            {msg.role === 'ai' && (
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: '#1DB954',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '0.9rem',
                marginRight: '8px', flexShrink: 0, alignSelf: 'flex-end'
              }}>
                🤖
              </div>
            )}
            <div style={{ maxWidth: '75%' }}>
              <div style={{
                backgroundColor: msg.role === 'user' ? '#1DB954' : '#161B22',
                color: msg.role === 'user' ? '#000' : '#E6EDF3',
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap',
                border: msg.role === 'ai' ? '1px solid #21262D' : 'none'
              }}>
                {msg.text}
              </div>
              <div style={{
                fontSize: '0.7rem', color: '#8B949E', marginTop: '4px',
                textAlign: msg.role === 'user' ? 'right' : 'left',
                paddingLeft: msg.role === 'ai' ? '4px' : '0'
              }}>
                {msg.time} {msg.role === 'user' && '✓✓'}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              backgroundColor: '#1DB954',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem'
            }}>
              🤖
            </div>
            <div style={{
              backgroundColor: '#161B22', border: '1px solid #21262D',
              borderRadius: '18px 18px 18px 4px', padding: '12px 16px',
              display: 'flex', gap: '4px', alignItems: 'center'
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: '#1DB954',
                  animation: 'bounce 1.2s infinite',
                  animationDelay: `${i * 0.2}s`
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* PAYMENT BUTTON */}
      <div style={{
        padding: '8px 16px',
        backgroundColor: '#161B22',
        borderTop: '1px solid #21262D',
        textAlign: 'center'
      }}>
        <a href="/payment" style={{
          backgroundColor: '#1DB954', color: '#000',
          border: 'none', borderRadius: '8px',
          padding: '10px 24px', fontSize: '0.9rem',
          fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none'
        }}>
          Filing Submit Karein — Payment Karein →
        </a>
      </div>

      {/* INPUT */}
      <div style={{
        backgroundColor: '#161B22', borderTop: '1px solid #21262D',
        padding: '12px 16px', display: 'flex', alignItems: 'flex-end', gap: '10px'
      }}>
        <button style={{
          backgroundColor: '#21262D', border: '1px solid #30363D',
          borderRadius: '50%', width: '42px', height: '42px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: '1.1rem', flexShrink: 0
        }}>
          📎
        </button>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Message likhein..."
          rows={1}
          style={{
            flex: 1, backgroundColor: '#21262D', border: '1px solid #30363D',
            borderRadius: '20px', padding: '10px 16px', color: '#E6EDF3',
            fontSize: '0.95rem', outline: 'none', resize: 'none',
            fontFamily: 'sans-serif', lineHeight: '1.5'
          }}
        />

        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          style={{
            backgroundColor: input.trim() ? '#1DB954' : '#21262D',
            border: 'none', borderRadius: '50%',
            width: '42px', height: '42px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            fontSize: '1.1rem', flexShrink: 0
          }}>
          ➤
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>

    </main>
  )
      }
