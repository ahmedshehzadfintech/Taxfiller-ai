'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function IrisGuide() {
  const [currentStep, setCurrentStep] = useState(0)
  const [confirmed, setConfirmed] = useState(false)
  const [copied, setCopied] = useState(false)
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

  const steps = [
    {
      title: 'Iris Website Kholen',
      instruction: 'Apne browser mein ye website kholen:',
      value: 'iris.fbr.gov.pk',
      copyable: true,
      screenshot: '🌐',
      screenshotDesc: 'Browser mein naya tab khol kar upar address bar mein ye link likhein',
      tip: '💡 Chrome ya Firefox use karein behtar experience ke liye'
    },
    {
      title: 'Iris Mein Login Karein',
      instruction: 'CNIC aur password se login karein:',
      value: 'Apna CNIC number (dashes ke bina)',
      copyable: false,
      screenshot: '🔐',
      screenshotDesc: 'Login page par CNIC field mein apna CNIC daalen, phir password daalen',
      tip: '💡 Agar password yaad nahi to "Forgot Password" use karein'
    },
    {
      title: 'Returns Tab Click Karein',
      instruction: 'Login ke baad upar menu mein:',
      value: 'Returns → Normal Return',
      copyable: true,
      screenshot: '📋',
      screenshotDesc: 'Upar navigation mein "Returns" click karein, phir dropdown mein "Normal Return" select karein',
      tip: '💡 Agar Returns nahi dikh raha to page refresh karein'
    },
    {
      title: 'Tax Year Select Karein',
      instruction: 'New return form mein tax year:',
      value: '2026',
      copyable: true,
      screenshot: '📅',
      screenshotDesc: 'Tax Year ki dropdown mein "2026" select karein — ye 2025-26 ka return hai',
      tip: '💡 Tax Year 2026 = July 2025 to June 2026 ki income'
    },
    {
      title: 'Salary Income Fill Karein',
      instruction: 'Income section mein apni salary:',
      value: 'AI ne calculate ki hui amount yahan aayegi',
      copyable: true,
      screenshot: '💰',
      screenshotDesc: 'Salary/Wages field mein apni total annual income likhein — copy karein aur paste karein',
      tip: '💡 Annual income = maheena tankhwah × 12'
    },
    {
      title: 'Withholding Tax Fill Karein',
      instruction: 'Tax already paid section mein:',
      value: 'Employer ne kata hua tax amount',
      copyable: true,
      screenshot: '🏦',
      screenshotDesc: 'Withholding Tax field mein vo amount likhein jo employer ne pehle se kaat li hai',
      tip: '💡 Ye amount aapki salary slip ya tax certificate mein hoti hai'
    },
    {
      title: 'Return Verify Karein',
      instruction: 'Submit se pehle sab check karein:',
      value: 'Verify & Submit button',
      copyable: false,
      screenshot: '✔️',
      screenshotDesc: 'Pehle "Verify" button click karein — koi error nahi aana chahiye — phir "Submit" click karein',
      tip: '💡 Agar koi error aaye to wapas us field par jayein aur theek karein'
    },
    {
      title: 'Acknowledgment Save Karein',
      instruction: 'Submit ke baad acknowledgment milegi:',
      value: 'Download / Print Acknowledgment',
      copyable: false,
      screenshot: '🎉',
      screenshotDesc: 'Acknowledgment number note karein ya PDF download karein — ye proof hai ke return file ho gaya',
      tip: '💡 Ye document safe rakhein — future mein kaam aayega'
    },
  ]

  const totalSteps = steps.length
  const step = steps[currentStep]
  const progress = Math.round(((currentStep) / totalSteps) * 100)
  const isLastStep = currentStep === totalSteps - 1

  const handleCopy = () => {
    navigator.clipboard.writeText(step.value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleNext = () => {
    if (!confirmed) return
    setCurrentStep(prev => prev + 1)
    setConfirmed(false)
    setCopied(false)
    window.scrollTo(0, 0)
  }

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1)
    setConfirmed(false)
    setCopied(false)
    window.scrollTo(0, 0)
  }

  if (isLastStep && confirmed) {
    return (
      <main style={{
        backgroundColor: '#0D1117',
        minHeight: '100vh',
        fontFamily: 'sans-serif',
        color: '#E6EDF3',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '5rem', marginBottom: '24px' }}>🎉</div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#1DB954',
          marginBottom: '16px'
        }}>
          Mubarak Ho!
        </h1>
        <p style={{
          color: '#8B949E',
          fontSize: '1rem',
          lineHeight: '1.7',
          maxWidth: '400px',
          marginBottom: '32px'
        }}>
          Aapki FBR tax return successfully file ho gayi!<br />
          Acknowledgment zaroor save kar lein.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/" style={{
            backgroundColor: '#1DB954',
            color: '#000',
            borderRadius: '10px',
            padding: '14px 28px',
            fontWeight: 'bold',
            textDecoration: 'none',
            fontSize: '1rem'
          }}>
            🏠 Home Jayein
          </a>
          <a href="/chat" style={{
            backgroundColor: 'transparent',
            color: '#E6EDF3',
            border: '1px solid #30363D',
            borderRadius: '10px',
            padding: '14px 28px',
            textDecoration: 'none',
            fontSize: '1rem'
          }}>
            💬 Chat Dekhen
          </a>
        </div>
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
        padding: '16px 24px',
        borderBottom: '1px solid #21262D',
        backgroundColor: '#161B22'
      }}>
        <div style={{ color: '#1DB954', fontSize: '1.2rem', fontWeight: 'bold' }}>
          TaxFiller AI
        </div>
        <div style={{ color: '#8B949E', fontSize: '0.85rem' }}>
          Iris Filing Guide
        </div>
      </nav>

      {/* PROGRESS BAR */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <span style={{ color: '#8B949E', fontSize: '0.85rem' }}>
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span style={{ color: '#1DB954', fontSize: '0.85rem', fontWeight: 'bold' }}>
            {progress}%
          </span>
        </div>
        <div style={{
          backgroundColor: '#21262D',
          borderRadius: '10px',
          height: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            backgroundColor: '#1DB954',
            height: '100%',
            width: `${progress}%`,
            borderRadius: '10px',
            transition: 'width 0.4s ease'
          }} />
        </div>
      </div>

      {/* CONTENT */}
      <div style={{
        flex: 1,
        padding: '24px',
        maxWidth: '600px',
        margin: '0 auto',
        width: '100%'
      }}>

        {/* STEP TITLE */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: '#1DB954',
            color: '#000',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            {currentStep + 1}
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: 0 }}>
            {step.title}
          </h2>
        </div>

        {/* SCREENSHOT PLACEHOLDER */}
        <div style={{
          backgroundColor: '#161B22',
          border: '2px dashed #30363D',
          borderRadius: '16px',
          padding: '40px 24px',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>
            {step.screenshot}
          </div>
          <p style={{
            color: '#8B949E',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            margin: 0
          }}>
            {step.screenshotDesc}
          </p>
          <div style={{
            marginTop: '12px',
            color: '#30363D',
            fontSize: '0.8rem'
          }}>
            📸 Screenshot yahan aayega
          </div>
        </div>

        {/* INSTRUCTION */}
        <div style={{
          backgroundColor: '#161B22',
          border: '1px solid #21262D',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px'
        }}>
          <p style={{
            color: '#8B949E',
            fontSize: '0.9rem',
            marginBottom: '12px',
            margin: '0 0 12px'
          }}>
            {step.instruction}
          </p>

          {/* VALUE + COPY */}
          <div style={{
            backgroundColor: '#0D1117',
            border: '1px solid #30363D',
            borderRadius: '8px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <span style={{
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#1DB954',
              flex: 1
            }}>
              {step.value}
            </span>
            {step.copyable && (
              <button
                onClick={handleCopy}
                style={{
                  backgroundColor: copied ? '#1a3a2a' : '#21262D',
                  color: copied ? '#1DB954' : '#E6EDF3',
                  border: `1px solid ${copied ? '#1DB954' : '#30363D'}`,
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  flexShrink: 0,
                  transition: 'all 0.2s'
                }}>
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            )}
          </div>
        </div>

        {/* TIP */}
        <div style={{
          backgroundColor: '#161B22',
          border: '1px solid #21262D',
          borderRadius: '10px',
          padding: '14px 16px',
          marginBottom: '24px',
          color: '#8B949E',
          fontSize: '0.85rem',
          lineHeight: '1.5'
        }}>
          {step.tip}
        </div>

        {/* CONFIRM */}
        <div
          onClick={() => setConfirmed(!confirmed)}
          style={{
            backgroundColor: confirmed ? '#1a3a2a' : '#161B22',
            border: `2px solid ${confirmed ? '#1DB954' : '#30363D'}`,
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            transition: 'all 0.2s'
          }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            border: `2px solid ${confirmed ? '#1DB954' : '#8B949E'}`,
            backgroundColor: confirmed ? '#1DB954' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '0.9rem'
          }}>
            {confirmed && '✓'}
          </div>
          <span style={{
            fontSize: '0.95rem',
            color: confirmed ? '#1DB954' : '#E6EDF3',
            fontWeight: confirmed ? 'bold' : 'normal'
          }}>
            Maine ye step kar liya ✓
          </span>
        </div>

        {/* NAVIGATION BUTTONS */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {currentStep > 0 && (
            <button
              onClick={handlePrev}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                color: '#E6EDF3',
                border: '1px solid #30363D',
                borderRadius: '10px',
                padding: '14px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}>
              ← Pichla Step
            </button>
          )}
          <button
            onClick={isLastStep ? () => setConfirmed(true) : handleNext}
            disabled={!confirmed}
            style={{
              flex: 2,
              backgroundColor: confirmed ? '#1DB954' : '#21262D',
              color: confirmed ? '#000' : '#8B949E',
              border: 'none',
              borderRadius: '10px',
              padding: '14px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: confirmed ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}>
            {isLastStep ? '🎉 Filing Complete!' : 'Agla Step →'}
          </button>
        </div>

      </div>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid #21262D',
        padding: '16px 24px',
        textAlign: 'center',
        color: '#8B949E',
        fontSize: '0.8rem'
      }}>
        © 2026 TaxFiller AI — Ahmed Shehzad Tax AI | Pakistan
      </footer>

    </main>
  )
        }
