import { useEffect, useState } from 'react'
import { fetchItems, fetchCategories, supabase } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const PALETTE = ['#c4855a','#6b8fa8','#7aaa7a','#b87ab8','#c4b06a','#6ab8b8','#c46a6a','#8a8ac4','#a8856a']

export default function DashboardPage({ session, profile }) {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [{ data: its }, { data: cats }, { data: profs }] = await Promise.all([
        fetchItems(),
        fetchCategories(),
        supabase.from('profiles').select('*'),
      ])
      setItems(its || [])
      setCategories(cats || [])
      setProfiles(profs || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div style={{ padding: '80px', textAlign: 'center', color: '#a89080', fontFamily: 'DM Sans, sans-serif' }}>Laster dashboard…</div>

  const getCat = (id) => categories.find(c => c.id === id) || { label: 'Annet', emoji: '📦' }

  // ── Analytics ──
  // 1. Items per category
  const byCat = categories.map(c => ({
    name: `${c.emoji} ${c.label}`,
    antall: items.filter(i => i.category_id === c.id).length,
  })).filter(x => x.antall > 0).sort((a, b) => b.antall - a.antall)

  // 2. Interest per person
  const byPerson = profiles.map(p => ({
    name: p.display_name,
    color: p.avatar_color || '#8c7b6b',
    interesser: items.filter(i => i.interests?.some(x => x.user_id === p.user_id)).length,
  })).sort((a, b) => b.interesser - a.interesser)

  // 3. Contested items (>1 interest)
  const contested = items.filter(i => i.interests?.length > 1)
    .sort((a, b) => b.interests.length - a.interests.length)
    .slice(0, 5)

  // 4. Unwanted items
  const unwanted = items.filter(i => !i.interests?.length)

  // 5. Pie: resolved vs unresolved
  const resolved = items.filter(i => i.interests?.length === 1).length
  const pieData = [
    { name: 'Én interessert', value: resolved },
    { name: 'Ingen interessert', value: unwanted.length },
    { name: 'Konkurranse', value: contested.length },
    { name: 'Resten', value: Math.max(0, items.length - resolved - unwanted.length - contested.length) },
  ].filter(d => d.value > 0)

  // 6. Most interested person
  const myInterests = items.filter(i => i.interests?.some(x => x.user_id === session.user.id))

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 16px', fontFamily: 'DM Sans, sans-serif' }}>
      <h1 style={{ fontFamily: 'Lora, serif', fontSize: '26px', fontWeight: '400', color: '#2a1f14', marginBottom: '8px' }}>Dashboard</h1>
      <p style={{ color: '#8c7b6b', marginBottom: '32px', fontSize: '15px' }}>Oversikt og analyser for familiens gjenstander</p>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '36px' }}>
        {[
          { v: items.length, l: 'Totalt', emoji: '📦', sub: 'gjenstander' },
          { v: contested.length, l: 'Konflikt', emoji: '⚔️', sub: 'to+ interesserte', warn: contested.length > 0 },
          { v: unwanted.length, l: 'Uten interesse', emoji: '😔', sub: 'ingen vil ha dem' },
          { v: resolved, l: 'Avklart', emoji: '✅', sub: 'én interessert' },
          { v: myInterests.length, l: 'Mine', emoji: '❤️', sub: 'interesser' },
        ].map(s => (
          <div key={s.l} style={{ background: '#fff', border: `1px solid ${s.warn ? '#e8c4a0' : '#e8e0d6'}`, borderRadius: '10px', padding: '18px 16px' }}>
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>{s.emoji}</div>
            <div style={{ fontSize: '28px', color: s.warn ? '#c4855a' : '#2a1f14', fontFamily: 'Lora, serif' }}>{s.v}</div>
            <div style={{ fontSize: '13px', color: '#2a1f14', fontWeight: '500', marginTop: '2px' }}>{s.l}</div>
            <div style={{ fontSize: '11px', color: '#a89080', marginTop: '2px' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Bar: by category */}
        <ChartCard title="Gjenstander per kategori" emoji="🗂️">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byCat} margin={{ top: 0, right: 0, bottom: 40, left: -20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8c7b6b' }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11, fill: '#8c7b6b' }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontFamily: 'DM Sans', fontSize: 13, borderRadius: 8, border: '1px solid #e8e0d6' }} />
              <Bar dataKey="antall" fill="#c4855a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Pie: status */}
        <ChartCard title="Status fordeling" emoji="🥧">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontFamily: 'DM Sans', fontSize: 13, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'DM Sans' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Bar: by person */}
        <ChartCard title="Interesser per person" emoji="👥">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byPerson} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#8c7b6b' }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#2a1f14' }} width={70} />
              <Tooltip contentStyle={{ fontFamily: 'DM Sans', fontSize: 13, borderRadius: 8 }} />
              <Bar dataKey="interesser" radius={[0, 4, 4, 0]}>
                {byPerson.map((p, i) => <Cell key={i} fill={p.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Contested items list */}
        <ChartCard title="🔥 Ettertraktede gjenstander" emoji="">
          {contested.length === 0 ? (
            <p style={{ color: '#b0a090', fontSize: '14px', fontStyle: 'italic', padding: '20px 0' }}>Ingen konflikter ennå – bra!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {contested.map((item, i) => {
                const cat = getCat(item.category_id)
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: i === 0 ? '#fef3e8' : '#faf7f3', borderRadius: '8px', border: `1px solid ${i === 0 ? '#e8c4a0' : '#e8e0d6'}` }}>
                    <span style={{ fontSize: '20px' }}>{cat.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', color: '#2a1f14', fontWeight: '500' }}>{item.title}</div>
                      <div style={{ display: 'flex', gap: '3px', marginTop: '4px' }}>
                        {item.interests.map(x => (
                          <div key={x.id} title={x.profiles?.display_name} style={{ width: '20px', height: '20px', borderRadius: '50%', background: x.profiles?.avatar_color || '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#fff', fontWeight: '600' }}>
                            {(x.profiles?.display_name || '?')[0]}
                          </div>
                        ))}
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#c4855a', fontWeight: '500' }}>{item.interests.length} vil ha</span>
                  </div>
                )
              })}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Unwanted items */}
      {unwanted.length > 0 && (
        <ChartCard title="😔 Ingen vil ha disse" emoji="">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {unwanted.map(item => {
              const cat = getCat(item.category_id)
              return (
                <div key={item.id} style={{ padding: '8px 14px', background: '#faf7f3', border: '1px solid #e8e0d6', borderRadius: '8px', fontSize: '13px', color: '#6b5c4c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{cat.emoji}</span> {item.title}
                </div>
              )
            })}
          </div>
        </ChartCard>
      )}
    </div>
  )
}

function ChartCard({ title, emoji, children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e8e0d6', borderRadius: '12px', padding: '24px' }}>
      <h3 style={{ fontFamily: 'Lora, serif', fontSize: '16px', fontWeight: '400', color: '#2a1f14', marginBottom: '20px' }}>
        {emoji && <span style={{ marginRight: '8px' }}>{emoji}</span>}{title}
      </h3>
      {children}
    </div>
  )
}
