'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminPanel() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [filings, setFilings] = useState([])
  const [agents, setAgents] = useState([])
  const [profiles, setProfiles] = useState({})
  const [selectedFiling, setSelectedFiling] = useState(null)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [adminMessage, setAdminMessage] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  const [stats, setStats] = useState({
    pending: 0, verified: 0, totalFilings: 0,
    revenue: 0, totalAgents: 0, totalClients: 0
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
    } catch (error) {
      window.location.href = '/login'
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    // Simple query -- no join
    const { data: filingsData, error } = await supabase
      .from('filings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Filings error:', error.message)
      return
    }

    if (filingsData && filingsData.length > 0) {
      setFilings(filingsData)

      // User IDs nikalo aur profiles load karo
      const userIds = [...new Set(filingsData.map(f => f.user_id))]
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('id', userIds)

      if (profilesData) {
        const profileMap = {}
        profilesData.forEach(p => { profileMap[p.id] = p })
        setProfiles(profileMap)
      }

      // Stats calculate karo
      const uniqueAgents = [...new Set(filingsData.map(f => f.agent_id).filter(Boolean))]
      setStats({
        pending: filingsData.filter(f => f.status === 'pending').length,
        verified: filingsData.filter(f => f.status === 'verified').length,
        totalFilings: filingsData.length,
        revenue: filingsData.filter(f => f.payment_status === 'paid').reduce((sum, f) => sum + (f.filing_amount || 1500), 0),
        totalAgents: uniqueAgents.length,
        totalClients: 0
      })
    } else {
      setFilings([])
    }

    // Agents load karo
    const { data: agentsData } = await supabase
      .from('agent_clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (agentsData) {
      setAgents(agentsData)
      setStats(prev => ({
        ...prev,
        totalAgents: [...new Set(agentsData.map(a => a.agent_id))].length,
        totalClients: agentsData.length
      }))
    }
  }

  const getUserName = (userId) => {
    return profiles[userId]?.full_name || 'User'
  }

  const updateStatus = async (filingId, status) => {
    const { error } = await supabase
      .from('filings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', filingId)

    if (error) { alert('Error: ' + error.message); return }
    await loadData()
    if (selectedFiling?.id === filingId) {
      setSelectedFiling(prev => ({ ...prev, status }))
    }
  }

  const verifyAndNotify = async (filingId) => {
    await updateStatus(filingId, 'verified')

    const filing = filings.find(f => f.id === filingId) || selectedFiling
    if (filing) {
      const { error } = await supabase
        .from('admin_messages')
        .insert({
          filing_id: filingId,
          user_id: filing.user_id,
          sender: 'admin',
          message: '✅ Aapki tax details verify ho gayi hain!\n\nAb aap apni filing ke liye 2 options mein se choose karein:\n\n🧑‍💻 Khud File Karein — Practice mode mein Iris pe step by step karein (Free)\n\n👨‍💼 Admin Se Karwayein — Rs. 3,000 mein admin khud file karega\n\nNeeche chat mein options available hain.',
          message_type: 'verified'
        })
      if (error) console.error('Notify error:', error.message)
    }
  }

  const sendMessage = async () => {
    if (!adminMessage.trim() || !selectedFiling) return
    setSendingMsg(true)

    const { error } = await supabase
      .from('admin_messages')
      .insert({
        filing_id: selectedFiling.id,
        user_id: selectedFiling.user_id,
        sender: 'admin',
        message: adminMessage.trim(),
        message_type: 'message'
      })

    if (error) { alert('Error: ' + error.message); setSendingMsg(false); return }
    setAdminMessage('')
    setSendingMsg(false)
    alert('Message bhej diya! ✅')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const getStatusColor = (s) => ({ pending: '#F0883E', verified: '#1DB954', rejected: '#f85149' }[s] || '#8B949E')
  const getStatusLabel = (s) => ({ pending: '⏳ Pending', verified: '✅ Verified', rejected: '❌ Rejected' }[s] || s)

  if (loading) return (
    <main style={{ backgroundColor: '#0D1117', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1DB954', fontFamily: 'sans-serif', fontSize: '1.2rem' }}>
      ⏳ Loading...
    </main>
  )

  if (!user) return null

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
          { id: 'filings', label: `📋 Filings (${filings.length})` },
          { id: 'agents', label: '👥 Agents' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ backgroundColor: 'transparent', color: activeTab === tab.id ? '#1DB954' : '#8B949E', border: 'none', borderBottom: activeTab === tab.id ? '2px solid #1DB954' : '2px solid transparent', padding: '14px 20px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: activeTab === tab.id ? 'bold' : 'normal' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '24px' }}>Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {[
                { label: 'Total Filings', value: stats.totalFilings, icon: '📋', color: '#58A6FF' },
                { label: 'Pending', value: stats.pending, icon: '⏳', color: '#F0883E' },
                { label: 'Verified', value: stats.verified, icon: '✅', color: '#1DB954' },
                { label: 'Revenue', value: `Rs. ${stats.revenue.toLocaleString()}`, icon: '💰', color: '#1DB954' },
                { label: 'Total Agents', value: stats.totalAgents, icon: '👤', color: '#58A6FF' },
                { label: 'Total Clients', value: stats.totalClients, icon: '👥', color: '#F0883E' },
              ].map((stat, i) => (
                <div key={i} style={{ backgroundColor: '#161B22', border: '1px solid #21262D', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ color: stat.color, fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '4px' }}>{stat.value}</div>
                  <div style={{ color: '#8B949E', fontSize: '0.8rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#8B949E' }}>Recent Filings</h3>
            {filings.length === 0 ? (
              <div style={{ backgroundColor: '#161B22', border: '1px solid #21262D', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#8B949E' }}>
                Abhi koi filing nahi hai
              </div>
            ) : (
              filings.slice(0, 5).map(filing => (
                <div key={filing.id} onClick={() => { setSelectedFiling(filing); setActiveTab('filings') }}
                  style={{ backgroundColor: '#161B22', border: '1px solid #21262D', borderRadius: '12px', padding: '16px 20px', marginBottom: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {getUserName(filing.user_id)} — #{filing.id.slice(0, 8)}
                    </div>
                    <div style={{ color: '#8B949E', fontSize: '0.85rem' }}>
                      {new Date(filing.created_at).toLocaleDateString('en-PK')} • {filing.payment_status === 'paid' ? '💳 Paid' : '⏳ Unpaid'}
                    </div>
                  </div>
                  <span style={{ color: getStatusColor(filing.status), fontSize: '0.85rem', fontWeight: 'bold' }}>
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
            <div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Sab Filings ({filings.length})</h2>
              {filings.length === 0 ? (
                <div style={{ backgroundColor: '#161B22', border: '1px solid #21262D', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#8B949E' }}>
                  Abhi koi filing nahi hai
                </div>
              ) : (
                filings.map(filing => (
                  <div key={filing.id} onClick={() => setSelectedFiling(filing)}
                    style={{ backgroundColor: selectedFiling?.id === filing.id ? '#1a3a2a' : '#161B22', border: `1px solid ${selectedFiling?.id === filing.id ? '#1DB954' : '#21262D'}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '12px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 'bold' }}>{getUserName(filing.user_id)} — #{filing.id.slice(0, 8)}</span>
                      <span style={{ color: getStatusColor(filing.status), fontSize: '0.85rem', fontWeight: 'bold' }}>{getStatusLabel(filing.status)}</span>
                    </div>
                    <div style={{ color: '#8B949E', fontSize: '0.8rem' }}>
                      {new Date(filing.created_at).toLocaleString('en-PK')} • {filing.payment_status === 'paid' ? '💳 Paid' : '⏳ Unpaid'}
                    </div>
                  </div>
                ))
              )}
            </div>

            {selectedFiling && (
              <div style={{ backgroundColor: '#161B22', border: '1px solid #21262D', borderRadius: '16px', padding: '24px', height: 'fit-content' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Filing Detail</h3>
                  <button onClick={() => setSelectedFiling(null)} style={{ backgroundColor: 'transparent', color: '#8B949E', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                </div>

                <div style={{ backgroundColor: '#0D1117', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                  {[
                    { label: 'User', value: getUserName(selectedFiling.user_id) },
                    { label: 'Filing ID', value: '#' + selectedFiling.id.slice(0, 12) },
                    { label: 'Status', value: getStatusLabel(selectedFiling.status) },
                    { label: 'Payment', value: selectedFiling.payment_status === 'paid' ? '✅ Paid' : '❌ Unpaid' },
                    { label: 'Amount', value: `Rs. ${(selectedFiling.filing_amount || 1500).toLocaleString()}` },
                    { label: 'Date', value: new Date(selectedFiling.created_at).toLocaleString('en-PK') },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: i < 5 ? '12px' : '0', paddingBottom: i < 5 ? '12px' : '0', borderBottom: i < 5 ? '1px solid #21262D' : 'none' }}>
                      <span style={{ color: '#8B949E', fontSize: '0.85rem' }}>{item.label}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* AI Summary */}
                {selectedFiling.chat_summary && (
                  <div style={{ backgroundColor: '#0D1117', borderRadius: '10px', padding: '12px', marginBottom: '16px', maxHeight: '150px', overflowY: 'auto' }}>
                    <div style={{ color: '#8B949E', fontSize: '0.8rem', marginBottom: '8px' }}>📋 AI Summary:</div>
                    <div style={{ color: '#E6EDF3', fontSize: '0.8rem', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                      {selectedFiling.chat_summary.replace('CHAT_COMPLETE', '').trim()}
                    </div>
                  </div>
                )}

                {/* Status Buttons */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ color: '#8B949E', fontSize: '0.85rem', marginBottom: '10px' }}>Status Update:</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => verifyAndNotify(selectedFiling.id)}
                      style={{ backgroundColor: '#1a3a2a', color: '#1DB954', border: '1px solid #1DB954', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      ✅ Verify + Notify
                    </button>
                    <button onClick={() => updateStatus(selectedFiling.id, 'pending')}
                      style={{ backgroundColor: '#2a1f0a', color: '#F0883E', border: '1px solid #F0883E', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      ⏳ Pending
                    </button>
                    <button onClick={() => updateStatus(selectedFiling.id, 'rejected')}
                      style={{ backgroundColor: '#2a0a0a', color: '#f85149', border: '1px solid #f85149', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      ❌ Reject
                    </button>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <div style={{ color: '#8B949E', fontSize: '0.85rem', marginBottom: '10px' }}>User Ko Message Karo:</div>
                  <textarea value={adminMessage} onChange={(e) => setAdminMessage(e.target.value)}
                    placeholder="User ko kya batana chahte hain..."
                    rows={3}
                    style={{ width: '100%', backgroundColor: '#0D1117', border: '1px solid #30363D', borderRadius: '8px', padding: '12px', color: '#E6EDF3', fontSize: '0.9rem', outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: '10px' }}
                  />
                  <button onClick={sendMessage} disabled={!adminMessage.trim() || sendingMsg}
                    style={{ width: '100%', backgroundColor: adminMessage.trim() ? '#1DB954' : '#21262D', color: adminMessage.trim() ? '#000' : '#8B949E', border: 'none', borderRadius: '8px', padding: '12px', cursor: adminMessage.trim() ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>
                    {sendingMsg ? 'Sending...' : '💬 Message Bhejo'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AGENTS TAB */}
        {activeTab === 'agents' && (
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '24px' }}>Agents & Clients</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {[
                { label: 'Total Agents', value: stats.totalAgents, icon: '👤', color: '#58A6FF' },
                { label: 'Total Clients', value: stats.totalClients, icon: '👥', color: '#1DB954' },
              ].map((stat, i) => (
                <div key={i} style={{ backgroundColor: '#161B22', border: '1px solid #21262D', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{stat.icon}</div>
                  <div style={{ color: stat.color, fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '4px' }}>{stat.value}</div>
                  <div style={{ color: '#8B949E', fontSize: '0.85rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {agents.length === 0 ? (
              <div style={{ backgroundColor: '#161B22', border: '1px solid #21262D', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#8B949E' }}>
                Abhi koi agent ya client nahi hai
              </div>
            ) : (
              agents.map(client => (
                <div key={client.id} onClick={() => setSelectedAgent(selectedAgent?.id === client.id ? null : client)}
                  style={{ backgroundColor: selectedAgent?.id === client.id ? '#1a2a3a' : '#161B22', border: `1px solid ${selectedAgent?.id === client.id ? '#58A6FF' : '#21262D'}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '12px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{client.client_name}</div>
                      <div style={{ color: '#8B949E', fontSize: '0.85rem' }}>CNIC: {client.client_cnic}</div>
                    </div>
                    <span style={{ backgroundColor: '#1a3a2a', color: '#1DB954', fontSize: '0.8rem', padding: '4px 10px', borderRadius: '8px' }}>
                      {client.status || 'active'}
                    </span>
                  </div>
                  {selectedAgent?.id === client.id && (
                    <div style={{ borderTop: '1px solid #21262D', marginTop: '12px', paddingTop: '12px' }}>
                      {[
                        { label: 'Phone', value: client.client_phone || 'N/A' },
                        { label: 'Email', value: client.client_email || 'N/A' },
                        { label: 'Added', value: new Date(client.created_at).toLocaleDateString('en-PK') },
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ color: '#8B949E', fontSize: '0.85rem' }}>{item.label}</span>
                          <span style={{ fontSize: '0.85rem' }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
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
