import { useEffect, useState } from 'react'
import { fetchCategories, insertCategory, deleteCategory } from '../lib/supabase'

const EMOJIS = ['🏺','🛋️','🖼️','📚','🍳','📺','🧣','📦','🪑','🛏️','🪞','🎨','🎻','⌚','💍','🪴','🧸','🎁','🗝️','📷','🪆','🧩','🍷','🥂','🎭','🏮','🕰️','🪵','🧺','🪤']

export default function CategoriesPage({ session, onToast }) {
  const [categories, setCategories] = useState([])
  const [newLabel, setNewLabel] = useState('')
  const [newEmoji, setNewEmoji] = useState('📦')
  const [showPicker, setShowPicker] = useState(false)
  const [loading, setLoading] = useState(false)

  const load = () => fetchCategories().then(({ data }) => setCategories(data || []))
  useEffect(() => { load() }, [])

  const add = async () => {
    if (!newLabel.trim()) return
    setLoading(true)
    const { error } = await insertCategory({ label: newLabel.trim(), emoji: newEmoji })
    if (error) { onToast('Feil: ' + error.message, 'error') }
    else { onToast('Kategori lagt til!'); setNewLabel(''); setNewEmoji('📦'); load() }
    setLoading(false)
  }

  const remove = async (id) => {
    await deleteCategory(id)
    onToast('Kategori slettet')
    load()
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '28px 16px', fontFamily: 'DM Sans, sans-serif' }}>
      <h1 style={{ fontFamily: 'Lora, serif', fontSize: '24px', fontWeight: '400', color: '#2a1f14', marginBottom: '28px' }}>Kategorier</h1>

      {/* Add new */}
      <div style={{ background: '#fff', border: '1px solid #e8e0d6', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
        <p style={{ fontSize: '13px', color: '#8c7b6b', marginBottom: '14px' }}>Legg til ny kategori:</p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: showPicker ? '12px' : '0' }}>
          <button onClick={() => setShowPicker(!showPicker)} style={{ padding: '11px 16px', border: '1px solid #e0d8d0', borderRadius: '8px', background: '#faf7f3', cursor: 'pointer', fontSize: '22px' }}>{newEmoji}</button>
          <input value={newLabel} onChange={e => setNewLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="Kategorinavn…"
            style={{ flex: 1, padding: '11px 14px', border: '1px solid #e0d8d0', borderRadius: '8px', fontSize: '15px', background: '#faf7f3', color: '#2a1f14', outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
          <button onClick={add} disabled={!newLabel.trim() || loading} style={{
            padding: '11px 18px', background: newLabel.trim() ? '#2a1f14' : '#c0b8b0',
            color: '#f5f0eb', border: 'none', borderRadius: '8px', cursor: newLabel.trim() ? 'pointer' : 'not-allowed',
            fontSize: '15px', fontFamily: 'DM Sans, sans-serif',
          }}>+</button>
        </div>
        {showPicker && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '14px', background: '#f5f0eb', borderRadius: '8px' }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => { setNewEmoji(e); setShowPicker(false) }}
                style={{ fontSize: '22px', background: newEmoji === e ? '#e0d8d0' : 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}>{e}</button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      <div style={{ background: '#fff', border: '1px solid #e8e0d6', borderRadius: '12px', overflow: 'hidden' }}>
        {categories.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#a89080' }}>Ingen kategorier ennå.</div>
        ) : categories.map((c, i) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: i < categories.length - 1 ? '1px solid #f0ebe4' : 'none' }}>
            <span style={{ fontSize: '22px', marginRight: '14px' }}>{c.emoji}</span>
            <span style={{ flex: 1, fontSize: '15px', color: '#2a1f14' }}>{c.label}</span>
            <button onClick={() => remove(c.id)} style={{ background: 'none', border: 'none', color: '#c0a090', cursor: 'pointer', fontSize: '20px', padding: '4px 8px' }}>×</button>
          </div>
        ))}
      </div>
    </div>
  )
}
