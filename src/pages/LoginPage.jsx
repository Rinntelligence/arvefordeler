import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage({ onToast }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) return
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password })
      if (error) { onToast(norwegianError(error.message), 'error'); setLoading(false); return }
      const { error: loginErr } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (loginErr) { onToast('Konto opprettet! Logg inn.', 'success'); setMode('login') }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) { onToast(norwegianError(error.message), 'error') }
    }
    setLoading(false)
  }

  const norwegianError = (msg) => {
    if (msg.includes('Invalid login')) return 'Feil e-post eller passord'
    if (msg.includes('already registered')) return 'E-posten er allerede registrert – prøv å logg inn'
    if (msg.includes('Password should')) return 'Passordet må være minst 6 tegn'
    return msg
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f7f3ee',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>🏡</div>
          <h1 style={{ fontFamily: 'Lora, serif', fontSize: '28px', fontWeight: '400', color: '#2a1f14', marginBottom: '10px' }}>
            Familiens gjenstander
          </h1>
          <p style={{ color: '#8c7b6b', fontSize: '15px', lineHeight: '1.6' }}>
            Et felles sted for familien å fordele gjenstander
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e8e0d6', borderRadius: '12px', padding: '36px', boxShadow: '0 4px 32px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', background: '#f5f0eb', borderRadius: '8px', padding: '4px', marginBottom: '28px' }}>
            {[['login', 'Logg inn'], ['signup', 'Opprett konto']].map(([m, label]) => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '9px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                background: mode === m ? '#fff' : 'transparent',
                color: mode === m ? '#2a1f14' : '#8c7b6b',
                fontSize: '14px', fontFamily: 'DM Sans, sans-serif',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}>{label}</button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#8c7b6b', marginBottom: '6px' }}>E-postadresse</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="navn@epost.no" onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{ width: '100%', padding: '12px 14px', border: '1px solid #e0d8d0', borderRadius: '8px', fontSize: '15px', background: '#faf7f3', color: '#2a1f14', outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#8c7b6b', marginBottom: '6px' }}>Passord</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Minst 6 tegn' : '••••••••'} onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{ width: '100%', padding: '12px 14px', border: '1px solid #e0d8d0', borderRadius: '8px', fontSize: '15px', background: '#faf7f3', color: '#2a1f14', outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }} />
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading || !email.trim() || !password.trim()} style={{
            width: '100%', padding: '13px',
            background: (email.trim() && password.trim()) ? '#2a1f14' : '#c0b8b0',
            color: '#f5f0eb', border: 'none', borderRadius: '8px',
            cursor: (email.trim() && password.trim()) ? 'pointer' : 'not-allowed',
            fontSize: '15px', fontFamily: 'DM Sans, sans-serif',
          }}>
            {loading ? 'Venter…' : mode === 'login' ? 'Logg inn' : 'Opprett konto'}
          </button>

          {mode === 'login' && (
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#a89080' }}>
              Ikke registrert ennå?{' '}
              <button onClick={() => setMode('signup')} style={{ background: 'none', border: 'none', color: '#c4855a', cursor: 'pointer', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', textDecoration: 'underline' }}>
                Opprett konto
              </button>
            </p>
          )}
        </div>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#b0a090' }}>
          Hvert familiemedlem oppretter sin egen konto med e-post og passord
        </p>
      </div>
    </div>
  )
}
// updated
