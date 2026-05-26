'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Payment() {
  const [user, setUser] = useState(null)
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = '/login'
      } else {
        setUser(data.user)
      }
    })
  }, [])

  const methods = [
    {
      id: 'jazzcash',
      name: 'JazzCash',
      icon: '🟠',
      desc: 'JazzCash account ya mobile number se pay karein',
      color: '#FF6B00'
    },
    {
      id: 'easypaisa',
      name: 'Easypaisa',
      icon: '🟢',
      desc: 'Easypaisa account ya mobile number se pay karein',
      color: '#4CAF50'
    },
    {
      id: 'card',
      name: 'Debit / Credit Card',
      icon: '💳',
      desc: 'Visa, Mastercard — koi bhi card chalega',
      color: '#58A6FF'
    },
  ]

  const handlePayment = async () => {
    if (!selected) {
      setMessage({ text: '⚠️ Pehle payment method select karein!', type: 'error' })
      return
    }
    setLoading(true)
    setMessage({ text: '', type: '' })

    // Abhi ke liye simulate — baad mein real API lagegi
    setTimeout(() => {
      setLoading(false)
      window.location.href = '/pending'
    }, 2000)
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
        <div style={{
          color: '#1DB954',
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>
          TaxFiller AI
        </div>
        <div style={{ color: '#8B949E', fontSize: '0.9rem' }}>
          🔒 Secure Payment
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '480px'
        }}>

          {/* HEADER */}
          <div style={{
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💰</div>
            <h1 style={{
              fontSize: '1.6rem',
              fontWeight: 'bold',
              marginBottom: '8px'
            }}>
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
            <div style={{
              color: '#8B949E',
              fontSize: '0.9rem',
              marginBottom: '8px'
            }}>
              Total Amount
            </div>
            <div style={{
              color: '#1DB954',
              fontSize: '2.8rem',
              fontWeight: 'bold',
              marginBottom: '8px'
            }}>
              Rs. 1,500
            </div>
            <div style={{
              color: '#8B949E',
              fontSize: '0.85rem'
            }}>
              Salary Tax Filing — FBR 2024-25
            </div>

            {/* WHAT YOU GET */}
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
                <div key={i} style={{
                  color: '#E6EDF3',
                  fontSize: '0.9rem',
                  marginBottom: '8px'
                }}>
                  {item}
                </div>
              ))}
            </div>

            {/* REFUND NOTE */}
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
          <h3 style={{
            fontSize: '1rem',
            marginBottom: '16px',
            color: '#8B949E'
          }}>
            Payment Method Select Karein:
          </h3>

          {methods.map((method) => (
            <div
              key={method.id}
              onClick={() => setSelected(method.id)}
              style={{
                backgroundColor: selected === method.id ? '#161B22' : '#0D1117',
                border: `2px solid ${selected === method.id ? method.color : '#21262D'}`,
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'all 0.2s'
              }}>

              {/* Radio */}
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: `2px solid ${selected === method.id ? method.color : '#8B949E'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {selected === method.id && (
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: method.color
                  }} />
                )}
              </div>

              {/* Icon */}
              <div style={{ fontSize: '1.8rem' }}>{method.icon}</div>

              {/* Info */}
              <div>
                <div style={{
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  marginBottom: '4px'
                }}>
                  {method.name}
                </div>
                <div style={{
                  color: '#8B949E',
                  fontSize: '0.8rem'
                }}>
                  {method.desc}
                </div>
              </div>
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
            {loading ? '⏳ Processing...' : `Rs. 1,500 — Abhi Pay Karein →`}
          </button>

          {/* SECURITY */}
          <div style={{
            textAlign: 'center',
            color: '#8B949E',
            fontSize: '0.8rem'
          }}>
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
