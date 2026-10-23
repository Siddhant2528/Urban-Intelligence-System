import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react'
import { useState } from 'react'

type LoginPageProps = {
  onLoginSuccess: (officerEmail: string) => void
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (u?: string, p?: string) => {
    const user = (u ?? username).trim()
    const pass = (p ?? password).trim()

    setError('')

    if (!user) {
      setError('Please enter your email or username (e.g. admin).')
      return
    }
    if (!pass) {
      setError('Please enter your password (e.g. admin).')
      return
    }

    setLoading(true)

    setTimeout(() => {
      // Easy credentials: supports 'admin' / 'admin', 'admin' / '1234', or any credentials >= 2 characters
      if (
        (user.toLowerCase() === 'admin' && (pass.toLowerCase() === 'admin' || pass === '1234' || pass.length >= 2)) ||
        (user.length >= 2 && pass.length >= 2)
      ) {
        onLoginSuccess(user.includes('@') ? user : `${user}@nashik.gov.in`)
      } else {
        setLoading(false)
        setError('Please enter valid credentials (e.g. admin / admin).')
      }
    }, 300)
  }

  const handleQuickAccess = () => {
    setLoading(true)
    setTimeout(() => {
      onLoginSuccess('admin@nashik.gov.in')
    }, 250)
  }

  return (
    <div className="uis-canvas-root">
      {/* ── TOP GOVERNMENT HEADER ──────────────────────────── */}
      <header className="uis-exact-header">
        {/* Left: Emblem of India & Government info */}
        <div className="uis-header-left">
          <img
            src="/national-emblem.png"
            alt="Government of India Emblem"
            className="uis-emblem-img"
          />
          <div className="uis-gov-titles">
            <span className="uis-gov-main">Government of Maharashtra</span>
            <span className="uis-gov-sub">Nashik Municipal Corporation</span>
          </div>
        </div>

        {/* Center: Smart City Mission + UIS Branding */}
        <div className="uis-header-center">
          <img
            src="/smart-city-logo.png"
            alt="Smart City Mission Transformation"
            className="uis-smart-city-img"
          />
          <div className="uis-center-divider" />
          <div className="uis-system-titles">
            <h1 className="uis-app-acronym">UIS</h1>
            <span className="uis-app-desc">
              Urban Intelligence System · GIS & Spatial Management
            </span>
          </div>
        </div>
      </header>

      {/* ── IMMERSIVE DOUBLE-EXPOSURE STAGE (NO HARSH CUTS) ── */}
      <main className="uis-double-exposure-stage">
        {/* 1. Base Exposure: Panoramic High-Res Cityscape */}
        <div className="uis-de-panorama-wrap">
          <img
            src="/nashik-smart-city-photo.jpg"
            alt="Nashik Smart City Panoramic Landscape"
            className="uis-de-base-img"
          />

          {/* 2. Cyber-GIS Digital Twin Exposure Overlay (mix-blend-mode: screen) */}
          <div className="uis-de-cyber-overlay" aria-hidden="true">
            <svg
              className="uis-de-vector-svg"
              viewBox="0 0 1000 700"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern
                  id="cyberGridPattern"
                  width="50"
                  height="50"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 50 0 L 0 0 0 50"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="0.6"
                    strokeOpacity="0.25"
                  />
                  <circle cx="0" cy="0" r="1.5" fill="#38bdf8" opacity="0.65" />
                </pattern>
                <linearGradient id="neonBeam" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.75" />
                </linearGradient>
              </defs>

              {/* Wireframe Grid */}
              <rect width="100%" height="100%" fill="url(#cyberGridPattern)" />

              {/* Elevation Contour Curves */}
              <path
                d="M -50,260 Q 200,200 480,290 T 1050,230"
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="1.8"
                strokeDasharray="8,5"
                opacity="0.8"
              />
              <path
                d="M -50,360 Q 240,300 560,390 T 1050,330"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="10,6"
                opacity="0.85"
              />
              <path
                d="M -50,470 Q 300,400 640,490 T 1050,430"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.5"
                opacity="0.75"
              />

              {/* Bridge Transit Light Streams */}
              <path
                d="M 120,530 Q 480,430 780,380"
                fill="none"
                stroke="url(#neonBeam)"
                strokeWidth="4"
                filter="drop-shadow(0 0 12px #2dd4bf)"
                opacity="0.95"
              />
              <path
                d="M 170,550 Q 520,448 820,398"
                fill="none"
                stroke="#67e8f9"
                strokeWidth="2.2"
                filter="drop-shadow(0 0 8px #38bdf8)"
                opacity="0.9"
              />
            </svg>

            {/* Subtle Sweeping Scanning Laser */}
            <div className="uis-de-scanner-beam" />
          </div>

          {/* 3. Prismatic Atmospheric Double-Exposure Light Wash */}
          <div className="uis-de-chromatic-wash" aria-hidden="true" />

          {/* 4. Natural Atmospheric Mist Dissolve to Right (Zero Harsh Knife Cuts!) */}
          <div className="uis-de-soft-dissolve" aria-hidden="true" />


        </div>

        {/* ── FLOATING EXECUTIVE GLASSMORPHIC LOGIN TERMINAL ── */}
        <div className="uis-terminal-floating-container">
          <div className="uis-glass-card">
            {/* Login Card Header */}
            <div className="uis-card-top-row">
              <div className="uis-heading-cluster">
                <User size={24} className="uis-login-icon" />
                <h2 className="uis-login-title">Login</h2>
              </div>
              <span className="uis-terminal-tag">OFFICER ACCESS</span>
            </div>

            {error && (
              <div className="uis-error-toast" role="alert">
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleLogin()
              }}
              className="uis-glass-form"
            >
              {/* Field 1: Email / Username */}
              <div className="uis-input-box">
                <Mail size={16} className="uis-input-icon-left" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Email or username (e.g. admin)"
                  autoComplete="username"
                  className="uis-text-field"
                  required
                />
                <User size={16} className="uis-input-icon-right" />
              </div>

              {/* Field 2: Password */}
              <div className="uis-input-box">
                <Lock size={16} className="uis-input-icon-left" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (e.g. admin)"
                  autoComplete="current-password"
                  className="uis-text-field"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="uis-toggle-btn"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="uis-submit-cta"
              >
                {loading ? 'Authenticating…' : 'Login'}
              </button>

              {/* Quick Access Option */}
              <div className="uis-quick-access-wrap">
                <button
                  type="button"
                  onClick={handleQuickAccess}
                  disabled={loading}
                  className="uis-quick-access-pill"
                  title="One-click demo login without typing"
                >
                  <ShieldCheck size={14} className="text-teal-600" />
                  <span>Quick Access (One-Click Login)</span>
                </button>
              </div>

              {/* Credentials Helper Note */}
              <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '11px', color: '#64748b' }}>
                Easy credentials: <strong style={{ color: '#0f766e' }}>admin</strong> / <strong style={{ color: '#0f766e' }}>admin</strong>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Right Watermark (Smarter Cities A Better Tomorrow) */}
        <div className="uis-bottom-slogan">
          <Sparkles size={14} className="text-teal-600" />
          <div className="uis-slogan-text">
            <span className="uis-slogan-title">Smarter Cities</span>
            <span className="uis-slogan-sub">A Better Tomorrow</span>
          </div>
        </div>
      </main>
    </div>
  )
}
