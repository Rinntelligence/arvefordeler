import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchCategories, insertItem, uploadImage } from '../lib/supabase'

export default function AddItemPage({ session, profile, onToast }) {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ title: '', category_id: '', description: '' })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories().then(({ data }) => {
      setCategories(data || [])
      if (data?.length) setForm(f => ({ ...f, category_id: data[0].id }))
    })
  }, [])

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = ev => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    setLoading(true)
    try {
      // Insert item first to get ID
      const { data: newItem, error } = await insertItem({
        title: form.title.trim(),
        category_id: form.category_id,
        description: form.description.trim(),
        added_by: session.user.id,
        added_by_name: profile?.display_name || session.user.email,
        image_url: null,
      })
      if (error) throw error

      // Upload image if present
      if (imageFile) {
        const url = await uploadImage(imageFile, newItem.id)
        await import('../lib/supabase').then(({ supabase }) =>
          supabase.from('items').update({ image_url: url }).eq('id', newItem.id)
        )
      }

      onToast('Gjenstand lagt til! ✓')
      navigate('/')
    } catch (e) {
      onToast('Noe gikk galt: ' + e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '28px 16px', fontFamily: 'DM Sans, sans-serif' }}>
      <h1 style={{ fontFamily: 'Lora, serif', fontSize: '24px', fontWeight: '400', color: '#2a1f14', marginBottom: '28px' }}>Legg til gjenstand</h1>

      <div style={{ background: '#fff', border: '1px solid #e8e0d6', borderRadius: '12px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

        {/* Image */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#8c7b6b', marginBottom: '10px' }}>Bilde</label>
          <div onClick={() => fileRef.current.click()} style={{
            height: '200px', background: '#f0ebe4', border: '2px dashed #d4c8b8', borderRadius: '10px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', overflow: 'hidden',
          }}>
            {imagePreview
              ? <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <>
                  <span style={{ fontSize: '36px', marginBottom: '10px' }}>📷</span>
                  <span style={{ fontSize: '14px', color: '#a89080' }}>Klikk for å laste opp bilde</span>
                  <span style={{ fontSize: '12px', color: '#b8ada0', marginTop: '4px' }}>JPG, PNG, WEBP</span>
                </>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
          {imagePreview && (
            <button onClick={() => { setImageFile(null); setImagePreview(null) }}
              style={{ marginTop: '8px', background: 'none', border: 'none', color: '#a89080', cursor: 'pointer', fontSize: '13px', fontFamily: 'DM Sans, sans-serif' }}>
              × Fjern bilde
            </button>
          )}
        </div>

        {/* Title */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#8c7b6b', marginBottom: '8px' }}>Navn *</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="F.eks. Bestemors gyngestol…"
            style={{ width: '100%', padding: '12px 14px', border: '1px solid #e0d8d0', borderRadius: '8px', fontSize: '15px', background: '#faf7f3', color: '#2a1f14', outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }} />
        </div>

        {/* Category */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#8c7b6b', marginBottom: '8px' }}>Kategori</label>
          <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
            style={{ width: '100%', padding: '12px 14px', border: '1px solid #e0d8d0', borderRadius: '8px', fontSize: '15px', background: '#faf7f3', color: '#2a1f14', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
          </select>
        </div>

        {/* Description */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: '#8c7b6b', marginBottom: '8px' }}>Beskrivelse</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Materiale, alder, tilstand, minner og historie…" rows={4}
            style={{ width: '100%', padding: '12px 14px', border: '1px solid #e0d8d0', borderRadius: '8px', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', background: '#faf7f3', color: '#2a1f14', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/')} style={{ flex: 1, padding: '13px', background: 'none', border: '1px solid #e0d8d0', borderRadius: '8px', cursor: 'pointer', color: '#6b5c4c', fontSize: '15px', fontFamily: 'DM Sans, sans-serif' }}>Avbryt</button>
          <button onClick={handleSave} disabled={!form.title.trim() || loading} style={{
            flex: 2, padding: '13px', background: form.title.trim() ? '#2a1f14' : '#c0b8b0',
            color: '#f5f0eb', border: 'none', borderRadius: '8px',
            cursor: form.title.trim() ? 'pointer' : 'not-allowed', fontSize: '15px', fontFamily: 'DM Sans, sans-serif',
          }}>
            {loading ? 'Lagrer…' : 'Legg til gjenstand'}
          </button>
        </div>
      </div>
    </div>
  )
}
