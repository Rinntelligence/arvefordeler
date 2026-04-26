import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { signOut } from '../lib/supabase'

export default function TopBar({ profile, session }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const nav = (path) => { navigate(path); setMenuOpen(false) }
  const active = (path) => location.pathname === path

  return (
    <div style={{
      background: '#2a1f14', color: '#f5f0eb', height: '58px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', position: 'sticky', top: 0, zIndex: 100,
      fontFamily: 'DM Sans, sans-serif', boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
    }}>
      {/* Logo */}
      <button onClick={() => nav('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '22px' }}>🏡</span>
        <span style={{ fontFamily: 'Lora, serif', fontSize: '17px', color: '#f5f0eb', letterSpacing: '0.3px' }}>Familiens gjenstander</span>
      </button>

      {/* Nav links - desktop */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {[
          { path: '/', label: 'Oversikt' },
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/categories', label: 'Kategorier' },
        ].map(({ path, label }) => (
          <button key={path} onClick={() => nav(path)} style={{
            background: active(path) ? 'rgba(255,255,255,0.12)' : 'none',
            border: 'none', color: active(path) ? '#f5f0eb' : '#b0a090',
            padding: '7px 14px', borderRadius: '6px', cursor: 'pointer',
            fontSize: '14px', fontFamily: 'DM Sans, sans-serif',
          }}>{label}</button>
        ))}

        <button onClick={() => nav('/add')} style={{
          background: '#c4855a', border: 'none', color: '#fff',
          padding: '7px 16px', borderRadius: '6px', cursor: 'pointer',
          fontSize: '14px', fontFamily: 'DM Sans, sans-serif', marginLeft: '8px',
        }}>+ Legg til</button>

        {/* Avatar menu */}
        <div style={{ position: 'relative', marginLeft: '10px' }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: profile?.avatar_color || '#6b8fa8',
            border: '2px solid rgba(255,255,255,0.2)', cursor: 'pointer',
            fontSize: '15px', color: '#fff', fontWeight: '600', fontFamily: 'DM Sans, sans-serif',
          }}>{(profile?.display_name || session?.user?.email || '?')[0].toUpperCase()}</button>

          {menuOpen && (
            <div style={{
              position: 'absolute', top: '44px', right: 0, background: '#fff',
              border: '1px solid #e8e0d6', borderRadius: '8px', minWidth: '180px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 200,
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0ebe4' }}>
                <div style={{ fontSize: '14px', color: '#2a1f14', fontWeight: '500' }}>{profile?.display_name || 'Ukjent'}</div>
                <div style={{ fontSize: '12px', color: '#a89080', marginTop: '2px' }}>{session?.user?.email}</div>
              </div>
              {[
                { label: 'Min profil', action: () => nav('/setup') },
                { label: 'Logg ut', action: () => { signOut(); setMenuOpen(false) }, danger: true },
              ].map(({ label, action, danger }) => (
                <button key={label} onClick={action} style={{
                  display: 'block', width: '100%', padding: '11px 16px', background: 'none',
                  border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '14px',
                  color: danger ? '#c0392b' : '#2a1f14', fontFamily: 'DM Sans, sans-serif',
                }}>{label}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
