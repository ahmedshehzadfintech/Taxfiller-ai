'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AgentPanel() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [showAddClient, setShowAddClient] = useState(false)
  const [newClient, setNewClient] = useState({
    client_name: '',
    client_cnic: '',
    client_phone: '',
    client_email: ''
  })
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    checkAgent()
  }, [])

  const checkAgent = async () => {
    try {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        window.location.href = '/login'
        return
      }
      const role = data.user.user_metadata?.role
      if (role !== 'agent') {
        window.location.href = '/'
        return
      }
      setUser(data.user)
      await loadClients(data.user.id)
    } catch (error) {
      window.location.href = '/login'
    } finally {
      setLoading(false)
    }
  }

  const loadClients = async (agentId) => {
    const { data, error } = await supabase
      .from('agent_clients')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
    if (data) setClients(data)
  }

  const addClient = async () => {
    if (!newClient.client_name || !newClient.client_cnic) {
      setMessage({ text: 'Naam aur CNIC zaroori hai!', type: 'error' })
      return
    }

    const { data, error } = await supabase
      .from('agent_clients')
      .insert({
        agent_id: user.id,
        client_name: newClient.client_name,
        client_cnic: newClient.client_cnic,
        client_phone: newClient.client_phone,
        client_email: newClient.client_email
      })
      .select()

    if (error) {
      setMessage({ text: 'Error: ' + error.message, type: 'error' })
      return
    }

    setMessage({ text: 'Client add ho gaya!', type: 'success' })
    setNewClient({ client_name: '', client_cnic: '', client_phone: '', client_email: '' })
    setShowAddClient(false)
    await loadClients(user.id)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
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
    marginTop: '16px'
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
        Checking access...
      </main>
    )
  }

  if (!user) return null

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
            backgroundColor: '#58A6FF',
            color: '#000',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            padding: '2px 8px',
            borderRadius: '10px'
          }}>
            AGENT
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#8B949E', fontSize: '0.85rem' }}>
            {user.email}
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
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'clients', label: 'Clients' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              backgroundColor: 'transparent',
              color: activeTab === tab.id ? '#58A6FF' : '#8B949E',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #58A6FF' : '2px solid transparent',
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

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '24px' }}>
              Agent Dashboard
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}>
              {[
                { label: 'Total Clients', value: clients.length, icon: '👥', color: '#58A6FF' },
                { label: 'Active', value: clients.filter(c => c.status === 'active').length, icon: '✅', color: '#1DB954' },
                { label: 'Is Mahine', value: clients.filter(c => new Date(c.created_at).getMonth() === new Date().getMonth()).length, icon: '📅', color: '#F0883E' },
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

            <div style={{
              backgroundColor: '#161B22',
              border: '1px solid #1DB954',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Naya Client Add Karein</div>
                <div style={{ color: '#8B949E', fontSize: '0.85rem' }}>Client ki filing shuru karein</div>
              </div>
              <button
                onClick={() => { setShowAddClient(true); setActiveTab('clients') }}
                style={{
                  backgroundColor: '#1DB954',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}>
                + Add Client
              </button>
            </div>

            <h3 style={{ color: '#8B949E', marginBottom: '16px' }}>Recent Clients</h3>
            {clients.length === 0 ? (
              <div style={{
                backgroundColor: '#161B22',
                border: '1px solid #21262D',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
                color: '#8B949E'
              }}>
                Abhi koi client nahi
              </div>
            ) : (
              clients.slice(0, 5).map(client => (
                <div
                  key={client.id}
                  onClick={() => { setSelectedClient(client); setActiveTab('clients') }}
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
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{client.client_name}</div>
                    <div style={{ color: '#8B949E', fontSize: '0.85rem' }}>CNIC: {client.client_cnic}</div>
                  </div>
                  <span style={{
                    backgroundColor: '#1a3a2a',
                    color: '#1DB954',
                    fontSize: '0.8rem',
                    padding: '4px 10px',
                    borderRadius: '8px'
                  }}>
                    Active
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* CLIENTS TAB */}
        {activeTab === 'clients' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>
                Mere Clients ({clients.length})
              </h2>
              <button
                onClick={() => setShowAddClient(!showAddClient)}
                style={{
                  backgroundColor: '#1DB954',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}>
                {showAddClient ? 'X Band Karo' : '+ Naya Client'}
              </button>
            </div>

            {showAddClient && (
              <div style={{
                backgroundColor: '#161B22',
                border: '1px solid #1DB954',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <h3 style={{ color: '#1DB954', marginBottom: '16px' }}>Naya Client</h3>

                {message.text && (
                  <div style={{
                    backgroundColor: message.type === 'success' ? '#1a3a2a' : '#3a1a1a',
                    border: '1px solid ' + (message.type === 'success' ? '#1DB954' : '#f85149'),
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px',
                    color: message.type === 'success' ? '#1DB954' : '#f85149'
                  }}>
                    {message.text}
                  </div>
                )}

                <label style={labelStyle}>Client Ka Naam *</label>
                <input
                  type="text"
                  placeholder="Ahmed Khan"
                  value={newClient.client_name}
                  onChange={(e) => setNewClient({ ...newClient, client_name: e.target.value })}
                  style={inputStyle}
                />

                <label style={labelStyle}>CNIC *</label>
                <input
                  type="text"
                  placeholder="12345-6789012-3"
                  value={newClient.client_cnic}
                  onChange={(e) => setNewClient({ ...newClient, client_cnic: e.target.value })}
                  style={inputStyle}
                />

                <label style={labelStyle}>Phone</label>
                <input
                  type="tel"
                  placeholder="03XX-XXXXXXX"
                  value={newClient.client_phone}
                  onChange={(e) => setNewClient({ ...newClient, client_phone: e.target.value })}
                  style={inputStyle}
                />

                <label style={labelStyle}>Email (Optional)</label>
                <input
                  type="email"
                  placeholder="client@example.com"
                  value={newClient.client_email}
                  onChange={(e) => setNewClient({ ...newClient, client_email: e.target.value })}
                  style={inputStyle}
                />

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button
                    onClick={addClient}
                    style={{
                      flex: 2,
                      backgroundColor: '#1DB954',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}>
                    Client Add Karein
                  </button>
                  <button
                    onClick={() => {
                      setShowAddClient(false)
                      setMessage({ text: '', type: '' })
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: 'transparent',
                      color: '#8B949E',
                      border: '1px solid #30363D',
                      borderRadius: '8px',
                      padding: '12px',
                      cursor: 'pointer'
                    }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {clients.length === 0 && !showAddClient ? (
              <div style={{
                backgroundColor: '#161B22',
                border: '1px solid #21262D',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
                color: '#8B949E'
              }}>
                Abhi koi client nahi
              </div>
            ) : (
              clients.map(client => (
                <div key={client.id} style={{ marginBottom: '12px' }}>
                  <div
                    onClick={() => setSelectedClient(
                      selectedClient?.id === client.id ? null : client
                    )}
                    style={{
                      backgroundColor: selectedClient?.id === client.id ? '#1a2a3a' : '#161B22',
                      border: '1px solid ' + (selectedClient?.id === client.id ? '#58A6FF' : '#21262D'),
                      borderRadius: selectedClient?.id === client.id ? '12px 12px 0 0' : '12px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{client.client_name}</div>
                      <div style={{ color: '#8B949E', fontSize: '0.85rem' }}>CNIC: {client.client_cnic}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{
                        backgroundColor: '#1a3a2a',
                        color: '#1DB954',
                        fontSize: '0.8rem',
                        padding: '4px 10px',
                        borderRadius: '8px'
                      }}>
                        Active
                      </span>
                      <span style={{ color: '#8B949E' }}>
                        {selectedClient?.id === client.id ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {selectedClient?.id === client.id && (
                    <div style={{
                      backgroundColor: '#161B22',
                      border: '1px solid #58A6FF',
                      borderTop: 'none',
                      borderRadius: '0 0 12px 12px',
                      padding: '16px 20px'
                    }}>
                      {[
                        { label: 'Phone', value: client.client_phone || 'N/A' },
                        { label: 'Email', value: client.client_email || 'N/A' },
                        { label: 'Added', value: new Date(client.created_at).toLocaleDateString('en-PK') },
                      ].map((item, i) => (
                        <div key={i} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <span style={{ color: '#8B949E', fontSize: '0.85rem' }}>{item.label}</span>
                          <span style={{ fontSize: '0.85rem' }}>{item.value}</span>
                        </div>
                      ))}

                      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                        <a href="/chat" style={{
                          backgroundColor: '#1DB954',
                          color: '#000',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontWeight: 'bold',
                          fontSize: '0.85rem',
                          textDecoration: 'none',
                          display: 'inline-block'
                        }}>
                          AI Filing Shuru
                        </a>
                        <a href="/iris" style={{
                          backgroundColor: '#21262D',
                          color: '#E6EDF3',
                          border: '1px solid #30363D',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '0.85rem',
                          textDecoration: 'none',
                          display: 'inline-block'
                        }}>
                          Iris Guide
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <footer style={{
        borderTop: '1px solid #21262D',
        padding: '16px 24px',
        textAlign: 'center',
        color: '#8B949E',
        fontSize: '0.8rem',
        marginTop: '40px'
      }}>
        © 2026 TaxFiller AI — Agent Panel | Pakistan
      </footer>

    </main>
  )
}
