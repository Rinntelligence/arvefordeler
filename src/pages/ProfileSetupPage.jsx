import { useState } from 'react'
import { upsertProfile } from '../lib/supabase'

const COLORS = ['#c4855a','#6b8fa8','#7aaa7a','#b87ab8','#c4b06a','#6ab8b8','#c46a6a','#8a8ac4','#a8856a','#6aa878']

export default function ProfileSetupPage({ session, onSaved, onToast }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)

  const save = async () => {
    if (!name.trim()) return
    setLoading(true)
    const { data, error } = await upsertProfile({
      user_id: session.user.id,
      display_name: name.trim(),
      avatar_color: color,
      email: session.user.email,
    })
    setLoading(false)
    if (error) { onToast('Noe gikk galt', 'error'); return }
    onSaved(data)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f3ee', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: '400px', width: '100%', background: '#fff', border: '1px solid #e8e0d6', borderRadius: '12px', padding: '36px', boxShadow: '0 4px 32px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontFamily: 'Lora, serif', fontSize: '22px', fontWeight: '400', color: '#2a1f14', marginBottom: '8px' }}>Velkommen! 👋</h2>
        <p style={{ color: '#8c7b6b', fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>Sett opp profilen din så familien vet hvem du er.</p>

        {/* Avatar preview */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: '#fff', fontWeight: '600', transition: 'background 0.2s' }}>
            {name ? name[0].toUpperCase() : '?'}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#8c7b6b', marginBottom: '8px' }}>Visningsnavn</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="F.eks. Marte"
            style={{ width: '100%', padding: '12px 14px', border: '1px solid #e0d8d0', borderRadius: '8px', fontSize: '15px', background: '#faf7f3', color: '#2a1f14', outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
        </div>

        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#8c7b6b', marginBottom: '10px' }}>Velg din farge</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} style={{
                width: '36px', height: '36px', borderRadius: '50%', background: c, border: color === c ? '3px solid #2a1f14' : '3px solid transparent',
                cursor: 'pointer', transition: 'border 0.15s',
              }} />
            ))}
          </div>
        </div>

        <button onClick={save} disabled={!name.trim() || loading} style={{
          width: '100%', padding: '13px', background: name.trim() ? '#2a1f14' : '#c0b8b0',
          color: '#f5f0eb', border: 'none', borderRadius: '8px',
          cursor: name.trim() ? 'pointer' : 'not-allowed', fontSize: '15px', fontFamily: 'DM Sans, sans-serif',
        }}>
          {loading ? 'Lagrer…' : 'Kom i gang →'}
        </button>
      </div>
    </div>
  )
}
