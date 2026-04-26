import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, addInterest, removeInterest, deleteItem, fetchCategories } from '../lib/supabase'

export default function ItemDetailPage({ session, profile, onToast }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [reason, setReason] = useState('')
  const [showReason, setShowReason] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const load = async () => {
    const [{ data: it }, { data: cats }] = await Promise.all([
      supabase.from('items').select('*, interests(*, profiles(display_name, avatar_color))').eq('id', id).single(),
      fetchCategories(),
    ])
    setItem(it)
    setCategories(cats || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const channel = supabase.channel(`item-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interests', filter: `item_id=eq.${id}` }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [id])

  if (loading) return <PageShell onBack={() => navigate('/')}><div style={{ padding: '80px', textAlign: 'center', color: '#a89080' }}>Laster…</div></PageShell>
  if (!item) return <PageShell onBack={() => navigate('/')}><div style={{ padding: '80px', textAlign: 'center', color: '#a89080' }}>Ikke funnet.</div></PageShell>

  const cat = categories.find(c => c.id === item.category_id) || { emoji: '📦', label: 'Annet' }
  const myInterest = item.interests?.find(x => x.user_id === session.user.id)

  const handleInterest = async () => {
    if (myInterest) {
      await removeInterest(item.id, session.user.id)
      onToast('Interesse trukket tilbake')
      load()
      return
    }
    if (!showReason) { setShowReason(true); return }
    await addInterest(item.id, session.user.id, reason)
    onToast('Interesse registrert! ✓')
    setShowReason(false)
    setReason('')
    load()
  }

  const handleDelete = async () => {
    await deleteItem(item.id)
    onToast('Gjenstand slettet')
    navigate('/')
  }

  return (
    <PageShell onBack={() => navigate('/')}>
      <div style={{ maxWidth: '660px', margin: '0 auto', padding: '28px 16px', fontFamily: 'DM Sans, sans-serif' }}>
        {/* Image */}
        <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '24px', background: '#f0ebe4', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {item.image_url
            ? <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: '90px' }}>{cat.emoji}</span>}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e8e0d6', borderRadius: '12px', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <h1 style={{ fontFamily: 'Lora, serif', fontSize: '24px', fontWeight: '400', color: '#2a1f14', margin: 0 }}>{item.title}</h1>
            <span style={{ fontSize: '12px', color: '#a89080', background: '#f5f0eb', padding: '4px 12px', borderRadius: '20px', marginLeft: '12px', whiteSpace: 'nowrap' }}>{cat.emoji} {cat.label}</span>
          </div>
          <p style={{ color: '#a89080', fontSize: '13px', marginBottom: '20px' }}>
            Lagt inn av {item.added_by_name || 'ukjent'} · {new Date(item.created_at).toLocaleDateString('no-NO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          {item.description && <p style={{ color: '#4a3c30', lineHeight: '1.8', marginBottom: '28px', fontSize: '15px' }}>{item.description}</p>}

          {/* Interest section */}
          {myInterest ? (
            <button onClick={handleInterest} style={{
              width: '100%', padding: '14px', background: '#f0ebe4', color: '#2a1f14',
              border: '1px solid #2a1f14', borderRadius: '10px', cursor: 'pointer',
              fontSize: '15px', fontFamily: 'DM Sans, sans-serif', marginBottom: '28px',
            }}>✓ Du er interessert – klikk for å trekke tilbake</button>
          ) : showReason ? (
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#6b5c4c', marginBottom: '10px' }}>
                Hvorfor ønsker du denne gjenstanden? <span style={{ color: '#a89080' }}>(valgfritt, men synlig for alle)</span>
              </label>
              <textarea value={reason} onChange={e => setReason(e.target.value)}
                placeholder="F.eks: Husker dette fra barndomshjemmet, det betyr mye for meg…"
                rows={3} style={{
                  width: '100%', padding: '12px 14px', border: '1px solid #e0d8d0', borderRadius: '8px',
                  fontSize: '14px', fontFamily: 'DM Sans, sans-serif', color: '#2a1f14', background: '#faf7f3',
                  resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                }} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button onClick={() => setShowReason(false)} style={{ flex: 1, padding: '12px', background: 'none', border: '1px solid #e0d8d0', borderRadius: '8px', cursor: 'pointer', color: '#6b5c4c', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' }}>Avbryt</button>
                <button onClick={handleInterest} style={{ flex: 2, padding: '12px', background: '#2a1f14', color: '#f5f0eb', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' }}>Meld interesse</button>
              </div>
            </div>
          ) : (
            <button onClick={handleInterest} style={{
              width: '100%', padding: '14px', background: '#2a1f14', color: '#f5f0eb',
              border: 'none', borderRadius: '10px', cursor: 'pointer',
              fontSize: '15px', fontFamily: 'DM Sans, sans-serif', marginBottom: '28px',
            }}>Meld interesse</button>
          )}

          {/* Interested people */}
          <div style={{ borderTop: '1px solid #f0ebe4', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '13px', color: '#a89080', fontWeight: '400', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
              Interesserte ({item.interests?.length || 0})
            </h3>
            {!item.interests?.length ? (
              <p style={{ color: '#c0b0a0', fontSize: '14px', fontStyle: 'italic' }}>Ingen har meldt interesse ennå.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {item.interests.map(x => (
                  <div key={x.id} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px 16px', background: '#faf7f3', border: '1px solid #e8e0d6', borderRadius: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: x.profiles?.avatar_color || '#8c7b6b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#fff', fontWeight: '600', flexShrink: 0 }}>
                      {(x.profiles?.display_name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', color: '#2a1f14', marginBottom: '4px', fontWeight: '500' }}>
                        {x.profiles?.display_name}
                        {x.user_id === session.user.id && <span style={{ color: '#a89080', fontSize: '12px', fontWeight: '400', marginLeft: '6px' }}>(deg)</span>}
                      </div>
                      {x.reason && <div style={{ fontSize: '13px', color: '#6b5c4c', fontStyle: 'italic', lineHeight: 1.6 }}>"{x.reason}"</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delete */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #f0ebe4' }}>
            {!confirmDelete
              ? <button onClick={() => setConfirmDelete(true)} style={{ background: 'none', border: 'none', color: '#c0a090', cursor: 'pointer', fontSize: '13px', fontFamily: 'DM Sans, sans-serif' }}>Slett gjenstand…</button>
              : <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#6b5c4c' }}>Er du sikker? Dette kan ikke angres.</span>
                  <button onClick={handleDelete} style={{ padding: '7px 16px', background: '#c0392b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'DM Sans, sans-serif' }}>Slett</button>
                  <button onClick={() => setConfirmDelete(false)} style={{ padding: '7px 16px', background: 'none', border: '1px solid #e0d8d0', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', color: '#6b5c4c' }}>Avbryt</button>
                </div>
            }
          </div>
        </div>
      </div>
    </PageShell>
  )
}

function PageShell({ onBack, children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f7f3ee' }}>
      {children}
    </div>
  )
}
