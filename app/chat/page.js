'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [chatComplete, setChatComplete] = useState(false)
  const [filingId, setFilingId] = useState(null)
  const [filingStatus, setFilingStatus] = useState(null)
  const [showVerifiedOptions, setShowVerifiedOptions] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      window.location.href = '/login'
      return
    }
    setUser(data.user)
    await loadMessages(data.user.id)
    setPageLoading(false)

    // Filing check
    const { data: filingData } = await supabase
      .from('filings')
      .select('*')
      .eq('user_id', data.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (filingData) {
      setFilingId(filingData.id)
      setFilingStatus(filingData.status)
      if (filingData.status === 'verified') {
        setShowVerifiedOptions(true)
      }
    }

    // Admin messages real time
    const adminChannel = supabase
      .channel('admin-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'admin_messages',
        filter: `user_id=eq.${data.user.id}`
      }, (payload) => {
        setMessages(prev => [...prev, {
          id: payload.new.id,
          role: 'ai',
          message_type: 'admin',
          text: payload.new.message,
          time: new Date(payload.new.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit'
          })
        }])
      })
      .subscribe()

    // Filing status real time
    const filingChannel = supabase
      .channel('filing-status')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'filings',
        filter: `user_id=eq.${data.user.id}`
      }, (payload) => {
        setFilingStatus(payload.new.status)
        if (payload.new.status === 'verified') {
          setShowVerifiedOptions(true)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(adminChannel)
      supabase.removeChannel(filingChannel)
    }
  }

  const loadMessages = async (userId) => {
    const { data: chatData } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    const { data: adminData } = await supabase
      .from('admin_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    let allMessages = []

    if (chatData && chatData.length > 0) {
      const chatMsgs = chatData.map(msg => ({
        id: msg.id,
        role: msg.role,
        message_type: msg.role === 'user' ? 'user' : 'ai',
        text: msg.message,
        time: new Date(msg.created_at).toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit'
        }),
        createdAt: new Date(msg.created_at)
      }))
      allMessages = [...allMessages, ...chatMsgs]

      // CHAT_COMPLETE check
      const lastAiMsg = chatData.filter(m => m.role === 'ai').pop()
      if (lastAiMsg?.message?.includes('CHAT_COMPLETE')) {
        setChatComplete(true)
      }
    }

    if (adminData && adminData.length > 0) {
      const adminMsgs = adminData.map(msg => ({
        id: 'admin-' + msg.id,
        role: 'ai',
        message_type: 'admin',
        text: msg.message,
        time: new Date(msg.created_at).toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit'
        }),
        createdAt: new Date(msg.created_at)
      }))
      allMessages = [...allMessages, ...adminMsgs]
    }

    allMessages.sort((a, b) => a.createdAt - b.createdAt)

    if (allMessages.length > 0) {
      setMessages(allMessages)
    } else {
      setMessages([{
        id: 'welcome',
        role: 'ai',
        message_type: 'ai',
        text: 'Assalamu Alaikum! 👋 TaxFiller AI mein khush aamdeed!\n\nMain aapka FBR Tax Assistant hun. Aaj milkar aapki tax filing asaan kar dein ge.\n\nShuru karte hain — aapka naam aur CNIC number kya hai?',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }])
    }
  }

  const saveMessage = async (userId, role, message) => {
    await supabase.from('chat_messages').insert({
      user_id: userId,
      role: role,
      message: message,
      message_type: role === 'user' ? 'user' : 'ai'
    })
  }

  const getTime = () =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userText = input.trim()
    const userMsg = {
      id: Date.now(),
      role: 'user',
      message_type: 'user',
      text: userText,
      time: getTime()
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    await saveMessage(user.id, 'user', userText)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages
            .filter(m => m.message_type === 'user' || m.message_type === 'ai')
            .map(m => ({
              role: m.role === 'ai' ? 'model' : 'user',
              parts: [{ text: m.text }]
            }))
        })
      })

      const data = await response.json()
      const aiText = data.reply || 'Kuch masla hua — dobara try karein.'

      const isComplete = aiText.includes('CHAT_COMPLETE')
      if (isComplete) setChatComplete(true)

      const cleanText = aiText.replace('CHAT_COMPLETE', '').trim()

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        message_type: 'ai',
        text: cleanText,
        time: getTime()
      }])

      await saveMessage(user.id, 'ai', aiText)

      // Filing create karo agar complete aur pehle nahi bana
      if (isComplete && !filingId) {
        const { data: newFiling } = await supabase
          .from('filings')
          .insert({
            user_id: user.id,
            status: 'pending',
            payment_status: 'unpaid',
            chat_summary: cleanText,
            ai_summary: { raw: cleanText }
          })
          .select()
          .single()

        if (newFiling) setFilingId(newFiling.id)
      }

    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        message_type: 'ai',
        text: 'Connection mein masla hua. Dobara try karein.',
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

  const handleAdminFiling = async () => {
    if (filingId) {
      await supabase
        .from('filings')
        .update({ filing_type: 'admin_assisted', filing_amount: 3000 })
        .eq('id', filingId)
    }
    window.location.href = '/payment?type=admin_assisted'
  }

  if (pageLoading) {
    return (
      <main style={{
        backgroundColor: '#0D1117',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#1DB954',
        fontFamily: 'sans-serif',
        fontSize: '1.2rem'
      }}>
        Loading...
      </main>
    )
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
          background: 'linear-gradient(135deg, #1DB954, #158a3e)',
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
        {messages.map((msg) => {
          const isUser = msg.role === 'user'
          const isAdmin = msg.message_type === 'admin'

          return (
            <div key={msg.id} style={{
              display: 'flex',
              justifyContent: isUser ? 'flex-end' : 'flex-start',
              marginBottom: '12px'
            }}>
              {!isUser && (
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: isAdmin
                    ? 'linear-gradient(135deg, #7c3aed, #5b21b6)'
                    : 'linear-gradient(135deg, #1DB954, #158a3e)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '0.9rem',
                  marginRight: '8px', flexShrink: 0, alignSelf: 'flex-end'
                }}>
                  {isAdmin ? '👨‍💼' : '🤖'}
                </div>
              )}

              <div style={{ maxWidth: '75%' }}>
                {isAdmin && (
                  <div style={{
                    fontSize: '0.7rem',
                    color: '#a78bfa',
                    marginBottom: '4px',
                    fontWeight: 'bold',
                    paddingLeft: '4px'
                  }}>
                    ✅ TaxFiller Admin
                  </div>
                )}

                <div style={{
                  backgroundColor: isUser
                    ? '#1DB954'
                    : isAdmin ? '#1a0a3a' : '#161B22',
                  color: isUser ? '#000' : '#E6EDF3',
                  padding: '10px 14px',
                  borderRadius: isUser
                    ? '18px 18px 4px 18px'
                    : '18px 18px 18px 4px',
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  border: isAdmin
                    ? '1px solid #7c3aed'
                    : !isUser ? '1px solid #21262D' : 'none',
                  boxShadow: isAdmin ? '0 0 12px rgba(124,58,237,0.2)' : 'none'
                }}>
                  {msg.text}
                </div>

                <div style={{
                  fontSize: '0.7rem', color: '#8B949E', marginTop: '4px',
                  textAlign: isUser ? 'right' : 'left',
                  paddingLeft: !isUser ? '4px' : '0'
                }}>
                  {msg.time} {isUser && '✓✓'}
                </div>
              </div>
            </div>
          )
        })}

        {/* Loading dots */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #1DB954, #158a3e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem'
            }}>🤖</div>
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

        {/* Chat Complete Card */}
        {chatComplete && filingStatus !== 'verified' && filingStatus !== 'rejected' && (
          <div style={{
            backgroundColor: '#161B22',
            border: '1px solid #1DB954',
            borderRadius: '16px',
            padding: '20px',
            margin: '8px 0',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>✅</div>
            <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '6px' }}>
              Aapki tax information complete ho gayi!
            </div>
            <div style={{ fontSize: '0.85rem', color: '#8B949E', marginBottom: '16px' }}>
              Payment ke baad admin aapki details verify karega
            </div>
            <a href='/payment' style={{
              display: 'block',
              backgroundColor: '#1DB954',
              color: '#000',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '1rem',
              fontWeight: 'bold',
              textDecoration: 'none'
            }}>
              💳 Payment Karein — Rs. 1,500 →
            </a>
          </div>
        )}

        {/* Verified — 2 Options */}
        {showVerifiedOptions && (
          <div style={{
            backgroundColor: '#161B22',
            border: '1px solid #7c3aed',
            borderRadius: '16px',
            padding: '20px',
            margin: '8px 0'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🎉</div>
              <div style={{ fontWeight: 'bold', color: '#a78bfa', fontSize: '1rem' }}>
                Admin ne aapki details verify kar di!
              </div>
              <div style={{ fontSize: '0.85rem', color: '#8B949E', marginTop: '4px' }}>
                Aap choose karein — khud file karna hai ya admin se karwana hai?
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a href='/practice' style={{
                display: 'block',
                padding: '14px 16px',
                backgroundColor: '#1a3a2a',
                border: '1px solid #1DB954',
                borderRadius: '12px',
                textDecoration: 'none'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#1DB954' }}>
                  🧑‍💻 Khud File Karein — Free
                </div>
                <div style={{ fontSize: '0.8rem', color: '#8B949E', marginTop: '4px' }}>
                  Practice mode • Iris jaisi fields • Copy-paste guide
                </div>
              </a>

              <button
                onClick={handleAdminFiling}
                style={{
                  padding: '14px 16px',
                  backgroundColor: '#1a0a3a',
                  border: '1px solid #7c3aed',
                  borderRadius: '12px',
                  color: '#E6EDF3',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#a78bfa' }}>
                  👨‍💼 Admin Se Karwayein — Rs. 3,000
                </div>
                <div style={{ fontSize: '0.8rem', color: '#8B949E', marginTop: '4px' }}>
                  Admin khud aapki taraf se Iris pe file karega
                </div>
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={{
        backgroundColor: '#161B22', borderTop: '1px solid #21262D',
        padding: '12px 16px', display: 'flex', alignItems: 'flex-end', gap: '10px'
      }}>
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
