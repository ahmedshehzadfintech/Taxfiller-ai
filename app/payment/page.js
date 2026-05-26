'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Payment() {
  const [user, setUser] = useState(null)
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  // JazzCash fields
  const [jazzNumber, setJazzNumber] = useState('')

  // Easypaisa fields
  const [easyNumber, setEasyNumber] = useState('')

  // Card fields
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = '/login'
      } else {
        setUser(data.user)
      }
    })
  }, [])

  const formatCardNumber = (val) => {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (val) => {
    return val.replace(/\D/g, '').slice(0, 4).replace(/(.{2})/, '$1/')
  }

  const handlePayment = async () => {
    setMessage({ text: '', type: '' })

    if (!selected) {
      setMessage({ text: '⚠️ Pehle payment method select karein!', type: 'error' })
      return
    }

    if (selected === 'jazzcash' && jazzNumber.length < 11) {
      setMessage({ text: '⚠️ Sahi JazzCash number daalo!', type: 'error' })
      return
    }

    if (selected === 'easypaisa' && easyNumber.length < 11) {
      setMessage({ text: '⚠️ Sahi Easypaisa number daalo!', type: 'error' })
      return
    }

    if (selected === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setMessage({ text: '⚠️ Sahi card number daalo!', type: 'error' })
        return
      }
      if (!cardName) {
        setMessage({ text: '⚠️ Card par naam likho!', type: 'error' })
        return
      }
      if (cardExpiry.length < 5) {
        setMessage({ text: '⚠️ Sahi expiry date daalo!', type: 'error' })
        return
      }
      if (cardCvv.length < 3) {
        setMessage({ text: '⚠️ Sahi CVV daalo!', type: 'error' })
        return
      }
    }

    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      window.location.href = '/pending'
    }, 2000)
  }

  const inputStyle = {
    width: '100%',
    backgroundColor: '#0D1117',
    border: '1px solid #30363D',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#E6EDF3',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    marginTop: '8px'
  }

  const labelStyle = {
    color: '#8B949E',
    fontSize: '0.85rem',
    display: 'block',
    marginTop: '12px'
  }

  const methods = [
    { id: 'jazzcash', name: 'JazzCash', icon: '🟠', color: '#FF6B00' },
    { id: 'easypaisa', name: 'Easypaisa', icon: '🟢', color: '#4CAF50' },
    { id: 'card', name: 'Debit / Credit Card', icon: '💳', color: '#58A6FF' },
  ]

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
        <div style={{ color: '#1DB954', fontSize: '1.5rem', fontWeight: 'bold' }}>
          TaxFiller AI
        </div>
        <div style={{ color: '#8B949E', fontSize: '0.9rem' }}>
          🔒 Secure Payment
        </div>
      </nav>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <div style={{ width: '100%', maxWidth: '480px' }}>

          {/* HEADER */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💰</div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '8px' }}>
              Filing Fee
            </h1>
            <p style={{ color: '#8B949E', fontSize: '0.95rem' }}>
              Payment ke baad aapki filing expert ke paas verify hogi
            </p>
          </div>

          {/* PRICE CARD */}
          <div style={{
            backgroundColor: '#161B22',
            border: '1px solid #1DB954',
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <div style={{ color: '#8B949E', fontSize: '0.9rem', marginBottom: '8px' }}>
              Total Amount
            </div>
            <div style={{ color: '#1DB954', fontSize: '2.8rem', fontWeight: 'bold', marginBottom: '4px' }}>
              Rs. 1,500
            </div>
            <div style={{ color: '#8B949E', fontSize: '0.85rem' }}>
              Salary Tax Filing — FBR 2025-26
            </div>

            <div style={{
              marginTop: '20px',
              borderTop: '1px solid #21262D',
              paddingTop: '16px',
              textAlign: 'left'
            }}>
              {[
                '✅ AI Tax Calculation',
                '✅ Expert Human Verification',
                '✅ Step-by-step Iris Filing Guide',
                '✅ PDF Report Generation',
                '✅ Support via Chat',
              ].map((item, i) => (
                <div key={i} style={{ color: '#E6EDF3', fontSize: '0.9rem', marginBottom: '8px' }}>
                  {item}
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '16px',
              backgroundColor: '#0D1117',
              borderRadius: '8px',
              padding: '10px',
              color: '#8B949E',
              fontSize: '0.8rem'
            }}>
              🛡️ Kaam na hua to full refund — hamari guarantee!
            </div>
          </div>

          {/* PAYMENT METHODS */}
          <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: '#8B949E' }}>
            Payment Method Select Karein:
          </h3>

          {methods.map((method) => (
            <div key={method.id}>
              <div
                onClick={() => { setSelected(method.id); setMessage({ text: '', type: '' }) }}
                style={{
                  backgroundColor: selected === method.id ? '#161B22' : '#0D1117',
                  border: `2px solid ${selected === method.id ? method.color : '#21262D'}`,
                  borderRadius: selected === method.id ? '12px 12px 0 0' : '12px',
                  padding: '16px 20px',
                  marginBottom: selected === method.id ? '0' : '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  border: `2px solid ${selected === method.id ? method.color : '#8B949E'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {selected === method.id && (
                    <div style={{
                      width: '10px', height: '10px',
                      borderRadius: '50%', backgroundColor: method.color
                    }} />
                  )}
                </div>
                <div style={{ fontSize: '1.8rem' }}>{method.icon}</div>
                <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{method.name}</div>
              </div>

              {/* JAZZCASH FIELDS */}
              {selected === 'jazzcash' && method.id === 'jazzcash' && (
                <div style={{
                  backgroundColor: '#161B22',
                  border: '2px solid #FF6B00',
                  borderTop: 'none',
                  borderRadius: '0 0 12px 12px',
                  padding: '16px 20px',
                  marginBottom: '12px'
                }}>
                  <label style={labelStyle}>JazzCash Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="03XX-XXXXXXX"
                    maxLength={11}
                    value={jazzNumber}
                    onChange={(e) => setJazzNumber(e.target.value.replace(/\D/g, ''))}
                    style={inputStyle}
                  />
                  <p style={{ color: '#8B949E', fontSize: '0.8rem', marginTop: '8px' }}>
                    📱 Aapke JazzCash number par payment request aayegi
                  </p>
                </div>
              )}

              {/* EASYPAISA FIELDS */}
              {selected === 'easypaisa' && method.id === 'easypaisa' && (
                <div style={{
                  backgroundColor: '#161B22',
                  border: '2px solid #4CAF50',
                  borderTop: 'none',
                  borderRadius: '0 0 12px 12px',
                  padding: '16px 20px',
                  marginBottom: '12px'
                }}>
                  <label style={labelStyle}>Easypaisa Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="03XX-XXXXXXX"
                    maxLength={11}
                    value={easyNumber}
                    onChange={(e) => setEasyNumber(e.target.value.replace(/\D/g, ''))}
                    style={inputStyle}
                  />
                  <p style={{ color: '#8B949E', fontSize: '0.8rem', marginTop: '8px' }}>
                    📱 Aapke Easypaisa number par payment request aayegi
                  </p>
                </div>
              )}

              {/* CARD FIELDS */}
              {selected === 'card' && method.id === 'card' && (
                <div style={{
                  backgroundColor: '#161B22',
                  border: '2px solid #58A6FF',
                  borderTop: 'none',
                  borderRadius: '0 0 12px 12px',
                  padding: '16px 20px',
                  marginBottom: '12px'
                }}>
                  <label style={labelStyle}>Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    style={inputStyle}
                  />

                  <label style={labelStyle}>Card Par Naam</label>
                  <input
                    type="text"
                    placeholder="Ahmed Shehzad"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    style={inputStyle}
                  />

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <p style={{ color: '#8B949E', fontSize: '0.8rem', marginTop: '8px' }}>
                    🔒 Aapka card data secure hai — kabhi save nahi hoga
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* MESSAGE */}
          {message.text && (
            <div style={{
              backgroundColor: '#3a1a1a',
              border: '1px solid #f85149',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              color: '#f85149',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}>
              {message.text}
            </div>
          )}

          {/* PAY BUTTON */}
          <button
            onClick={handlePayment}
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#158a3e' : '#1DB954',
              color: '#000',
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
              marginBottom: '16px'
            }}>
            {loading ? '⏳ Processing...' : 'Rs. 1,500 — Abhi Pay Karein →'}
          </button>

          <div style={{ textAlign: 'center', color: '#8B949E', fontSize: '0.8rem' }}>
            🔒 256-bit SSL encryption — aapka data bilkul safe hai
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
