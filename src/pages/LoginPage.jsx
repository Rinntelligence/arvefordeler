import { useState } from 'react'
import { signInWithMagicLink } from '../lib/supabase'

export default function LoginPage({ onToast }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!email.trim()) return
    setLoading(true)
    const { error } = await signInWithMagicLink(email.trim())
    setLoading(false)
    if (error) { onToast('Noe gikk galt. Prøv igjen.', 'error'); return }
    setSent(true)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f7f3ee',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{ maxWidth: '420px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>🏡</div>
          <h1 style={{ fontFamily: 'Lora, serif', fontSize: '28px', fontWeight: '400', color: '#2a1f14', marginBottom: '10px' }}>
            Familiens gjenstander
          </h1>
          <p style={{ color: '#8c7b6b', fontSize: '15px', lineHeight: '1.6' }}>
            Et felles sted for familien å fordele gjenstander med kjærlighet
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e8e0d6', borderRadius: '12px', padding: '36px', boxShadow: '0 4px 32px rgba(0,0,0,0.06)' }}>
          {!sent ? (
            <>
              <h2 style={{ fontFamily: 'Lora, serif', fontSize: '20px', fontWeight: '400', color: '#2a1f14', marginBottom: '8px' }}>Logg inn</h2>
              <p style={{ color: '#8c7b6b', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
                Skriv inn e-postadressen din – du får en innloggingslenke rett i innboksen. Ingen passord!
              </p>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#8c7b6b', marginBottom: '8px' }}>E-postadresse</label>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="navn@epost.no"
                  style={{
                    width: '100%', padding: '12px 14px', border: '1px solid #e0d8d0',
                    borderRadius: '8px', fontSize: '15px', background: '#faf7f3',
                    color: '#2a1f14', outline: 'none', fontFamily: 'DM Sans, sans-serif',
                  }}
                />
              </div>
              <button onClick={handleSend} disabled={loading || !email.trim()} style={{
                width: '100%', padding: '13px', background: email.trim() ? '#2a1f14' : '#c0b8b0',
                color: '#f5f0eb', border: 'none', borderRadius: '8px',
                cursor: email.trim() ? 'pointer' : 'not-allowed',
                fontSize: '15px', fontFamily: 'DM Sans, sans-serif',
              }}>
                {loading ? 'Sender…' : 'Send innloggingslenke'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '12px', color: '#b0a090', marginTop: '20px' }}>
                Alle familiemedlemmer bruker sin egen e-post. Første gang setter du opp visningsnavnet ditt.
              </p>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>📬</div>
              <h2 style={{ fontFamily: 'Lora, serif', fontSize: '20px', fontWeight: '400', color: '#2a1f14', marginBottom: '10px' }}>Sjekk e-posten!</h2>
              <p style={{ color: '#6b5c4c', fontSize: '14px', lineHeight: '1.7' }}>
                Vi har sendt en innloggingslenke til<br />
                <strong>{email}</strong><br /><br />
                Klikk på lenken i e-posten for å komme inn. Den er gyldig i 1 time.
              </p>
              <button onClick={() => setSent(false)} style={{ marginTop: '24px', background: 'none', border: '1px solid #e0d8d0', padding: '9px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#6b5c4c', fontFamily: 'DM Sans, sans-serif' }}>
                Prøv en annen e-post
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
