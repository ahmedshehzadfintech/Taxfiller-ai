'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Pending() {
  const [user, setUser] = useState(null)
  const [filing, setFiling] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      window.location.href = '/login'
      return
    }
    setUser(data.user)
    await loadFiling(data.user.id)
    setLoading(false)

    // Real time status update
    const channel = supabase
      .channel('filing-status')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'filings',
        filter: `user_id=eq.${data.user.id}`
      }, (payload) => {
        setFiling(payload.new)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  const loadFiling = async (userId) => {
    const { data } = await supabase
      .from('filings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (data) setFiling(data)
  }

  const isVerified = filing?.status === 'verified'
  const isRejected = filing?.status === 'rejected'

  if (loading) {
    return (
      <main style={{
        backgroundColor: '#0D1117',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#1DB954',
        fontFamily: 'sans-serif'
      }}>
        Loading...
      </main>
    )
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
        <div style={{ color: '#1DB954', fontSize: '1.5rem', fontWeight: 'bold' }}>
          TaxFiller AI
        </div>
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

          {/* ICON */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: '#161B22',
            border: `3px solid ${isVerified ? '#1DB954' : isRejected ? '#f85149' : '#F0883E'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            margin: '0 auto 32px',
            animation: isVerified ? 'none' : 'pulse 2s infinite'
          }}>
            {isVerified ? '✅' : isRejected ? '❌' : '⏳'}
          </div>

          {/* TITLE */}
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: isVerified ? '#1DB954' : isRejected ? '#f85149' : '#E6EDF3'
          }}>
            {isVerified
              ? 'Filing Verified!'
              : isRejected
              ? 'Filing Rejected'
              : 'Verification Pending'}
          </h1>

          <p style={{
            color: '#8B949E',
            fontSize: '1rem',
            lineHeight: '1.7',
            marginBottom: '32px'
          }}>
            {isVerified
              ? 'Mubarak ho! Aapki filing verify ho gayi. Ab Iris Filing Guide se apni return file karein!'
              : isRejected
              ? 'Aapki filing mein kuch masla tha. Chat mein admin ka message dekhen.'
              : <>
                  Aapki filing hamare expert ke paas hai۔<br />
                  <strong style={{ color: '#1DB954' }}>24-48 ghante</strong> mein review ho jaegi۔<br />
                  Update ke liye apni <strong style={{ color: '#E6EDF3' }}>chat check karte rahein</strong>۔
                </>
            }
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
            <h3 style={{ fontSize: '1rem', marginBottom: '20px', color: '#8B949E' }}>
              Filing Status
            </h3>

            {[
              { icon: '✅', label: 'Payment', status: 'Complete', color: '#1DB954' },
              { icon: '✅', label: 'AI Processing', status: 'Complete', color: '#1DB954' },
              {
                icon: isVerified ? '✅' : isRejected ? '❌' : '⏳',
                label: 'Expert Verification',
                status: isVerified ? 'Complete' : isRejected ? 'Rejected' : 'In Progress...',
                color: isVerified ? '#1DB954' : isRejected ? '#f85149' : '#F0883E'
              },
              {
                icon: isVerified ? '✅' : '⬜',
                label: 'Iris Filing Guide',
                status: isVerified ? 'Ready!' : 'Pending',
                color: isVerified ? '#1DB954' : '#8B949E'
              },
              {
                icon: '⬜',
                label: 'Filing Complete',
                status: 'Pending',
                color: '#8B949E'
              },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: i < 4 ? '16px' : '0'
              }}>
                <div style={{ fontSize: '1.2rem', flexShrink: 0 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.95rem' }}>{item.label}</span>
                    <span style={{ fontSize: '0.85rem', color: item.color }}>{item.status}</span>
                  </div>
                  {i < 4 && (
                    <div style={{ height: '1px', backgroundColor: '#21262D', marginTop: '12px' }} />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* INFO BOX */}
          {!isVerified && !isRejected && (
            <div style={{
              backgroundColor: '#161B22',
              border: '1px solid #1DB954',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '32px',
              textAlign: 'left'
            }}>
              <div style={{ color: '#1DB954', fontWeight: 'bold', marginBottom: '12px', fontSize: '0.95rem' }}>
                Update Kaise Milegi?
              </div>
              <p style={{ color: '#8B949E', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                Jab aapki filing verify ho jaegi, hamara expert aapki <strong style={{ color: '#E6EDF3' }}>chat mein seedha message karega</strong>۔
              </p>
            </div>
          )}

          {/* BUTTONS */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {isVerified && (
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
                Iris Filing Guide Shuru Karein →
              </a>
            )}
            <a href="/chat" style={{
              backgroundColor: isVerified ? 'transparent' : '#1DB954',
              color: isVerified ? '#E6EDF3' : '#000',
              border: isVerified ? '1px solid #30363D' : 'none',
              borderRadius: '10px',
              padding: '14px 28px',
              fontSize: '1rem',
              fontWeight: isVerified ? 'normal' : 'bold',
              cursor: 'pointer',
              textDecoration: 'none'
            }}>
              💬 Chat Dekhen
            </a>
            <a href="/" style={{
              backgroundColor: 'transparent',
              color: '#8B949E',
              border: '1px solid #21262D',
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
