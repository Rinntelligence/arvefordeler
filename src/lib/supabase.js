import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Auth helpers ──────────────────────────────────────────────────────────────
export const signInWithMagicLink = (email) =>
  supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })

export const signOut = () => supabase.auth.signOut()

export const getSession = () => supabase.auth.getSession()

// ── Items ─────────────────────────────────────────────────────────────────────
export const fetchItems = () =>
  supabase.from('items').select('*, interests(*, profiles(display_name, avatar_color))').order('created_at', { ascending: false })

export const insertItem = (item) =>
  supabase.from('items').insert(item).select().single()

export const deleteItem = (id) =>
  supabase.from('items').delete().eq('id', id)

// ── Interests ─────────────────────────────────────────────────────────────────
export const addInterest = (item_id, user_id, reason) =>
  supabase.from('interests').insert({ item_id, user_id, reason }).select().single()

export const removeInterest = (item_id, user_id) =>
  supabase.from('interests').delete().eq('item_id', item_id).eq('user_id', user_id)

// ── Categories ────────────────────────────────────────────────────────────────
export const fetchCategories = () =>
  supabase.from('categories').select('*').order('label')

export const insertCategory = (cat) =>
  supabase.from('categories').insert(cat).select().single()

export const deleteCategory = (id) =>
  supabase.from('categories').delete().eq('id', id)

// ── Profile ───────────────────────────────────────────────────────────────────
export const fetchProfile = (user_id) =>
  supabase.from('profiles').select('*').eq('user_id', user_id).single()

export const upsertProfile = (profile) =>
  supabase.from('profiles').upsert(profile, { onConflict: 'user_id' }).select().single()

// ── Image upload ──────────────────────────────────────────────────────────────
export const uploadImage = async (file, itemId) => {
  const ext = file.name.split('.').pop()
  const path = `items/${itemId}-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('item-images').upload(path, file, { upsert: true })
  if (error) throw error
  const { data } = supabase.storage.from('item-images').getPublicUrl(path)
  return data.publicUrl
}
