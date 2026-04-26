import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchItems, fetchCategories, supabase } from '../lib/supabase'

export default function HomePage({ session, profile }) {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [filterCat, setFilterCat] = useState('alle')
  const [filterMine, setFilterMine] = useState(false)
  const [filterUnwanted, setFilterUnwanted] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = async () => {
    const [{ data: its }, { data: cats }] = await Promise.all([fetchItems(), fetchCategories()])
    setItems(its || [])
    setCategories(cats || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // Real-time subscription
    const channel = supabase.channel('items-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interests' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const getCat = (id) => categories.find(c => c.id === id) || { label: id, emoji: '📦' }

  const filtered = items.filter(item => {
    if (filterCat !== 'alle' && item.category_id !== filterCat) return false
    if (filterMine && !item.interests?.some(x => x.user_id === session.user.id)) return false
    if (filterUnwanted && item.interests?.length > 0) return false
    return true
  })

  const myCount = items.filter(i => i.interests?.some(x => x.user_id === session.user.id)).length
  const contested = items.filter(i => i.interests?.length > 1).length
  const unwanted = items.filter(i => i.interests?.length === 0).length

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 16px', fontFamily: 'DM Sans, sans-serif' }}>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {[
          { v: items.length, l: 'Gjenstander totalt', emoji: '📦' },
          { v: myCount, l: 'Mine interesser', emoji: '❤️' },
          { v: contested, l: 'Ettertraktede', emoji: '🔥', warn: contested > 0 },
          { v: unwanted, l: 'Ingen vil ha', emoji: '😔' },
        ].map(s => (
          <div key={s.l} onClick={s.l === 'Ingen vil ha' ? () => setFilterUnwanted(!filterUnwanted) : undefined}
            style={{
              flex: 1, minWidth: '110px', background: '#fff', border: `1px solid ${s.warn ? '#e8c4a0' : '#e8e0d6'}`,
              borderRadius: '10px', padding: '16px 18px', cursor: s.l === 'Ingen vil ha' ? 'pointer' : 'default',
              background: filterUnwanted && s.l === 'Ingen vil ha' ? '#fef3e8' : '#fff',
            }}>
            <div style={{ fontSize: '22px', marginBottom: '2px' }}>{s.emoji}</div>
            <div style={{ fontSize: '26px', color: s.warn ? '#c4855a' : '#2a1f14', fontFamily: 'Lora, serif', fontWeight: '400' }}>{s.v}</div>
            <div style={{ fontSize: '12px', color: '#a89080', marginTop: '2px' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          style={{ flex: 1, minWidth: '150px', padding: '9px 12px', border: '1px solid #e0d8d0', borderRadius: '8px', fontSize: '14px', background: '#fff', color: '#2a1f14', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}>
          <option value="alle">Alle kategorier</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
        </select>

        <button onClick={() => setFilterMine(!filterMine)} style={{
          padding: '9px 16px', border: '1px solid #e0d8d0', borderRadius: '8px', fontSize: '14px', cursor: 'pointer',
          background: filterMine ? '#2a1f14' : '#fff', color: filterMine ? '#f5f0eb' : '#2a1f14', fontFamily: 'DM Sans, sans-serif',
        }}>
          {filterMine ? '✓ ' : ''}Mine interesser
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#a89080' }}>Laster gjenstander…</div>
      ) : filtered.length === 0 ? (
        <Empty onAdd={() => navigate('/add')} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {filtered.map(item => (
            <ItemCard key={item.id} item={item} categories={categories} userId={session.user.id}
              onClick={() => navigate(`/item/${item.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

function ItemCard({ item, categories, userId, onClick }) {
  const cat = categories.find(c => c.id === item.category_id) || { emoji: '📦', label: 'Annet' }
  const myInterest = item.interests?.some(x => x.user_id === userId)
  const count = item.interests?.length || 0
  const hot = count > 1

  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer',
      border: myInterest ? '2px solid #2a1f14' : '1px solid #e8e0d6',
      transition: 'transform 0.15s, box-shadow 0.15s',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.10)' }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
      {/* Image */}
      <div style={{ height: '150px', background: '#f0ebe4', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
        {item.image_url
          ? <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '52px' }}>{cat.emoji}</span>}
        {hot && <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#c4855a', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '20px' }}>🔥 Ettertraktet</span>}
      </div>
      <div style={{ padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
          <div style={{ fontSize: '15px', color: '#2a1f14', flex: 1 }}>{item.title}</div>
          <span style={{ fontSize: '11px', color: '#a89080', background: '#f5f0eb', padding: '2px 8px', borderRadius: '20px', marginLeft: '8px', whiteSpace: 'nowrap' }}>{cat.emoji}</span>
        </div>
        {item.description && (
          <div style={{ fontSize: '13px', color: '#6b5c4c', lineHeight: 1.5, marginBottom: '10px',
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {item.description}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '3px' }}>
            {(item.interests || []).slice(0, 5).map(x => (
              <div key={x.id} title={x.profiles?.display_name} style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: x.profiles?.avatar_color || '#8c7b6b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', color: '#fff', fontWeight: '600',
              }}>{(x.profiles?.display_name || '?')[0].toUpperCase()}</div>
            ))}
            {count === 0 && <span style={{ fontSize: '12px', color: '#c0b0a0', fontStyle: 'italic' }}>Ingen ennå</span>}
          </div>
          {myInterest && <span style={{ fontSize: '11px', color: '#2a1f14', background: '#f0ebe4', padding: '3px 10px', borderRadius: '20px' }}>✓ Interessert</span>}
        </div>
      </div>
    </div>
  )
}

function Empty({ onAdd }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: '#a89080' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>📦</div>
      <p style={{ fontSize: '16px', marginBottom: '20px' }}>Ingen gjenstander ennå.</p>
      <button onClick={onAdd} style={{ padding: '12px 28px', background: '#2a1f14', color: '#f5f0eb', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontFamily: 'DM Sans, sans-serif' }}>
        Legg til første gjenstand
      </button>
    </div>
  )
}
