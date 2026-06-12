'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminPanel() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [adminMessage, setAdminMessage] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  const [msgSuccess, setMsgSuccess] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    pending: 0,
    verified: 0,
    revenue: 0
  })

  useEffect(() => { checkAdmin() }, [])

  const checkAdmin = async () => {
    try {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { window.location.href = '/login'; return }
      const role = data.user.user_metadata?.role
      if (role !== 'admin') { window.location.href = '/'; return }
      setUser(data.user)
      await loadData()
    } catch (e) {
      window.location.href = '/login'
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    // Sab users load karo
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'user')
      .order('created_at', { ascending: false })

    // Sab filings load karo
    const { data: filingsData } = await supabase
      .from('filings')
      .select('*')
      .order('created_at', { ascending: false })

    // Auth users se emails lo
    const { data: authData } = await supabase
      .from('profiles')
      .select('id, full_name, role')

    if (profilesData) {
      // Har user ke saath uski filings merge karo
      const usersWithFilings = profilesData.map(profile => {
        const userFilings = filingsData
          ? filingsData.filter(f => f.user_id === profile.id)
          : []
        const latestFiling = userFilings[0] || null
        return {
          ...profile,
          filings: userFilings,
          latestFiling,
          totalFilings: userFilings.length
        }
      })

      setUsers(usersWithFilings)

      // Stats
      const allFilings = filingsData || []
      setStats({
        totalUsers: profilesData.length,
        pending: allFilings.filter(f => f.status === 'pending').length,
        verified: allFilings.filter(f => f.status === 'verified').length,
        revenue: allFilings
          .filter(f => f.payment_status === 'paid')
          .reduce((sum, f) => sum + (f.filing_amount || 1500), 0)
      })
    }
  }

  // User select hone par uski detail load karo
  const selectUser = async (u) => {
    // Chat messages load karo
    const { data: chatData } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', u.id)
      .order('created_at', { ascending: true })

    // Admin messages load karo
    const { data: adminMsgs } = await supabase
      .from('admin_messages')
      .select('*')
      .eq('user_id', u.id)
      .order('created_at', { ascending: true })

    setSelectedUser({
      ...u,
      chatMessages: chatData || [],
      adminMessages: adminMsgs || []
    })
    setAdminMessage('')
    setMsgSuccess(false)
  }

  const updateFilingStatus = async (filingId, status) => {
    const { error } = await supabase
      .from('filings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', filingId)

    if (error) { alert('Error: ' + error.message); return }
    await loadData()
    if (selectedUser) {
      const updated = users.find(u => u.id === selectedUser.id)
      if (updated) await selectUser(updated)
    }
  }

  const verifyAndNotify = async (filing) => {
    await updateFilingStatus(filing.id, 'verified')

    await supabase.from('admin_messages').insert({
      filing_id: filing.id,
      user_id: filing.user_id,
      sender: 'admin',
      message: '✅ Aapki tax details verify ho gayi hain!\n\nAb aap apni filing ke liye choose karein:\n\n🧑‍💻 Khud File Karein — Practice mode mein Iris pe step by step (Free)\n\n👨‍💼 Admin Se Karwayein — Rs. 3,000 mein admin khud file karega\n\nNeeche chat mein options available hain.',
      message_type: 'verified'
    })

    // Refresh
    if (selectedUser) {
      const updated = users.find(u => u.id === selectedUser.id)
      if (updated) await selectUser({ ...updated })
    }
    await loadData()
  }

  const sendMessage = async () => {
    if (!adminMessage.trim() || !selectedUser) return
    setSendingMsg(true)

    // Latest filing ka id lo agar ho
    const latestFiling = selectedUser.latestFiling

    const { error } = await supabase.from('admin_messages').insert({
      filing_id: latestFiling?.id || null,
      user_id: selectedUser.id,
      sender: 'admin',
      message: adminMessage.trim(),
      message_type: 'message'
    })

    if (error) {
      alert('Error: ' + error.message)
      setSendingMsg(false)
      return
    }

    setAdminMessage('')
    setSendingMsg(false)
    setMsgSuccess(true)
    setTimeout(() => setMsgSuccess(false), 3000)

    // Messages refresh
    const updated = users.find(u => u.id === selectedUser.id)
    if (updated) await selectUser(updated)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const getStatusColor = (s) =>
    ({ pending: '#F0883E', verified: '#1DB954', rejected: '#f85149' }[s] || '#8B949E')
  const getStatusLabel = (s) =>
    ({ pending: '⏳ Pending', verified: '✅ Verified', rejected: '❌ Rejected' }[s] || '📝 No Filing')

  const getUserBadge = (u) => {
    if (!u.latestFiling) return { label: 'New User', color: '#58A6FF', bg: '#0a1a2a' }
    if (u.latestFiling.status === 'pending' && u.latestFiling.payment_status === 'paid')
      return { label: '⏳ Review Karo', color: '#F0883E', bg: '#2a1a0a' }
    if (u.latestFiling.status === 'verified')
      return { label: '✅ Verified', color: '#1DB954', bg: '#0a2a1a' }
    if (u.latestFiling.status === 'rejected')
      return { label: '❌ Rejected', color: '#f85149', bg: '#2a0a0a' }
    return { label: 'Filing Pending', color: '#8B949E', bg: '#1a1a1a' }
  }

  if (loading) return (
    <main style={{ backgroundColor: '#0D1117', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1DB954', fontFamily: 'sans-serif', fontSize: '1.2rem' }}>
      ⏳ Loading...
    </main>
  )

  return (
    <main style={{ backgroundColor: '#0D1117', minHeight: '100vh', fontFamily: 'sans-serif', color: '#E6EDF3' }}>

      {/* NAVBAR */}
      <nav style={{ backgroundColor: '#161B22', borderBottom: '1px solid #21262D', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: '#1DB954', fontSize: '1.3rem', fontWeight: 'bold' }}>TaxFiller AI</div>
          <span style={{ backgroundColor: '#1DB954', color: '#000', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px' }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#8B949E', fontSize: '0.85rem' }}>{user?.email}</span>
          <button onClick={handleLogout} style={{ backgroundColor: 'transparent', color: '#f85149', border: '1px solid #f85149', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.85rem' }}>Logout</button>
        </div>
      </nav>

      {/* TABS */}
      <div style={{ backgroundColor: '#161B22', borderBottom: '1px solid #21262D', padding: '0 24px', display: 'flex', gap: '4px' }}>
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'users', label: `👥 Users (${users.length})` },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ backgroundColor: 'transparent', color: activeTab === tab.id ? '#1DB954' : '#8B949E', border: 'none', borderBottom: activeTab === tab.id ? '2px solid #1DB954' : '2px solid transparent', padding: '14px 20px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: activeTab === tab.id ? 'bold' : 'normal' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '24px' }}>Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#58A6FF' },
                { label: 'Pending Review', value: stats.pending, icon: '⏳', color: '#F0883E' },
                { label: 'Verified', value: stats.verified, icon: '✅', color: '#1DB954' },
                { label: 'Revenue', value: `Rs. ${stats.revenue.toLocaleString()}`, icon: '💰', color: '#1DB954' },
              ].map((stat, i) => (
                <div key={i} style={{ backgroundColor: '#161B22', border: '1px solid #21262D', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ color: stat.color, fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '4px' }}>{stat.value}</div>
                  <div style={{ color: '#8B949E', fontSize: '0.8rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Recent users */}
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#8B949E' }}>Recent Users</h3>
            {users.slice(0, 5).map(u => {
              const badge = getUserBadge(u)
              return (
                <div key={u.id} onClick={() => { selectUser(u); setActiveTab('users') }}
                  style={{ backgroundColor: '#161B22', border: '1px solid #21262D', borderRadius: '12px', padding: '16px 20px', marginBottom: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{u.full_name || 'User'}</div>
                    <div style={{ color: '#8B949E', fontSize: '0.8rem' }}>{new Date(u.created_at).toLocaleDateString('en-PK')} • {u.totalFilings} filing(s)</div>
                  </div>
                  <span style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '0.8rem', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold' }}>
                    {badge.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '380px 1fr' : '1fr', gap: '24px' }}>

            {/* LEFT — Users List */}
            <div>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Sab Users ({users.length})</h2>
              {users.length === 0 ? (
                <div style={{ backgroundColor: '#161B22', border: '1px solid #21262D', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#8B949E' }}>
                  Koi user nahi
                </div>
              ) : (
                users.map(u => {
                  const badge = getUserBadge(u)
                  const isSelected = selectedUser?.id === u.id
                  return (
                    <div key={u.id} onClick={() => selectUser(u)}
                      style={{ backgroundColor: isSelected ? '#1a3a2a' : '#161B22', border: `1px solid ${isSelected ? '#1DB954' : '#21262D'}`, borderRadius: '12px', padding: '14px 16px', marginBottom: '10px', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{u.full_name || 'User'}</div>
                          <div style={{ color: '#8B949E', fontSize: '0.78rem', marginTop: '2px' }}>
                            Joined: {new Date(u.created_at).toLocaleDateString('en-PK')}
                          </div>
                        </div>
                        <span style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* RIGHT — User Detail */}
            {selectedUser && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* User Info Card */}
                <div style={{ backgroundColor: '#161B22', border: '1px solid #21262D', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{selectedUser.full_name || 'User'}</h3>
                    <button onClick={() => setSelectedUser(null)} style={{ backgroundColor: 'transparent', color: '#8B949E', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                  </div>
                  <div style={{ color: '#8B949E', fontSize: '0.85rem', marginBottom: '4px' }}>
                    Joined: {new Date(selectedUser.created_at).toLocaleString('en-PK')}
                  </div>
                  <div style={{ color: '#8B949E', fontSize: '0.85rem' }}>
                    Total Filings: {selectedUser.totalFilings}
                  </div>

                  {/* Filings list */}
                  {selectedUser.filings && selectedUser.filings.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ color: '#8B949E', fontSize: '0.8rem', marginBottom: '8px' }}>📋 Filings:</div>
                      {selectedUser.filings.map(f => (
                        <div key={f.id} style={{ backgroundColor: '#0D1117', borderRadius: '8px', padding: '10px 12px', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.8rem', color: '#8B949E' }}>#{f.id.slice(0, 10)}</span>
                            <span style={{ color: getStatusColor(f.status), fontSize: '0.8rem', fontWeight: 'bold' }}>
                              {getStatusLabel(f.status)}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#8B949E', marginBottom: '8px' }}>
                            {new Date(f.created_at).toLocaleString('en-PK')} • {f.payment_status === 'paid' ? '💳 Paid' : '⏳ Unpaid'}
                          </div>
                          {/* Filing action buttons */}
                          {f.payment_status === 'paid' && f.status !== 'verified' && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => verifyAndNotify(f)}
                                style={{ flex: 1, backgroundColor: '#1a3a2a', color: '#1DB954', border: '1px solid #1DB954', borderRadius: '6px', padding: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 'bold' }}>
                                ✅ Verify + Notify
                              </button>
                              <button onClick={() => updateFilingStatus(f.id, 'rejected')}
                                style={{ backgroundColor: '#2a0a0a', color: '#f85149', border: '1px solid #f85149', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.78rem' }}>
                                ❌
                              </button>
                            </div>
                          )}
                          {/* AI Summary */}
                          {f.chat_summary && (
                            <div style={{ marginTop: '8px', backgroundColor: '#161B22', borderRadius: '6px', padding: '8px', maxHeight: '80px', overflowY: 'auto' }}>
                              <div style={{ color: '#8B949E', fontSize: '0.72rem', marginBottom: '4px' }}>AI Summary:</div>
                              <div style={{ color: '#E6EDF3', fontSize: '0.75rem', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                                {f.chat_summary.replace('CHAT_COMPLETE', '').trim().slice(0, 200)}...
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message Admin → User */}
                <div style={{ backgroundColor: '#161B22', border: '1px solid #21262D', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '0.95rem' }}>
                    💬 {selectedUser.full_name || 'User'} ko Message Karo
                  </div>

                  {/* Previous admin messages */}
                  {selectedUser.adminMessages && selectedUser.adminMessages.length > 0 && (
                    <div style={{ marginBottom: '12px', maxHeight: '120px', overflowY: 'auto' }}>
                      {selectedUser.adminMessages.slice(-3).map(m => (
                        <div key={m.id} style={{ backgroundColor: '#0D1117', borderRadius: '8px', padding: '8px 10px', marginBottom: '6px', fontSize: '0.8rem', color: '#8B949E' }}>
                          <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>Admin: </span>
                          {m.message}
                        </div>
                      ))}
                    </div>
                  )}

                  <textarea value={adminMessage} onChange={(e) => setAdminMessage(e.target.value)}
                    placeholder={`${selectedUser.full_name || 'User'} ko message likhein...`}
                    rows={3}
                    style={{ width: '100%', backgroundColor: '#0D1117', border: '1px solid #30363D', borderRadius: '8px', padding: '12px', color: '#E6EDF3', fontSize: '0.9rem', outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: '10px' }}
                  />

                  {msgSuccess && (
                    <div style={{ color: '#1DB954', fontSize: '0.85rem', marginBottom: '8px', textAlign: 'center' }}>
                      ✅ Message bhej diya!
                    </div>
                  )}

                  <button onClick={sendMessage} disabled={!adminMessage.trim() || sendingMsg}
                    style={{ width: '100%', backgroundColor: adminMessage.trim() ? '#1DB954' : '#21262D', color: adminMessage.trim() ? '#000' : '#8B949E', border: 'none', borderRadius: '8px', padding: '12px', cursor: adminMessage.trim() ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>
                    {sendingMsg ? 'Sending...' : '💬 Message Bhejo'}
                  </button>
                </div>

              </div>
            )}
          </div>
        )}
      </div>

      <footer style={{ borderTop: '1px solid #21262D', padding: '16px 24px', textAlign: 'center', color: '#8B949E', fontSize: '0.8rem', marginTop: '40px' }}>
        © 2026 TaxFiller AI — Admin Panel | Ahmed Shehzad
      </footer>
    </main>
  )
               }
