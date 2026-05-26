'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Pending() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = '/login'
      } else {
        setUser(data.user)
      }
    })
  }, [])

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
         <a href="/iris" style={{
  backgroundColor: '#1DB954',
  color: '#000',
  border: 'none',
  borderRadius: '10px',
  padding: '14px 28px',
  fontSize: '1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  textDecoration: 'none'
}}>
  📋 Iris Filing Guide Dekhen
</a>   
        <a href="/chat" style={{
          backgroundColor: 'transparent',
          color: '#8B949E',
          border: '1px solid #30363D',
          borderRadius: '8px',
          padding: '6px 14px',
          cursor: 'pointer',
          fontSize: '0.85rem',
          textDecoration: 'none'
        }}>
          Chat Dekhen
        </a>
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
          maxWidth: '500px',
          textAlign: 'center'
        }}>

          {/* ANIMATION */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: '#161B22',
            border: '3px solid #1DB954',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            margin: '0 auto 32px',
            animation: 'pulse 2s infinite'
          }}>
            ⏳
          </div>

          {/* TITLE */}
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            marginBottom: '16px'
          }}>
            Verification Pending
          </h1>

          <p style={{
            color: '#8B949E',
            fontSize: '1rem',
            lineHeight: '1.7',
            marginBottom: '32px'
          }}>
            Aapki filing hamare expert ke paas hai۔<br />
            <strong style={{ color: '#1DB954' }}>24-48 ghante</strong> mein review ho jaegi۔<br />
            Update ke liye apni <strong style={{ color: '#E6EDF3' }}>chat check karte rahein</strong>۔
          </p>

          {/* STATUS CARD */}
          <div style={{
            backgroundColor: '#161B22',
            border: '1px solid #21262D',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <h3 style={{
              fontSize: '1rem',
              marginBottom: '20px',
              color: '#8B949E'
            }}>
              Filing Status
            </h3>

            {[
              { icon: '✅', label: 'Payment', status: 'Complete', color: '#1DB954' },
              { icon: '✅', label: 'AI Processing', status: 'Complete', color: '#1DB954' },
              { icon: '⏳', label: 'Expert Verification', status: 'In Progress...', color: '#F0883E' },
              { icon: '⬜', label: 'Iris Filing Guide', status: 'Pending', color: '#8B949E' },
              { icon: '⬜', label: 'Filing Complete', status: 'Pending', color: '#8B949E' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: i < 4 ? '16px' : '0'
              }}>
                {/* Icon */}
                <div style={{ fontSize: '1.2rem', flexShrink: 0 }}>
                  {item.icon}
                </div>

                {/* Line */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.95rem' }}>{item.label}</span>
                    <span style={{ fontSize: '0.85rem', color: item.color }}>
                      {item.status}
                    </span>
                  </div>
                  {i < 4 && (
                    <div style={{
                      height: '1px',
                      backgroundColor: '#21262D',
                      marginTop: '12px'
                    }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* INFO BOX */}
          <div style={{
            backgroundColor: '#161B22',
            border: '1px solid #1DB954',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <div style={{
              color: '#1DB954',
              fontWeight: 'bold',
              marginBottom: '12px',
              fontSize: '0.95rem'
            }}>
              📱 Update Kaise Milegi?
            </div>
            <p style={{
              color: '#8B949E',
              fontSize: '0.9rem',
              lineHeight: '1.6',
              margin: 0
            }}>
              Jab aapki filing verify ho jaegi, hamara expert aapki <strong style={{ color: '#E6EDF3' }}>chat mein seedha message karega</strong>۔ Isliye chat check karte rahein۔
            </p>
          </div>

          {/* BUTTONS */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <a href="/chat" style={{
              backgroundColor: '#1DB954',
              color: '#000',
              border: 'none',
              borderRadius: '10px',
              padding: '14px 28px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'none'
            }}>
              💬 Chat Dekhen
            </a>
            <a href="/" style={{
              backgroundColor: 'transparent',
              color: '#E6EDF3',
              border: '1px solid #30363D',
              borderRadius: '10px',
              padding: '14px 28px',
              fontSize: '1rem',
              cursor: 'pointer',
              textDecoration: 'none'
            }}>
              🏠 Home
            </a>
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

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
      `}</style>

    </main>
  )
        }
