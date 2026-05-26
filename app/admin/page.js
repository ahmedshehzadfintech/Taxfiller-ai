'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminPanel() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [filings, setFilings] = useState([])
  const [selectedFiling, setSelectedFiling] = useState(null)
  const [adminMessage, setAdminMessage] = useState('')
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    total: 0,
    revenue: 0
  })

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      window.location.href = '/login'
      return
    }
    const role = data.user.user_metadata?.role
    if (role !== 'admin') {
      window.location.href = '/'
      return
    }
    setUser(data.user)
    loadFilings()
    setLoading(false)
  }

  const loadFilings = async () => {
    const { data, error } = await supabase
      .from('filings')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setFilings(data)
      setStats({
        pending: data.filter(f => f.status === 'pending').length,
        verified: data.filter(f => f.status === 'verified').length,
        total: data.length,
        revenue: data.filter(f => f.payment_status === 'paid').length * 1500
      })
    }
  }

  const updateStatus = async (filingId, status) => {
    await supabase
      .from('filings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', filingId)
    loadFilings()
    if (selectedFiling?.id === filingId) {
      setSelectedFiling(prev => ({ ...prev, status }))
    }
  }

  const sendMessage = async () => {
    if (!adminMessage.trim() || !selectedFiling) return
    await supabase.from('admin_messages').insert({
      filing_id: selectedFiling.id,
      user_id: selectedFiling.user_id,
      sender: 'admin',
      message: adminMessage.trim()
    })
    setAdminMessage('')
    alert('Message bhej diya gaya! ✅')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const getStatusColor = (status) => {
    if (status === 'pending') return '#F0883E'
    if (status === 'verified') return '#1DB954'
    if (status === 'rejected') return '#f85149'
    return '#8B949E'
  }

  const getStatusLabel = (status) => {
    if (status === 'pending') return '⏳ Pending'
    if (status === 'verified') return '✅ Verified'
    if (status === 'rejected') return '❌ Rejected'
    return status
  }

  if (loading) {
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
        ⏳ Loading Admin Panel...
      </main>
    )
  }

  return (
    <main style={{
      backgroundColor: '#0D1117',
      minHeight: '100vh',
      fontFamily: 'sans-serif',
      color: '#E6EDF3'
    }}>

      {/* NAVBAR */}
      <nav style={{
        backgroundColor: '#161B22',
        borderBottom: '1px solid #21262D',
        padding: '14px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: '#1DB954', fontSize: '1.3rem', fontWeight: 'bold' }}>
            TaxFiller AI
          </div>
          <span style={{
            backgroundColor: '#1DB954',
            color: '#000',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            padding: '2px 8px',
            borderRadius: '10px'
          }}>
            ADMIN
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#8B949E', fontSize: '0.85rem' }}>
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'transparent',
              color: '#f85149',
              border: '1px solid #f85149',
              borderRadius: '8px',
              padding: '6px 14px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}>
            Logout
          </button>
        </div>
      </nav>

      {/* TABS */}
      <div style={{
        backgroundColor: '#161B22',
        borderBottom: '1px solid #21262D',
        padding: '0 24px',
        display: 'flex',
        gap: '4px'
      }}>
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'filings', label: '📋 Filings' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              backgroundColor: 'transparent',
              color: activeTab === tab.id ? '#1DB954' : '#8B949E',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #1DB954' : '2px solid transparent',
              padding: '14px 20px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal'
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '24px' }}>
              Dashboard
            </h2>

            {/* STATS */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}>
              {[
                { label: 'Total Filings', value: stats.total, icon: '📋', color: '#58A6FF' },
                { label: 'Pending', value: stats.pending, icon: '⏳', color: '#F0883E' },
                { label: 'Verified', value: stats.verified, icon: '✅', color: '#1DB954' },
                { label: 'Total Revenue', value: `Rs. ${stats.revenue.toLocaleString()}`, icon: '💰', color: '#1DB954' },
              ].map((stat, i) => (
                <div key={i} style={{
                  backgroundColor: '#161B22',
                  border: '1px solid #21262D',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ color: stat.color, fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '4px' }}>
                    {stat.value}
                  </div>
                  <div style={{ color: '#8B949E', fontSize: '0.85rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* RECENT FILINGS */}
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#8B949E' }}>
              Recent Filings
            </h3>
            {filings.length === 0 ? (
              <div style={{
                backgroundColor: '#161B22',
                border: '1px solid #21262D',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
                color: '#8B949E'
              }}>
                Abhi koi filing nahi hai
              </div>
            ) : (
              filings.slice(0, 5).map(filing => (
                <div
                  key={filing.id}
                  onClick={() => { setSelectedFiling(filing); setActiveTab('filings') }}
                  style={{
                    backgroundColor: '#161B22',
                    border: '1px solid #21262D',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    marginBottom: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      Filing #{filing.id.slice(0, 8)}
                    </div>
                    <div style={{ color: '#8B949E', fontSize: '0.85rem' }}>
                      {new Date(filing.created_at).toLocaleDateString('en-PK')}
                    </div>
                  </div>
                  <span style={{
                    color: getStatusColor(filing.status),
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                  }}>
                    {getStatusLabel(filing.status)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* FILINGS TAB */}
        {activeTab === 'filings' && (
          <div style={{ display: 'grid', gridTemplateColumns: selectedFiling ? '1fr 1fr' : '1fr', gap: '24px' }}>

            {/* FILING LIST */}
            <div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>
                Sab Filings ({filings.length})
              </h2>

              {filings.length === 0 ? (
                <div style={{
                  backgroundColor: '#161B22',
                  border: '1px solid #21262D',
                  borderRadius: '12px',
                  padding: '40px',
                  textAlign: 'center',
                  color: '#8B949E'
                }}>
                  Abhi koi filing nahi hai
                </div>
              ) : (
                filings.map(filing => (
                  <div
                    key={filing.id}
                    onClick={() => setSelectedFiling(filing)}
                    style={{
                      backgroundColor: selectedFiling?.id === filing.id ? '#1a3a2a' : '#161B22',
                      border: `1px solid ${selectedFiling?.id === filing.id ? '#1DB954' : '#21262D'}`,
                      borderRadius: '12px',
                      padding: '16px 20px',
                      marginBottom: '12px',
                      cursor: 'pointer'
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                        #{filing.id.slice(0, 8)}
                      </span>
                      <span style={{ color: getStatusColor(filing.status), fontSize: '0.85rem', fontWeight: 'bold' }}>
                        {getStatusLabel(filing.status)}
                      </span>
                    </div>
                    <div style={{ color: '#8B949E', fontSize: '0.8rem' }}>
                      {new Date(filing.created_at).toLocaleString('en-PK')}
                    </div>
                    <div style={{ color: '#8B949E', fontSize: '0.8rem', marginTop: '4px' }}>
                      Payment: {filing.payment_method || 'N/A'} — Rs. 1,500
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* FILING DETAIL */}
            {selectedFiling && (
              <div style={{
                backgroundColor: '#161B22',
                border: '1px solid #21262D',
                borderRadius: '16px',
                padding: '24px',
                height: 'fit-content',
                position: 'sticky',
                top: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
                    Filing Detail
                  </h3>
                  <button
                    onClick={() => setSelectedFiling(null)}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#8B949E',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.2rem'
                    }}>
                    ✕
                  </button>
                </div>

                {/* INFO */}
                <div style={{
                  backgroundColor: '#0D1117',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  {[
                    { label: 'Filing ID', value: selectedFiling.id.slice(0, 16) + '...' },
                    { label: 'Status', value: getStatusLabel(selectedFiling.status) },
                    { label: 'Payment', value: selectedFiling.payment_method || 'N/A' },
                    { label: 'Date', value: new Date(selectedFiling.created_at).toLocaleString('en-PK') },
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: i < 3 ? '12px' : '0',
                      paddingBottom: i < 3 ? '12px' : '0',
                      borderBottom: i < 3 ? '1px solid #21262D' : 'none'
                    }}>
                      <span style={{ color: '#8B949E', fontSize: '0.85rem' }}>{item.label}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* CHAT SUMMARY */}
                {selectedFiling.chat_summary && (
                  <div style={{
                    backgroundColor: '#0D1117',
                    borderRadius: '10px',
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ color: '#8B949E', fontSize: '0.85rem', marginBottom: '8px' }}>
                      AI Chat Summary:
                    </div>
                    <p style={{ fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
                      {selectedFiling.chat_summary}
                    </p>
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ color: '#8B949E', fontSize: '0.85rem', marginBottom: '10px' }}>
                    Status Update:
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => updateStatus(selectedFiling.id, 'verified')}
                      style={{
                        backgroundColor: '#1a3a2a',
                        color: '#1DB954',
                        border: '1px solid #1DB954',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}>
                      ✅ Verify Karo
                    </button>
                    <button
                      onClick={() => updateStatus(selectedFiling.id, 'pending')}
                      style={{
                        backgroundColor: '#2a1f0a',
                        color: '#F0883E',
                        border: '1px solid #F0883E',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}>
                      ⏳ Pending
                    </button>
                    <button
                      onClick={() => updateStatus(selectedFiling.id, 'rejected')}
                      style={{
                        backgroundColor: '#2a0a0a',
                        color: '#f85149',
                        border: '1px solid #f85149',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}>
                      ❌ Reject
                    </button>
                  </div>
                </div>

                {/* MESSAGE TO USER */}
                <div>
                  <div style={{ color: '#8B949E', fontSize: '0.85rem', marginBottom: '10px' }}>
                    User Ko Message Karo:
                  </div>
                  <textarea
                    value={adminMessage}
                    onChange={(e) => setAdminMessage(e.target.value)}
                    placeholder="User ko kya batana chahte hain..."
                    rows={3}
                    style={{
                      width: '100%',
                      backgroundColor: '#0D1117',
                      border: '1px solid #30363D',
                      borderRadius: '8px',
                      padding: '12px',
                      color: '#E6EDF3',
                      fontSize: '0.9rem',
                      outline: 'none',
                      resize: 'none',
                      boxSizing: 'border-box',
                      marginBottom: '10px'
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!adminMessage.trim()}
                    style={{
                      width: '100%',
                      backgroundColor: adminMessage.trim() ? '#1DB954' : '#21262D',
                      color: adminMessage.trim() ? '#000' : '#8B949E',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px',
                      cursor: adminMessage.trim() ? 'pointer' : 'not-allowed',
                      fontWeight: 'bold',
                      fontSize: '0.95rem'
                    }}>
                    💬 Message Bhejo
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid #21262D',
        padding: '16px 24px',
        textAlign: 'center',
        color: '#8B949E',
        fontSize: '0.8rem',
        marginTop: '40px'
      }}>
        © 2026 TaxFiller AI — Admin Panel | Ahmed Shehzad
      </footer>

    </main>
  )
         }
