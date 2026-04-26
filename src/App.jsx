import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import ItemDetailPage from './pages/ItemDetailPage'
import AddItemPage from './pages/AddItemPage'
import DashboardPage from './pages/DashboardPage'
import ProfileSetupPage from './pages/ProfileSetupPage'
import CategoriesPage from './pages/CategoriesPage'
import TopBar from './components/TopBar'
import Toast from './components/Toast'

export const ToastContext = { show: null }

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [profile, setProfile] = useState(null)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (!s) setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session?.user) return
    supabase.from('profiles').select('*').eq('user_id', session.user.id).single()
      .then(({ data }) => {
        setProfile(data)
        if (!data?.display_name) navigate('/setup')
      })
  }, [session])

  if (session === undefined) return <Loader />

  if (!session) return <LoginPage onToast={showToast} />

  return (
    <div style={{ minHeight: '100vh', background: '#f7f3ee' }}>
      <TopBar profile={profile} session={session} onToast={showToast} />
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <Routes>
        <Route path="/" element={<HomePage session={session} profile={profile} onToast={showToast} />} />
        <Route path="/item/:id" element={<ItemDetailPage session={session} profile={profile} onToast={showToast} />} />
        <Route path="/add" element={<AddItemPage session={session} profile={profile} onToast={showToast} />} />
        <Route path="/dashboard" element={<DashboardPage session={session} profile={profile} />} />
        <Route path="/categories" element={<CategoriesPage session={session} onToast={showToast} />} />
        <Route path="/setup" element={<ProfileSetupPage session={session} onSaved={(p) => { setProfile(p); navigate('/') }} onToast={showToast} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

function Loader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f3ee', fontFamily: 'Lora, serif', color: '#8c7b6b', fontSize: '18px' }}>
      🏡 Laster…
    </div>
  )
}
