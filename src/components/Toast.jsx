export default function Toast({ msg, type = 'success' }) {
  return (
    <div style={{
      position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
      background: type === 'error' ? '#c0392b' : '#2a1f14',
      color: '#f5f0eb', padding: '11px 28px', borderRadius: '8px',
      fontSize: '14px', zIndex: 999, boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
      fontFamily: 'DM Sans, sans-serif', animation: 'fadeUp 0.2s ease',
      whiteSpace: 'nowrap',
    }}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateX(-50%) translateY(8px) } to { opacity:1; transform:translateX(-50%) translateY(0) } }`}</style>
      {msg}
    </div>
  )
}
