'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

// AI summary se data extract karne ka function
function extractDataFromSummary(summary) {
  if (!summary) return {}
  const data = {}
  const text = summary.replace('CHAT_COMPLETE', '')

  const patterns = {
    naam: /naam[:\s]+([^\n\-•]+)/i,
    cnic: /cnic[:\s]+([0-9\-]+)/i,
    employer: /employer[\/\s]*(?:business)?[:\s]+([^\n\-•]+)/i,
    monthlyIncome: /(?:maheena|monthly)[^\n]*(?:tankhwah|income|salary)[:\s]+(?:rs\.?\s*)?([0-9,]+)/i,
    annualIncome: /annual[^\n]*income[:\s]+(?:rs\.?\s*)?([0-9,]+)/i,
    allowances: /allowances?[:\s]+(?:rs\.?\s*)?([0-9,]+|nil|none|nahi|koi nahi)/i,
    withholding: /withholding[^\n]*(?:tax)?[:\s]+(?:rs\.?\s*)?([0-9,]+|nil|zero|0)/i,
    taxLiability: /tax[^\n]*(?:liability|payable)[:\s]+(?:rs\.?\s*)?([0-9,]+)/i,
    bank: /bank[:\s]+([^\n\-•]+)/i,
    filerStatus: /filer[^\n]*status[:\s]+([^\n\-•]+)/i,
  }

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern)
    if (match) data[key] = match[1].trim()
  }

  // Monthly se annual calculate karo agar annual nahi mila
  if (!data.annualIncome && data.monthlyIncome) {
    const monthly = parseInt(data.monthlyIncome.replace(/,/g, ''))
    if (!isNaN(monthly)) {
      data.annualIncome = (monthly * 12).toLocaleString()
    }
  }

  return data
}

export default function Practice() {
  const [user, setUser] = useState(null)
  const [filing, setFiling] = useState(null)
  const [extractedData, setExtractedData] = useState({})
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [copiedField, setCopiedField] = useState(null)
  const [completedSteps, setCompletedSteps] = useState([])

  useEffect(() => { checkUser() }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()
    if (!data.user) { window.location.href = '/login'; return }
    setUser(data.user)

    const { data: filingData } = await supabase
      .from('filings')
      .select('*')
      .eq('user_id', data.user.id)
      .eq('status', 'verified')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (filingData) {
      setFiling(filingData)
      const extracted = extractDataFromSummary(filingData.chat_summary)
      setExtractedData(extracted)
    }
    setLoading(false)
  }

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2500)
  }

  const markStepDone = (stepIndex) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps(prev => [...prev, stepIndex])
    }
    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Iris 2.0 steps — exact flow
  const annualIncome = extractedData.annualIncome || '___________'
  const withholding = extractedData.withholding || '0'
  const allowances = extractedData.allowances && !['nil', 'none', 'nahi', 'koi nahi'].includes(extractedData.allowances?.toLowerCase())
    ? extractedData.allowances : '0'

  const steps = [
    {
      id: 'login',
      title: 'Step 1 — Iris pe Login Karein',
      irisSection: 'iris.fbr.gov.pk',
      description: 'Browser mein naya tab khol kar Iris website par jayein aur apne credentials se login karein.',
      fields: [
        {
          label: 'Website',
          value: 'iris.fbr.gov.pk',
          fieldName: 'website',
          instruction: 'Address bar mein yeh type karein',
          irisLabel: '🌐 Browser Address Bar'
        },
        {
          label: 'Username (CNIC)',
          value: extractedData.cnic || 'Apna CNIC (dashes ke bina)',
          fieldName: 'cnic',
          instruction: 'Login form mein CNIC field mein paste karein',
          irisLabel: '👤 Username Field'
        }
      ],
      tip: 'CNIC bغیر dashes ke likhein — sirf 13 numbers'
    },
    {
      id: 'declaration',
      title: 'Step 2 — Return Form Kholen',
      irisSection: 'Declaration → Returns/Statements → Normal Return',
      description: 'Login ke baad upar menu mein Declaration tab dhundhein.',
      fields: [
        {
          label: 'Menu Path',
          value: 'Declaration',
          fieldName: 'declaration',
          instruction: 'Top-left mein "Declaration" click karein',
          irisLabel: '📋 Top Navigation Bar'
        },
        {
          label: 'Option',
          value: 'Returns / Statements (Original)',
          fieldName: 'returns',
          instruction: 'Left sidebar mein yeh option select karein',
          irisLabel: '📁 Left Sidebar'
        },
        {
          label: 'Return Type',
          value: 'Normal Return (Ind/AoP/Coy)',
          fieldName: 'normalReturn',
          instruction: 'Middle column mein top pe yeh select karein',
          irisLabel: '📄 Return Type Dropdown'
        }
      ],
      tip: 'Agar Declaration nahi dikh raha toh page refresh karein'
    },
    {
      id: 'taxyear',
      title: 'Step 3 — Tax Year Select Karein',
      irisSection: 'Tax Year → Continue',
      description: 'Naya return form mein tax year 2025 select karein.',
      fields: [
        {
          label: 'Tax Year',
          value: '2025',
          fieldName: 'taxYear',
          instruction: 'Tax Year dropdown mein yeh select karein',
          irisLabel: '📅 Tax Year Field'
        },
        {
          label: 'Period',
          value: '01-JUL-2024 – 30-JUN-2025',
          fieldName: 'period',
          instruction: 'Period automatically select ho jaayegi',
          irisLabel: '📅 Period Field'
        }
      ],
      tip: '"Continue" button dabayein tax year select karne ke baad'
    },
    {
      id: 'residency',
      title: 'Step 4 — Residency Confirm Karein',
      irisSection: 'Form 114(1) — Residency Status',
      description: 'Pehla step residency confirm karna hai.',
      fields: [
        {
          label: 'Residency Status',
          value: 'Resident',
          fieldName: 'residency',
          instruction: '"Resident" select karein — Pakistan mein rehne wale sab resident hain',
          irisLabel: '🏠 Residency Status'
        }
      ],
      tip: 'Pakistan mein 183 din ya zyada rehne wale Resident hain'
    },
    {
      id: 'salary',
      title: 'Step 5 — Salary Income Fill Karein',
      irisSection: 'Income → Salary (Section 12)',
      description: 'Salary section mein apni details bharen — AI ne jo calculate kiya woh yahan copy-paste karein.',
      fields: [
        {
          label: 'Employer Name / NTN',
          value: extractedData.employer || 'Apne employer ka naam',
          fieldName: 'employer',
          instruction: 'Search box mein employer ka naam dhundhein',
          irisLabel: '🏢 Employer Name/NTN Field',
          highlight: true
        },
        {
          label: 'Gross Salary (Annual)',
          value: annualIncome,
          fieldName: 'grossSalary',
          instruction: 'Total annual salary — monthly x 12',
          irisLabel: '💰 Gross Salary Field',
          highlight: true,
          important: true
        },
        {
          label: 'Exempt Allowances',
          value: allowances,
          fieldName: 'allowances',
          instruction: 'Medical, conveyance, house rent allowances jo tax-free hain',
          irisLabel: '💼 Exempt Allowances Field',
          highlight: true
        },
        {
          label: 'Tax Deducted from Salary',
          value: withholding,
          fieldName: 'withholding',
          instruction: 'Employer ne pehle se kitna tax kata — salary slip pe hota hai',
          irisLabel: '🏦 Tax Deducted Field',
          highlight: true,
          important: true
        }
      ],
      tip: 'Annual = Monthly × 12. Agar employer nahi mila toh "I cannot find my employer" select karein'
    },
    {
      id: 'otherincome',
      title: 'Step 6 — Doosri Income (Agar Ho)',
      irisSection: 'Income → Other Sources',
      description: 'Property rent, bank profit, investments — agar koi aur income hai toh yahan bharein.',
      fields: [
        {
          label: 'Property Income',
          value: '0',
          fieldName: 'propertyIncome',
          instruction: 'Agar koi property rent nahi hai toh 0 likhein',
          irisLabel: '🏠 Property Income Field'
        },
        {
          label: 'Bank Profit / Savings',
          value: '0',
          fieldName: 'bankProfit',
          instruction: 'Bank savings account ka saal ka profit',
          irisLabel: '🏦 Bank Profit Field'
        }
      ],
      tip: 'Agar sirf salary income hai toh sab 0 likhein aur aage jayein'
    },
    {
      id: 'wealth',
      title: 'Step 7 — Wealth Statement',
      irisSection: 'Wealth Statement (Form 116)',
      description: 'Assets aur liabilities declare karni hain — basic info fill karein.',
      fields: [
        {
          label: 'Bank Account Balance',
          value: 'Apne bank account ka closing balance',
          fieldName: 'bankBalance',
          instruction: 'Bank name aur 30 June 2025 ka closing balance',
          irisLabel: '🏦 Bank Accounts Section'
        },
        {
          label: 'Personal Expenses',
          value: 'Annual personal expenses (estimated)',
          fieldName: 'expenses',
          instruction: 'Estimated annual expenses — approximate likhein',
          irisLabel: '💳 Personal Expenses Field'
        }
      ],
      tip: 'Assets > Rs. 1 crore ho toh detail wealth statement zaroori hai. Honest figures likhein.'
    },
    {
      id: 'verify',
      title: 'Step 8 — Verify & Submit',
      irisSection: 'Verify → Submit',
      description: 'Sab review karein aur submit karein.',
      fields: [
        {
          label: 'Action',
          value: 'Verify button dabayein',
          fieldName: 'verify',
          instruction: 'Pehle "Verify" — koi error nahi aana chahiye — phir "Submit"',
          irisLabel: '✅ Verify Button (bottom of form)'
        },
        {
          label: 'PIN',
          value: 'Apna 4-digit PIN',
          fieldName: 'pin',
          instruction: 'Submit pe apna PIN enter karein — FBR ne register pe diya tha',
          irisLabel: '🔐 PIN Verification'
        }
      ],
      tip: 'Error aaye toh us field pe wapas jayein aur theek karein. Submit ke baad acknowledgment download karein!'
    }
  ]

  const totalSteps = steps.length
  const progress = Math.round((completedSteps.length / totalSteps) * 100)

  if (loading) return (
    <main style={{ backgroundColor: '#0D1117', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1DB954', fontFamily: 'sans-serif' }}>
      Loading...
    </main>
  )

  // Filing nahi mili
  if (!filing) return (
    <main style={{ backgroundColor: '#0D1117', minHeight: '100vh', fontFamily: 'sans-serif', color: '#E6EDF3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '16px' }}>⏳</div>
      <h2 style={{ color: '#F0883E', marginBottom: '12px' }}>Filing Abhi Verified Nahi</h2>
      <p style={{ color: '#8B949E', marginBottom: '24px' }}>Practice mode sirf admin verification ke baad available hota hai.</p>
      <a href="/chat" style={{ backgroundColor: '#1DB954', color: '#000', borderRadius: '10px', padding: '12px 24px', fontWeight: 'bold', textDecoration: 'none' }}>
        Chat Pe Wapas Jayein
      </a>
    </main>
  )

  const step = steps[currentStep]
  const isStepDone = completedSteps.includes(currentStep)
  const allDone = completedSteps.length === totalSteps

  // Completion screen
  if (allDone) return (
    <main style={{ backgroundColor: '#0D1117', minHeight: '100vh', fontFamily: 'sans-serif', color: '#E6EDF3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: '5rem', marginBottom: '24px' }}>🎉</div>
      <h1 style={{ fontSize: '2rem', color: '#1DB954', marginBottom: '16px' }}>Mubarak Ho!</h1>
      <p style={{ color: '#8B949E', fontSize: '1rem', lineHeight: '1.7', maxWidth: '420px', marginBottom: '32px' }}>
        Aapki FBR tax return successfully file ho gayi!<br />
        Acknowledgment zaroor download kar lein — future mein kaam aayegi.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="/" style={{ backgroundColor: '#1DB954', color: '#000', borderRadius: '10px', padding: '14px 28px', fontWeight: 'bold', textDecoration: 'none' }}>🏠 Home</a>
        <a href="/chat" style={{ backgroundColor: 'transparent', color: '#E6EDF3', border: '1px solid #30363D', borderRadius: '10px', padding: '14px 28px', textDecoration: 'none' }}>💬 Chat</a>
      </div>
    </main>
  )

  return (
    <main style={{ backgroundColor: '#0D1117', minHeight: '100vh', fontFamily: 'sans-serif', color: '#E6EDF3' }}>

      {/* NAVBAR */}
      <nav style={{ backgroundColor: '#161B22', borderBottom: '1px solid #21262D', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#1DB954', fontSize: '1.2rem', fontWeight: 'bold' }}>TaxFiller AI</div>
        <div style={{ color: '#8B949E', fontSize: '0.85rem' }}>🎯 Iris Practice Mode</div>
      </nav>

      {/* PROGRESS */}
      <div style={{ backgroundColor: '#161B22', padding: '16px 24px', borderBottom: '1px solid #21262D' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#8B949E', fontSize: '0.85rem' }}>
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span style={{ color: '#1DB954', fontSize: '0.85rem', fontWeight: 'bold' }}>
              {progress}% Complete
            </span>
          </div>
          <div style={{ backgroundColor: '#21262D', borderRadius: '10px', height: '6px' }}>
            <div style={{ backgroundColor: '#1DB954', height: '100%', width: `${progress}%`, borderRadius: '10px', transition: 'width 0.4s ease' }} />
          </div>
          {/* Step dots */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {steps.map((s, i) => (
              <div key={i} onClick={() => setCurrentStep(i)}
                style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s', backgroundColor: completedSteps.includes(i) ? '#1DB954' : i === currentStep ? '#21262D' : '#161B22', color: completedSteps.includes(i) ? '#000' : i === currentStep ? '#1DB954' : '#8B949E', border: i === currentStep ? '2px solid #1DB954' : '1px solid #21262D' }}>
                {completedSteps.includes(i) ? '✓' : i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Step Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: '0 0 8px' }}>{step.title}</h2>
          <p style={{ color: '#8B949E', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>{step.description}</p>
        </div>

        {/* Iris Section Indicator */}
        <div style={{ backgroundColor: '#0a1a0a', border: '1px solid #1DB954', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.1rem' }}>🖥️</span>
          <div>
            <div style={{ color: '#8B949E', fontSize: '0.72rem', marginBottom: '2px' }}>Iris pe yahan jao:</div>
            <div style={{ color: '#1DB954', fontSize: '0.88rem', fontWeight: 'bold' }}>{step.irisSection}</div>
          </div>
        </div>

        {/* Fields */}
        {step.fields.map((field, fi) => (
          <div key={fi} style={{ backgroundColor: '#161B22', border: `1px solid ${field.important ? '#1DB954' : '#21262D'}`, borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>

            {/* Field label */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ color: '#8B949E', fontSize: '0.8rem' }}>{field.label}</span>
              {field.important && (
                <span style={{ backgroundColor: '#1a3a2a', color: '#1DB954', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px' }}>Important</span>
              )}
            </div>

            {/* Iris field replica */}
            <div style={{ backgroundColor: '#0D1117', border: '1px solid #30363D', borderRadius: '8px', padding: '0', marginBottom: '10px', overflow: 'hidden' }}>
              {/* Iris field header */}
              <div style={{ backgroundColor: '#1a1f2e', padding: '6px 12px', borderBottom: '1px solid #21262D' }}>
                <span style={{ color: '#58A6FF', fontSize: '0.72rem', fontWeight: 'bold' }}>{field.irisLabel}</span>
              </div>
              {/* Value + Copy */}
              <div style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <span style={{ color: field.value.includes('___') ? '#8B949E' : '#E6EDF3', fontSize: '1rem', fontWeight: field.important ? 'bold' : 'normal', fontFamily: 'monospace', flex: 1 }}>
                  {field.value}
                </span>
                <button onClick={() => copyToClipboard(field.value, field.fieldName)}
                  style={{ backgroundColor: copiedField === field.fieldName ? '#1a3a2a' : '#21262D', color: copiedField === field.fieldName ? '#1DB954' : '#E6EDF3', border: `1px solid ${copiedField === field.fieldName ? '#1DB954' : '#30363D'}`, borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 'bold', flexShrink: 0, transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                  {copiedField === field.fieldName ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>

            {/* Instruction */}
            <div style={{ color: '#8B949E', fontSize: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <span style={{ color: '#1DB954', flexShrink: 0 }}>→</span>
              <span>{field.instruction}</span>
            </div>
          </div>
        ))}

        {/* Tip */}
        <div style={{ backgroundColor: '#161B22', border: '1px solid #21262D', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1rem', flexShrink: 0 }}>💡</span>
          <span style={{ color: '#8B949E', fontSize: '0.85rem', lineHeight: '1.5' }}>{step.tip}</span>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {currentStep > 0 && (
            <button onClick={() => { setCurrentStep(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              style={{ flex: 1, backgroundColor: 'transparent', color: '#E6EDF3', border: '1px solid #30363D', borderRadius: '10px', padding: '14px', fontSize: '0.95rem', cursor: 'pointer' }}>
              ← Pichla
            </button>
          )}
          <button onClick={() => markStepDone(currentStep)}
            style={{ flex: 2, backgroundColor: '#1DB954', color: '#000', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            {currentStep === totalSteps - 1 ? '🎉 Filing Complete!' : 'Ho Gaya → Agla Step'}
          </button>
        </div>

        {/* All steps overview */}
        <div style={{ marginTop: '32px', backgroundColor: '#161B22', border: '1px solid #21262D', borderRadius: '12px', padding: '16px' }}>
          <div style={{ color: '#8B949E', fontSize: '0.8rem', marginBottom: '12px' }}>📋 Sab Steps:</div>
          {steps.map((s, i) => (
            <div key={i} onClick={() => setCurrentStep(i)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', cursor: 'pointer', backgroundColor: i === currentStep ? '#1a3a2a' : 'transparent', marginBottom: '4px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: completedSteps.includes(i) ? '#1DB954' : i === currentStep ? '#21262D' : 'transparent', border: completedSteps.includes(i) ? 'none' : `1px solid ${i === currentStep ? '#1DB954' : '#30363D'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', color: completedSteps.includes(i) ? '#000' : i === currentStep ? '#1DB954' : '#8B949E', fontWeight: 'bold', flexShrink: 0 }}>
                {completedSteps.includes(i) ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '0.82rem', color: i === currentStep ? '#1DB954' : completedSteps.includes(i) ? '#8B949E' : '#E6EDF3' }}>
                {s.title.replace(`Step ${i + 1} — `, '')}
              </span>
            </div>
          ))}
        </div>

      </div>

      <footer style={{ borderTop: '1px solid #21262D', padding: '16px 24px', textAlign: 'center', color: '#8B949E', fontSize: '0.8rem', marginTop: '40px' }}>
        © 2026 TaxFiller AI — Ahmed Shehzad Tax AI | Pakistan
      </footer>
    </main>
  )
    }
